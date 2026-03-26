from django.db import models
from django.conf import settings


class JobApplication(models.Model):
    """Model representing a job application tracked by a user."""

    class Status(models.TextChoices):
        WISHLIST = 'wishlist', 'Wishlist'
        APPLIED = 'applied', 'Applied'
        INTERVIEWING = 'interviewing', 'Interviewing'
        OFFER = 'offer', 'Offer'
        REJECTED = 'rejected', 'Rejected'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_applications',
    )
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    url = models.URLField(max_length=2000, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.WISHLIST,
    )
    description = models.TextField(blank=True, default='', help_text="Stored full job description scraped or manually entered.")
    notes = models.TextField(blank=True, default='')
    deadline = models.DateField(null=True, blank=True)
    date_applied = models.DateField(null=True, blank=True)
    match_score = models.IntegerField(null=True, blank=True)
    calendar_event_id = models.CharField(max_length=255, blank=True, default='')
    interview_datetime = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.company} — {self.position} ({self.get_status_display()})"
