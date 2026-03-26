from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
            
        password = attrs['password']
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one uppercase letter.'})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one lowercase letter.'})
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one number.'})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one special character.'})
            
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""
    cv_pdf = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'date_joined', 'cv_pdf')
        read_only_fields = ('id', 'email', 'date_joined')

    def get_cv_pdf(self, obj):
        """Return the full URL to the PDF or None."""
        try:
            profile = obj.profile
        except Exception:
            return None
        if not profile or not profile.cv_pdf:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(profile.cv_pdf.url)
        return profile.cv_pdf.url

    def update(self, instance, validated_data):
        # Pop nested profile data if present (won't be for FileField)
        validated_data.pop('profile', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle cv_pdf file upload directly from request.FILES
        request = self.context.get('request')
        if request and 'cv_pdf' in request.FILES:
            from accounts.models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.cv_pdf = request.FILES['cv_pdf']
            profile.save()

        return instance
