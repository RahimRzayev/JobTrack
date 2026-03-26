from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    """Serializer for JobApplication model."""

    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = JobApplication
        fields = (
            'id', 'company', 'position', 'url', 'location',
            'status', 'status_display', 'description', 'notes', 'deadline',
            'date_applied', 'match_score', 'calendar_event_id',
            'interview_datetime', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'match_score', 'calendar_event_id', 'created_at', 'updated_at')

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in JobApplication.Status.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError(f'Invalid status. Must be one of: {valid_statuses}')
        return value
