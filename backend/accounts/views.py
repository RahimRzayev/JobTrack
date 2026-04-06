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


def _send_verification_email(email, code, first_name=''):
    """Send a professional HTML verification email."""
    name = first_name or 'there'
    html = f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:0;">
      <div style="background:#e8634a;padding:24px 32px;border-radius:12px 12px 0 0;">
        <span style="display:inline-block;background:#fff;color:#e8634a;font-weight:900;font-size:14px;width:32px;height:32px;line-height:32px;text-align:center;border-radius:8px;">JT</span>
        <span style="color:#fff;font-weight:700;font-size:18px;margin-left:10px;vertical-align:middle;">JobTrack AI</span>
      </div>
      <div style="background:#ffffff;padding:32px;border:1px solid #e8e0d6;border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#1e1c18;">Verify your email</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b6560;line-height:1.5;">Hi {name}, use the code below to verify your email address and activate your account.</p>
        <div style="background:#faf8f5;border:1px solid #e8e0d6;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-family:monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#1e1c18;">{code}</span>
        </div>
        <p style="margin:0 0 4px;font-size:12px;color:#9b9590;">This code expires in <strong>1 hour</strong>.</p>
        <p style="margin:0;font-size:12px;color:#9b9590;">If you didn't create a JobTrack account, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e8e0d6;margin:24px 0 16px;" />
        <p style="margin:0;font-size:11px;color:#b5b0ab;text-align:center;">JobTrack AI &mdash; Your intelligent job search companion</p>
      </div>
    </div>
    """
    plain = f"Hi {name},\n\nYour JobTrack verification code is: {code}\n\nThis code expires in 1 hour.\n\nIf you didn't create a JobTrack account, you can safely ignore this email.\n\n— JobTrack AI"
    send_mail(
        'Verify your JobTrack account',
        plain,
        'noreply@jobtrack.ai',
        [email],
        html_message=html,
        fail_silently=True,
    )


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

        _send_verification_email(user.email, code, user.first_name)

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
            _send_verification_email(user.email, code, user.first_name)
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


class ResendCodeView(APIView):
    """Resend email verification code."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'detail': 'Code sent if account exists.'})

        code = str(random.randint(100000, 999999))
        cache.set(f"email_verify_{user.email.lower()}", code, timeout=3600)
        _send_verification_email(user.email, code, user.first_name)
        return Response({'detail': 'Code sent if account exists.'})


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



