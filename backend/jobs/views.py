import json
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Avg
from django.db.models.functions import TruncWeek
from django.http import FileResponse

from .utils import generate_cover_letter_pdf

from ai_services.gemini_client import call_gemini
from ai_services.scraper import scrape_job_url
from ai_services.pdf_extractor import extract_text_from_pdf
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on JobApplication.
    All queries are scoped to the authenticated user.
    """

    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company', 'position', 'location']
    ordering_fields = ['created_at', 'updated_at', 'deadline', 'company']

    def get_queryset(self):
        queryset = JobApplication.objects.filter(user=self.request.user)
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='match')
    def match(self, request, pk=None):
        """
        POST /api/jobs/{id}/match/
        Triggers AI analysis for a specific job card against a provided CV.
        """
        import logging
        import re
        logger = logging.getLogger(__name__)

        job = self.get_object()
        
        from accounts.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        cv_pdf = profile.cv_pdf if profile.cv_pdf else None
        if not cv_pdf:
            return Response({'error': 'No CV PDF found in your profile. Please upload one first.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user_cv_text = extract_text_from_pdf(cv_pdf)
        except ValueError as e:
            return Response({'error': f'Failed to read your CV PDF: {e}'}, status=status.HTTP_400_BAD_REQUEST)
        if not user_cv_text:
            return Response({'error': 'Your CV PDF appears to be empty or unreadable. Please upload a different PDF.'}, status=status.HTTP_400_BAD_REQUEST)

        # Clean CV text: collapse whitespace runs, remove stray special chars from PDF parsing
        user_cv_text = re.sub(r'[ \t]+', ' ', user_cv_text)
        user_cv_text = re.sub(r'\n{3,}', '\n\n', user_cv_text).strip()

        # Build job description — try stored description, then scrape URL, then minimal fallback
        job_description = (job.description or '').strip()

        if not job_description and job.url:
            try:
                scraped = scrape_job_url(job.url)
                if scraped and len(scraped) > 100:
                    job_description = scraped
                    job.description = scraped
                    job.save(update_fields=['description'])
                    logger.info(f"Auto-scraped description for job {job.id} from {job.url}")
            except Exception as e:
                logger.warning(f"Auto-scrape failed for job {job.id}: {e}")

        if not job_description:
            job_description = f"Position: {job.position}\nCompany: {job.company}\nLocation: {job.location or 'Not specified'}"
            if job.notes:
                job_description += f"\nAdditional context: {job.notes}"

        # Truncate inputs to keep within Gemini context limits
        user_cv_text = user_cv_text[:15000]
        job_description = job_description[:15000]

        prompt = f"""You are an expert technical recruiter and resume analyst performing a detailed candidate-job fit analysis.

CANDIDATE RESUME/CV:
---
{user_cv_text}
---

JOB DESCRIPTION:
---
{job_description}
---

ANALYSIS INSTRUCTIONS:
Evaluate the candidate against the job requirements across these categories. For each category, assign a score from 0-100 based on how well the candidate matches.

1. **Technical Skills** (weight: 35%) — Programming languages, frameworks, tools, platforms explicitly required.
2. **Experience Level** (weight: 25%) — Years of experience, seniority, leadership scope.
3. **Domain Knowledge** (weight: 20%) — Industry, product area, business domain relevance.
4. **Education & Certifications** (weight: 10%) — Degree requirements, certifications, specific qualifications.
5. **Soft Skills & Culture** (weight: 10%) — Communication, teamwork, values alignment if mentioned.

SCORING GUIDELINES:
- 85-100: Exceptional match — meets nearly all requirements, strong in most categories.
- 70-84: Strong match — meets most core requirements with minor gaps.
- 50-69: Moderate match — meets some requirements but has notable gaps.
- 30-49: Weak match — meets few requirements, significant skill gaps.
- 0-29: Poor match — fundamentally different profile from what's needed.

