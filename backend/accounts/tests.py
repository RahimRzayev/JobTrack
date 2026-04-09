from django.test import TestCase
from django.core.cache import cache
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserModelTest(TestCase):
    """Tests for the custom User model."""

    def test_create_user(self):
        user = User.objects.create_user(
            email='test@example.com', password='TestPass1!',
            first_name='Test', last_name='User',
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('TestPass1!'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_verified)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email='admin@example.com', password='AdminPass1!',
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_email_is_required(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='TestPass1!')

    def test_str_representation(self):
        user = User.objects.create_user(email='str@test.com', password='TestPass1!')
        self.assertEqual(str(user), 'str@test.com')


class RegisterViewTest(TestCase):
    """Tests for the registration endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/register/'

    def test_register_success(self):
        resp = self.client.post(self.url, {
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.data.get('requires_verification'))
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    def test_register_password_mismatch(self):
        resp = self.client.post(self.url, {
            'email': 'mismatch@example.com',
            'first_name': 'A', 'last_name': 'B',
            'password': 'StrongPass1!',
            'password_confirm': 'Different1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        resp = self.client.post(self.url, {
            'email': 'weak@example.com',
            'first_name': 'A', 'last_name': 'B',
            'password': 'simple',
            'password_confirm': 'simple',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_verified_email(self):
        User.objects.create_user(
            email='dup@example.com', password='StrongPass1!',
            first_name='A', last_name='B', is_verified=True,
        )
        resp = self.client.post(self.url, {
            'email': 'dup@example.com',
            'first_name': 'C', 'last_name': 'D',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_replaces_unverified_account(self):
        User.objects.create_user(
            email='unverified@example.com', password='OldPass1!',
            first_name='Old', last_name='User', is_verified=False,
        )
        resp = self.client.post(self.url, {
            'email': 'unverified@example.com',
            'first_name': 'New', 'last_name': 'User',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class LoginViewTest(TestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/login/'
        self.user = User.objects.create_user(
            email='login@example.com', password='TestPass1!',
            first_name='Login', last_name='User', is_verified=True,
        )

    def test_login_success(self):
        resp = self.client.post(self.url, {
            'email': 'login@example.com', 'password': 'TestPass1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)
        self.assertIn('access', resp.data['tokens'])

    def test_login_wrong_password(self):
        resp = self.client.post(self.url, {
            'email': 'login@example.com', 'password': 'WrongPass1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unverified_user(self):
        User.objects.create_user(
            email='noverify@example.com', password='TestPass1!',
            first_name='No', last_name='Verify', is_verified=False,
        )
        resp = self.client.post(self.url, {
            'email': 'noverify@example.com', 'password': 'TestPass1!',
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(resp.data.get('email_unverified'))


class VerifyEmailViewTest(TestCase):
    """Tests for email verification."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/verify-email/'
        self.user = User.objects.create_user(
            email='verify@example.com', password='TestPass1!',
            first_name='V', last_name='U', is_verified=False,
        )
        cache.set('email_verify_verify@example.com', '123456', timeout=3600)

    def tearDown(self):
        cache.clear()

    def test_verify_success(self):
        resp = self.client.post(self.url, {
            'email': 'verify@example.com', 'code': '123456',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)

    def test_verify_wrong_code(self):
        resp = self.client.post(self.url, {
            'email': 'verify@example.com', 'code': '000000',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_missing_fields(self):
        resp = self.client.post(self.url, {'email': 'verify@example.com'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileViewTest(TestCase):
    """Tests for the authenticated profile endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='profile@example.com', password='TestPass1!',
            first_name='Pro', last_name='File', is_verified=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'profile@example.com')

    def test_unauthenticated_profile(self):
        client = APIClient()
        resp = client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
