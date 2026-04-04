import json
import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MatchScoreSerializer, CoverLetterSerializer
from .gemini_client import call_gemini
from .pdf_extractor import extract_text_from_pdf

logger = logging.getLogger(__name__)


class MatchScoreView(APIView):
    """
    POST /api/ai/match-score/
    Compare resume against job description and return a match score.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MatchScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume_text = serializer.validated_data['resume_text']
        job_description = serializer.validated_data['job_description']

        prompt = f"""You are an expert career advisor and resume analyst.

Compare the following resume/CV against the job description and provide a match analysis.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{{
    "score": <integer 0-100>,
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"]
}}

The score should reflect how well the resume matches the job requirements.
Strengths are areas where the candidate is a good fit.
Gaps are areas where the candidate is lacking."""

        try:
            response_text = call_gemini(prompt)
            # Clean response — handle possible markdown code blocks
            cleaned = response_text.strip()
            if cleaned.startswith('```'):
                cleaned = cleaned.split('\n', 1)[1]
                cleaned = cleaned.rsplit('```', 1)[0]
            result = json.loads(cleaned)

            # Validate structure
            if 'score' not in result:
                raise ValueError("Missing 'score' in AI response")

            result['score'] = max(0, min(100, int(result['score'])))
            result.setdefault('strengths', [])
            result.setdefault('gaps', [])

            return Response(result)

        except TimeoutError:
            logger.error("Match score API request timed out")
            return Response(
                {'error': 'Request timed out. The AI is taking too long. Please try again.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except json.JSONDecodeError:
            logger.error("Invalid JSON response from Gemini")
            return Response(
                {'error': 'The AI returned an invalid response. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            logger.error(f"Match score error: {e}")
            return Response(
                {'error': 'Failed to analyze match score. Please ensure your CV is readable and try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class CoverLetterView(APIView):
    """
    POST /api/ai/cover-letter/
    Generate a personalized cover letter.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CoverLetterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from accounts.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        cv_pdf = profile.cv_pdf if profile.cv_pdf else None
        if not cv_pdf:
            return Response({'error': 'No CV PDF found in your profile. Please upload one first.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            resume_text = extract_text_from_pdf(cv_pdf)
            if not resume_text or not resume_text.strip():
                logger.warning(f"PDF extraction returned empty text for user {request.user.id}")
                return Response({'error': 'Your CV PDF appears to be empty or unreadable. Please upload a different PDF.'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"PDF extraction error for user {request.user.id}: {e}")
            return Response({'error': 'Failed to read your CV PDF. Ensure it\'s a valid PDF file.'}, status=status.HTTP_400_BAD_REQUEST)

        job_description = serializer.validated_data['job_description']
        tone = serializer.validated_data.get('tone', 'formal')

        tone_instruction = (
            "Use a professional and formal tone."
            if tone == 'formal'
            else "Use a warm, conversational, and friendly tone while remaining professional."
        )

        prompt = f"""You are an expert career coach and professional writer.

Write a compelling cover letter based on the candidate's resume and the job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

INSTRUCTIONS:
- {tone_instruction}
- Highlight the candidate's most relevant experience and skills for this specific role.
- Keep it concise — no longer than 400 words.
- Do NOT include placeholder text like [Company Name] — infer from the job description.
- Write the letter body only (no subject line).
- Make it unique and compelling to the specific company and role."""

        try:
            cover_letter = call_gemini(prompt)
            return Response({'cover_letter': cover_letter.strip()})

        except TimeoutError:
            logger.error("Cover letter generation API request timed out")
            return Response(
                {'error': 'Request timed out. The AI is taking too long. Please try again.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except Exception as e:
            logger.error(f"Cover letter error: {e}")
            return Response(
                {'error': 'Failed to generate cover letter. Please check your API configuration and try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )



