from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import JobApplication

User = get_user_model()


class JobApplicationModelTest(TestCase):
    """Tests for the JobApplication model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='model@test.com', password='TestPass1!',
            first_name='M', last_name='T', is_verified=True,
        )

    def test_create_job(self):
        job = JobApplication.objects.create(
            user=self.user, company='Google', position='SWE',
            status='wishlist',
        )
        self.assertEqual(job.company, 'Google')
        self.assertEqual(job.status, 'wishlist')
        self.assertIsNone(job.match_score)

    def test_str_representation(self):
        job = JobApplication.objects.create(
            user=self.user, company='Meta', position='PM',
            status='applied',
        )
        self.assertIn('Meta', str(job))
        self.assertIn('PM', str(job))

    def test_default_ordering(self):
        j1 = JobApplication.objects.create(user=self.user, company='A', position='P1')
        j2 = JobApplication.objects.create(user=self.user, company='B', position='P2')
        jobs = list(JobApplication.objects.filter(user=self.user))
        self.assertEqual(jobs[0].id, j2.id)  # most recently updated first


class JobCRUDViewTest(TestCase):
    """Tests for Job CRUD endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='crud@test.com', password='TestPass1!',
            first_name='C', last_name='R', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/jobs/'

    def test_create_job(self):
        resp = self.client.post(self.url, {
            'company': 'TestCorp',
            'position': 'Developer',
            'status': 'wishlist',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['company'], 'TestCorp')

    def test_list_jobs(self):
        JobApplication.objects.create(user=self.user, company='A', position='P1')
        JobApplication.objects.create(user=self.user, company='B', position='P2')
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)

    def test_retrieve_job(self):
        job = JobApplication.objects.create(
            user=self.user, company='Detail', position='Eng',
        )
        resp = self.client.get(f'{self.url}{job.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['company'], 'Detail')

    def test_update_job(self):
        job = JobApplication.objects.create(
            user=self.user, company='Old', position='Eng', status='wishlist',
        )
        resp = self.client.patch(f'{self.url}{job.id}/', {'status': 'applied'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, 'applied')

    def test_delete_job(self):
        job = JobApplication.objects.create(
            user=self.user, company='Del', position='Eng',
        )
        resp = self.client.delete(f'{self.url}{job.id}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(JobApplication.objects.filter(id=job.id).exists())

    def test_filter_by_status(self):
        JobApplication.objects.create(user=self.user, company='A', position='P', status='wishlist')
        JobApplication.objects.create(user=self.user, company='B', position='P', status='applied')
        resp = self.client.get(self.url, {'status': 'applied'})
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['status'], 'applied')

    def test_search_jobs(self):
        JobApplication.objects.create(user=self.user, company='Google', position='SWE')
        JobApplication.objects.create(user=self.user, company='Meta', position='PM')
        resp = self.client.get(self.url, {'search': 'Google'})
        self.assertEqual(len(resp.data), 1)

    def test_user_isolation(self):
        """Users cannot see other users' jobs."""
        other = User.objects.create_user(
            email='other@test.com', password='TestPass1!',
            first_name='O', last_name='T', is_verified=True,
        )
        JobApplication.objects.create(user=other, company='Secret', position='Hidden')
        resp = self.client.get(self.url)
        self.assertEqual(len(resp.data), 0)

    def test_unauthenticated_access(self):
        client = APIClient()
        resp = client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class DashboardAnalyticsTest(TestCase):
    """Tests for the analytics endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='analytics@test.com', password='TestPass1!',
            first_name='A', last_name='N', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/analytics/dashboard/'

    def test_empty_analytics(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['total'], 0)
        self.assertIsNone(resp.data['average_match_score'])

    def test_analytics_with_data(self):
        JobApplication.objects.create(
            user=self.user, company='A', position='P', status='applied', match_score=75,
        )
        JobApplication.objects.create(
            user=self.user, company='B', position='P', status='wishlist', match_score=85,
        )
        resp = self.client.get(self.url)
        self.assertEqual(resp.data['total'], 2)
        self.assertEqual(resp.data['average_match_score'], 80.0)
        self.assertIn('applied', resp.data['status_counts'])


class ScrapeJobTest(TestCase):
    """Tests for the scrape endpoint validation."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='scrape@test.com', password='TestPass1!',
            first_name='S', last_name='C', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/jobs/scrape/'

    def test_scrape_missing_url(self):
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class DownloadCoverLetterTest(TestCase):
    """Tests for the cover letter PDF download endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='dl@test.com', password='TestPass1!',
            first_name='D', last_name='L', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/jobs/download-cover-letter/'

    def test_download_missing_text(self):
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_download_success(self):
        resp = self.client.post(self.url, {
            'cover_letter': 'Dear Hiring Manager, I am writing to apply...',
            'company': 'TestCorp',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'application/pdf')
