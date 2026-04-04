from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
import random
from django.core.cache import cache
from django.core.mail import send_mail

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user and return JWT tokens."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Start verification flow instead of instant login
        code = str(random.randint(100000, 999999))
        cache.set(f"email_verify_{user.email.lower()}", code, timeout=3600)

        send_mail(
            'Verify your JobTrack Account',
            f'Your verification code is: {code}\n\nThis code will expire in 1 hour.',
            'noreply@jobtrack.ai',
            [user.email],
            fail_silently=True,
        )

        return Response({
            'user': UserSerializer(user).data,
            'message': 'Please verify your email to continue.',
            'requires_verification': True
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Log in a user with email and password, return JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if user is None:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not getattr(user, 'is_verified', False):
            # Regenerate code
            code = str(random.randint(100000, 999999))
            cache.set(f"email_verify_{user.email.lower()}", code, timeout=3600)
            send_mail(
                'Verify your JobTrack Account',
                f'Your new verification code is: {code}\n\nThis code will expire in 1 hour.',
                'noreply@jobtrack.ai',
                [user.email],
                fail_silently=True,
            )
            return Response(
                {'detail': 'Please verify your email first.', 'email_unverified': True},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({'detail': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_email = email.lower()
        cached_code = cache.get(f"email_verify_{user_email}")

        if not cached_code or str(cached_code) != str(code):
            return Response({'detail': 'Invalid or expired verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=user_email).first()
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_verified = True
        user.save()
        cache.delete(f"email_verify_{user_email}")

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })


class LogoutView(APIView):
    """Blacklist the refresh token to log out."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        # Ensure a UserProfile always exists for this user
        from accounts.models import UserProfile
        UserProfile.objects.get_or_create(user=user)
        return user