Be strict and realistic. Do NOT inflate scores. A generic resume with no overlap should score below 30.

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{{
    "score": <integer 0-100, the weighted overall score>,
    "category_scores": {{
        "technical_skills": <integer 0-100>,
        "experience_level": <integer 0-100>,
        "domain_knowledge": <integer 0-100>,
        "education": <integer 0-100>,
        "soft_skills": <integer 0-100>
    }},
    "matched_skills": ["<skill from CV that matches job requirement>", ...],
    "missing_keywords": ["<required skill/qualification NOT found in CV>", ...],
    "summary": "<2-3 sentence explanation of the overall fit>"
}}"""

        try:
            response_text = call_gemini(prompt)
            cleaned = response_text.strip()
            if cleaned.startswith('```'):
                cleaned = cleaned.split('\n', 1)[1]
                cleaned = cleaned.rsplit('```', 1)[0]
            result = json.loads(cleaned)

            if 'score' not in result:
                raise ValueError("Missing 'score' in AI response")

            result['score'] = max(0, min(100, int(result['score'])))
            result.setdefault('missing_keywords', [])
            result.setdefault('matched_skills', [])
            result.setdefault('category_scores', {})
            result.setdefault('summary', '')

            job.match_score = result['score']
            job.save(update_fields=['match_score'])

            return Response(result)

        except json.JSONDecodeError:
            return Response({'error': 'The AI returned an invalid response.'}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'error': f'Match score error: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardAnalyticsView(APIView):
    """Return aggregated analytics data for the dashboard."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = JobApplication.objects.filter(user=request.user)

        # Count per status
        status_counts = dict(
            jobs.values_list('status').annotate(count=Count('id')).values_list('status', 'count')
        )

        # Applications over time (by week)
        apps_over_time = list(
            jobs.annotate(week=TruncWeek('created_at'))
                .values('week')
                .annotate(count=Count('id'))
                .order_by('week')
                .values('week', 'count')
        )
        for item in apps_over_time:
            item['week'] = item['week'].isoformat()

        # Average match score
        avg_score = jobs.exclude(match_score__isnull=True).aggregate(
            avg=Avg('match_score')
        )['avg']

        return Response({
            'total': jobs.count(),
            'status_counts': status_counts,
            'applications_over_time': apps_over_time,
            'average_match_score': round(avg_score, 1) if avg_score else None,
        })


class ScrapeJobAPIView(APIView):
    """
    POST /api/jobs/scrape/
    Takes a URL and returns AI-extracted job posting details.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        url = request.data.get('url')
        manual_text = request.data.get('text')
        
        if not url and not manual_text:
            return Response({'error': 'url or text is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            website_text = manual_text if manual_text else scrape_job_url(url)

            prompt = f"""You are an expert AI assistant that extracts structured job posting data.

First, verify if the provided text is actually a job posting. If the text appears to be legal junk, cookie consents, a login page, or a generic blocked page, return exactly: {{"error": "invalid_content_detected"}}.

Otherwise, analyze the text and extract the Company Name, Position Title, Location, and Application Deadline.

SCRAPED TEXT:
{website_text}

Respond with ONLY valid JSON strictly matching one of these formats:

FORMAT 1 (If invalid content):
{{
    "error": "invalid_content_detected"
}}

FORMAT 2 (If valid job posting):
{{
    "company": "<Extracted company name, or empty string if not found>",
    "position": "<Extracted position/role title, or empty string if not found>",
    "location": "<Extracted location (City, State/Country), or Remote, or empty string if not found>",
    "deadline": "<Extracted deadline in YYYY-MM-DD format if possible, otherwise empty string if not found>"
}}"""

            response_text = call_gemini(prompt)
            cleaned = response_text.strip()
            if cleaned.startswith('```'):
                cleaned = cleaned.split('\n', 1)[1]
                cleaned = cleaned.rsplit('```', 1)[0]
            result = json.loads(cleaned)

            if result.get("error") == "invalid_content_detected":
                return Response({'error': 'invalid_content_detected'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            # Return the raw scraped text so the frontend can pre-fill the Description box (only if we scraped it)
            if not manual_text:
                result['description'] = website_text.strip()

            return Response(result)

        except json.JSONDecodeError:
            return Response({'error': 'The AI returned an invalid response. Could not parse extracted data.'}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

class DownloadCoverLetterView(APIView):
    """
    POST /api/jobs/download-cover-letter/
    Generates and returns a PDF file from the provided cover letter text.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cover_letter_text = request.data.get('cover_letter')
        company = request.data.get('company', 'Company')

        if not cover_letter_text:
            return Response({'error': 'Cover letter text is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pdf_buffer = generate_cover_letter_pdf(cover_letter_text, company)
            
            # Sanitize company name for the filename
            safe_company = "".join([c if c.isalnum() else "_" for c in company]).strip("_")
            filename = f"Cover_Letter_{safe_company}.pdf" if safe_company else "Cover_Letter.pdf"
            
            return FileResponse(pdf_buffer, as_attachment=True, filename=filename)
        except Exception as e:
            return Response({'error': f'Failed to generate PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
