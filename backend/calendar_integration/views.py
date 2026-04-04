import logging
import requests
from django.conf import settings
from django.shortcuts import redirect
from decouple import config as decouple_config
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from jobs.models import JobApplication

logger = logging.getLogger(__name__)


class GoogleCalendarCallbackView(APIView):
    """
    GET /api/calendar/callback/
    Callback URL where Google redirects back with the code.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        code = request.query_params.get('code')
        state = request.query_params.get('state') # User ID is passed in state

        if not code or not state:
            return Response({'error': 'Missing code or state'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Exchange code for token directly via API to avoid PKCE mismatch bugs
            token_response = requests.post('https://oauth2.googleapis.com/token', data={
                'code': code,
                'client_id': settings.GOOGLE_CALENDAR_CLIENT_ID,
                'client_secret': settings.GOOGLE_CALENDAR_CLIENT_SECRET,
                'redirect_uri': settings.GOOGLE_CALENDAR_REDIRECT_URI,
                'grant_type': 'authorization_code'
            })
            token_data = token_response.json()

            if 'error' in token_data:
                logger.error(f"Google token error: {token_data}")
                return Response({'error': f"Google refused code: {token_data.get('error_description', token_data['error'])}"}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve user from state parameter
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=state)

            profile = user.profile
            profile.google_access_token = token_data['access_token']
            profile.google_refresh_token = token_data.get('refresh_token', profile.google_refresh_token)
            profile.save()

            # Redirect to frontend using environment configuration
            frontend_url = decouple_config('FRONTEND_URL', default='http://localhost:5173')
            return redirect(f'{frontend_url}/kanban')
        except Exception as e:
            import traceback
            # Only expose internal details in debug mode
            response_data = {'error': 'Failed to process authorization callback'}
            if settings.DEBUG:
                response_data.update({
                    'details': str(e),
                    'traceback': traceback.format_exc()
                })
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


class ScheduleInterviewView(APIView):
    """
    POST /api/calendar/schedule/
    Schedule an interview on Google Calendar.
    Accepts: job_id, interview_datetime
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        interview_datetime = request.data.get('interview_datetime')

        if not job_id or not interview_datetime:
            return Response({'error': 'Both job_id and interview_datetime are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate datetime format and that it's in the future
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(interview_datetime.replace('Z', ''))
            if dt < datetime.now():
                return Response({'error': 'Interview datetime must be in the future.'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, AttributeError):
            return Response({'error': 'Invalid datetime format. Use ISO 8601 format (e.g., 2026-04-15T14:30:00Z).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobApplication.objects.get(id=job_id, user=request.user)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Job application not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile = request.user.profile
        if not profile.google_access_token:
            # Need auth! Generate auth URL, passing user ID in state so the callback knows who to save token to
            import urllib.parse
            qs = urllib.parse.urlencode({
                'client_id': settings.GOOGLE_CALENDAR_CLIENT_ID,
                'redirect_uri': settings.GOOGLE_CALENDAR_REDIRECT_URI,
                'response_type': 'code',
                'scope': 'https://www.googleapis.com/auth/calendar.events',
                'access_type': 'offline',
                'prompt': 'consent',
                'state': str(request.user.id)
            })
            auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{qs}"
            
            return Response({
                'error': 'Google Calendar needs to be connected.',
                'auth_url': auth_url
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            from datetime import datetime, timedelta

            creds = Credentials(
                token=profile.google_access_token,
                refresh_token=profile.google_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CALENDAR_CLIENT_ID,
                client_secret=settings.GOOGLE_CALENDAR_CLIENT_SECRET,
            )
            
            # If the token was refreshed, save the new one
            if creds.token and creds.token != profile.google_access_token:
                profile.google_access_token = creds.token
                profile.save()

            service = build('calendar', 'v3', credentials=creds)
            dt = datetime.fromisoformat(interview_datetime.replace('Z', ''))

            event = {
                'summary': f'Interview: {job.position} at {job.company}',
                'description': f'Interview for {job.position} position at {job.company}.\n\nJob URL: {job.url}',
                'start': {'dateTime': dt.isoformat() + 'Z', 'timeZone': 'UTC'},
                'end': {'dateTime': (dt + timedelta(hours=1)).isoformat() + 'Z', 'timeZone': 'UTC'},
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
                'message': 'Interview scheduled successfully.',
                'event_id': created_event.get('id'),
                'event_link': created_event.get('htmlLink'),
            })

        except Exception as e:
            logger.error(f"Calendar API error: {e}")
            if "invalid_grant" in str(e) or "Refresh Error" in str(e):
                profile.google_access_token = None
                profile.google_refresh_token = None
                profile.save()
                return Response({'error': 'Google token expired. Please interact to re-authorize.'}, status=status.HTTP_401_UNAUTHORIZED)

            return Response(
                {'error': 'Failed to create calendar event.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
