import logging
import urllib.parse
from datetime import datetime, timedelta, timezone as dt_timezone

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.shortcuts import redirect
from django.utils import timezone
from decouple import config as decouple_config
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserProfile
from jobs.models import JobApplication

User = get_user_model()
logger = logging.getLogger(__name__)


def _get_user_calendar_service(profile: UserProfile) -> build:
    """Build a Google Calendar service using the user's stored OAuth tokens."""
    creds = Credentials(
        token=profile.google_access_token,
        refresh_token=profile.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CALENDAR_CLIENT_ID,
        client_secret=settings.GOOGLE_CALENDAR_CLIENT_SECRET,
    )

    service = build('calendar', 'v3', credentials=creds)

    # If the token was refreshed, persist the new access token
    if creds.token and creds.token != profile.google_access_token:
        profile.google_access_token = creds.token
        profile.save()

    return service


class GoogleCalendarCallbackView(APIView):
    """
    GET /api/calendar/callback/
    Handles the OAuth redirect from Google after the user grants calendar access.
    This only happens once per user.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        state = request.query_params.get('state')

        if not code or not state:
            return Response({'error': 'Missing code or state'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the signed state token to get the user ID securely
            user_id = signing.loads(state, max_age=600)  # 10-minute expiry
        except signing.BadSignature:
            return Response({'error': 'Invalid or expired state token.'}, status=status.HTTP_400_BAD_REQUEST)

        # Exchange authorization code for tokens
        token_response = requests.post('https://oauth2.googleapis.com/token', data={
            'code': code,
            'client_id': settings.GOOGLE_CALENDAR_CLIENT_ID,
            'client_secret': settings.GOOGLE_CALENDAR_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_CALENDAR_REDIRECT_URI,
            'grant_type': 'authorization_code',
        })
        token_data = token_response.json()

        if 'error' in token_data:
            logger.error(f"Google token error: {token_data}")
            return Response(
                {'error': f"Google refused code: {token_data.get('error_description', token_data['error'])}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.google_access_token = token_data['access_token']
        profile.google_refresh_token = token_data.get('refresh_token', profile.google_refresh_token)
        profile.save()

        # Redirect back to the frontend
        frontend_url = decouple_config('FRONTEND_URL', default='http://localhost:5173')
        return redirect(f'{frontend_url}/kanban')


class ScheduleInterviewView(APIView):
    """
    POST /api/calendar/schedule/
    Schedule an interview on the user's Google Calendar.
    If the user hasn't connected their calendar yet, returns an auth_url
    for a one-time OAuth consent.
    Accepts: job_id, interview_datetime
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        interview_datetime = request.data.get('interview_datetime')

        if not job_id or not interview_datetime:
            return Response({'error': 'Both job_id and interview_datetime are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate datetime
        try:
            raw = interview_datetime.replace('Z', '+00:00')
            dt = datetime.fromisoformat(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=dt_timezone.utc)
            if dt < timezone.now():
                return Response({'error': 'Interview datetime must be in the future.'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, AttributeError):
            return Response({'error': 'Invalid datetime format. Use ISO 8601 format (e.g., 2026-04-15T14:30:00Z).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobApplication.objects.get(id=job_id, user=request.user)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Job application not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user has connected Google Calendar
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if not profile.google_access_token:
            # First time — send them to Google for one-time consent
            qs = urllib.parse.urlencode({
                'client_id': settings.GOOGLE_CALENDAR_CLIENT_ID,
                'redirect_uri': settings.GOOGLE_CALENDAR_REDIRECT_URI,
                'response_type': 'code',
                'scope': 'https://www.googleapis.com/auth/calendar.events',
                'access_type': 'offline',
                'prompt': 'consent',
                'state': signing.dumps(request.user.id),
            })
            auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{qs}"
            return Response({
                'error': 'Google Calendar not connected. Please authorize once.',
                'auth_url': auth_url,
            }, status=status.HTTP_401_UNAUTHORIZED)

        # User already authorized — create the event on their calendar
        try:
            service = _get_user_calendar_service(profile)

            event = {
                'summary': f'Interview: {job.position} at {job.company}',
                'description': f'Interview for {job.position} position at {job.company}.\n\nJob URL: {job.url}',
                'start': {'dateTime': dt.isoformat(), 'timeZone': 'UTC'},
                'end': {'dateTime': (dt + timedelta(hours=1)).isoformat(), 'timeZone': 'UTC'},
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 30},
                        {'method': 'email', 'minutes': 1440},
                    ],
                },
            }

            created_event = service.events().insert(calendarId='primary', body=event).execute()

            job.calendar_event_id = created_event.get('id', '')
            job.interview_datetime = dt
            job.save()

            return Response({
                'message': 'Interview scheduled and added to your Google Calendar.',
                'event_id': created_event.get('id'),
                'event_link': created_event.get('htmlLink'),
            })

        except Exception as e:
            logger.error(f"Calendar API error: {e}")
            # If token is expired/revoked, clear it so user re-authorizes next time
            if 'invalid_grant' in str(e).lower() or 'token' in str(e).lower():
                profile.google_access_token = None
                profile.google_refresh_token = None
                profile.save()
                return Response(
                    {'error': 'Google Calendar authorization expired. Please try again to re-authorize.'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            detail = str(e) if settings.DEBUG else 'Failed to create calendar event.'
            return Response({'error': detail}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class RemoveInterviewView(APIView):
    """
    POST /api/calendar/remove/
    Remove interview date and delete the Google Calendar event if it exists.
    Accepts: job_id
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobApplication.objects.get(id=job_id, user=request.user)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Job application not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Try to delete the Google Calendar event if one exists
        if job.calendar_event_id:
            try:
                profile = UserProfile.objects.get(user=request.user)
                if profile.google_access_token:
                    service = _get_user_calendar_service(profile)
                    service.events().delete(calendarId='primary', eventId=job.calendar_event_id).execute()
            except Exception as e:
                logger.warning(f"Could not delete calendar event {job.calendar_event_id}: {e}")

        # Clear interview data regardless of calendar deletion outcome
        job.calendar_event_id = ''
        job.interview_datetime = None
        job.save()

        return Response({'message': 'Interview removed successfully.'})
