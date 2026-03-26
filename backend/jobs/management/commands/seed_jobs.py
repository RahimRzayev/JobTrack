from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import JobApplication
from datetime import date, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with 5 sample job applications'

    def handle(self, *args, **options):
        # Create a test user if it doesn't exist
        user, created = User.objects.get_or_create(
            email='demo@jobtrack.ai',
            defaults={
                'first_name': 'Demo',
                'last_name': 'User',
            }
        )
        if created:
            user.set_password('demo1234')
            user.save()
            self.stdout.write(self.style.SUCCESS(
                'Created demo user: demo@jobtrack.ai / demo1234'
            ))

        sample_jobs = [
            {
                'company': 'Google',
                'position': 'Software Engineering Intern',
                'url': 'https://careers.google.com/jobs/results/',
                'location': 'Mountain View, CA',
                'status': 'applied',
                'notes': 'Applied through university career portal. Referral from alumni contact.',
                'deadline': date.today() + timedelta(days=30),
                'date_applied': date.today() - timedelta(days=5),
                'match_score': 82,
            },
            {
                'company': 'Microsoft',
                'position': 'Product Manager Intern',
                'url': 'https://careers.microsoft.com/',
                'location': 'Redmond, WA',
                'status': 'interviewing',
                'notes': 'Phone screen completed. Technical interview scheduled.',
                'deadline': date.today() + timedelta(days=14),
                'date_applied': date.today() - timedelta(days=15),
                'match_score': 68,
            },
            {
                'company': 'Stripe',
                'position': 'Backend Engineer Intern',
                'url': 'https://stripe.com/jobs',
                'location': 'San Francisco, CA',
                'status': 'wishlist',
                'notes': 'Great company culture. Need to tailor resume for fintech.',
                'deadline': date.today() + timedelta(days=45),
                'date_applied': None,
            },
            {
                'company': 'Spotify',
                'position': 'Data Science Intern',
                'url': 'https://www.lifeatspotify.com/jobs',
                'location': 'Stockholm, Sweden (Remote)',
                'status': 'offer',
                'notes': 'Received offer! Competitive salary. Need to respond by deadline.',
                'deadline': date.today() + timedelta(days=7),
                'date_applied': date.today() - timedelta(days=30),
                'match_score': 91,
            },
            {
                'company': 'Amazon',
                'position': 'Cloud Support Engineer Intern',
                'url': 'https://www.amazon.jobs/',
                'location': 'Seattle, WA',
                'status': 'rejected',
                'notes': 'Rejected after final round. Feedback: need more AWS experience.',
                'deadline': date.today() - timedelta(days=10),
                'date_applied': date.today() - timedelta(days=40),
                'match_score': 45,
            },
        ]

        created_count = 0
        for job_data in sample_jobs:
            _, created = JobApplication.objects.get_or_create(
                user=user,
                company=job_data['company'],
                position=job_data['position'],
                defaults=job_data,
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {created_count} job applications for {user.email}'
        ))
