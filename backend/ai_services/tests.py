from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import UserProfile

User = get_user_model()


class MatchScoreViewTest(TestCase):
    """Tests for the AI match score endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='ai@test.com', password='TestPass1!',
            first_name='A', last_name='I', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/ai/match-score/'

    def test_missing_fields(self):
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_resume(self):
        resp = self.client.post(self.url, {'job_description': 'Some job'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_job_description(self):
        resp = self.client.post(self.url, {'resume_text': 'Some resume'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('ai_services.views.call_gemini')
    def test_match_score_success(self, mock_gemini):
        mock_gemini.return_value = '{"score": 72, "strengths": ["Python"], "gaps": ["Java"]}'
        resp = self.client.post(self.url, {
            'resume_text': 'Experienced Python developer',
            'job_description': 'Looking for Python and Java developer',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['score'], 72)
        self.assertIn('Python', resp.data['strengths'])

    @patch('ai_services.views.call_gemini')
    def test_match_score_clamps_to_100(self, mock_gemini):
        mock_gemini.return_value = '{"score": 150, "strengths": [], "gaps": []}'
        resp = self.client.post(self.url, {
            'resume_text': 'Resume', 'job_description': 'Job',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['score'], 100)

    @patch('ai_services.views.call_gemini')
    def test_match_score_invalid_json(self, mock_gemini):
        mock_gemini.return_value = 'This is not JSON'
        resp = self.client.post(self.url, {
            'resume_text': 'Resume', 'job_description': 'Job',
        })
        self.assertEqual(resp.status_code, status.HTTP_502_BAD_GATEWAY)

    @patch('ai_services.views.call_gemini')
    def test_match_score_timeout(self, mock_gemini):
        mock_gemini.side_effect = TimeoutError('API timeout')
        resp = self.client.post(self.url, {
            'resume_text': 'Resume', 'job_description': 'Job',
        })
        self.assertEqual(resp.status_code, status.HTTP_504_GATEWAY_TIMEOUT)

    def test_unauthenticated_access(self):
        client = APIClient()
        resp = client.post(self.url, {
            'resume_text': 'Resume', 'job_description': 'Job',
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class CoverLetterViewTest(TestCase):
    """Tests for the AI cover letter endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='cover@test.com', password='TestPass1!',
            first_name='C', last_name='L', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/ai/cover-letter/'

    def test_missing_fields(self):
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_no_cv_uploaded(self):
        resp = self.client.post(self.url, {
            'job_description': 'Looking for a developer',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('CV', resp.data.get('error', ''))

    @patch('ai_services.views.call_gemini')
    @patch('ai_services.views.extract_text_from_pdf')
    def test_cover_letter_success(self, mock_pdf, mock_gemini):
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        profile.cv_pdf = SimpleUploadedFile('cv.pdf', b'%PDF-1.4 fake content')
        profile.save()

        mock_pdf.return_value = 'Experienced Python developer with 5 years...'
        mock_gemini.return_value = 'Dear Hiring Manager, I am excited to apply...'

        resp = self.client.post(self.url, {
            'job_description': 'Senior Python Developer at Google',
            'tone': 'formal',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('cover_letter', resp.data)
        self.assertTrue(len(resp.data['cover_letter']) > 0)

    def test_unauthenticated_access(self):
        client = APIClient()
        resp = client.post(self.url, {'job_description': 'Job'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
