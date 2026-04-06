from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, LoginView, LogoutView, MeView, VerifyEmailView, ResendCodeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('resend-code/', ResendCodeView.as_view(), name='auth-resend-code'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
