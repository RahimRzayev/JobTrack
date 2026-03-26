from rest_framework import serializers


class MatchScoreSerializer(serializers.Serializer):
    """Serializer for AI match score request."""

    resume_text = serializers.CharField()
    job_description = serializers.CharField()


class CoverLetterSerializer(serializers.Serializer):
    """Serializer for AI cover letter generation request."""

    job_description = serializers.CharField()
    tone = serializers.ChoiceField(
        choices=[('formal', 'Formal'), ('friendly', 'Friendly')],
        default='formal',
        required=False,
    )


class ScrapeJobUrlSerializer(serializers.Serializer):
    """Serializer for AI job scraping request."""

    url = serializers.URLField()
