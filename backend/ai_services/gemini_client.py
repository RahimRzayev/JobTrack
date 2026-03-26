import logging
from google import genai
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """Singleton class for managing the Google Gemini AI connection via API key."""

    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize the Gemini client with an API key."""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Add GEMINI_API_KEY=your-key to your .env file. "
                "Get a free key at https://aistudio.google.com/apikey"
            )
        self._client = genai.Client(api_key=api_key)
        logger.info("Successfully initialized Gemini AI client (gemini-2.5-flash)")

    def generate_content(self, prompt: str, system_instruction: str = None) -> str:
        """Generate and return text response from Gemini."""
        if not self._client:
            raise RuntimeError("Gemini client is not initialized.")

        try:
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"

            response = self._client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Error generating Gemini content: {e}")
            raise


def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """
    Helper function to get a response from Gemini.
    Uses the GeminiClient singleton under the hood.
    """
    client = GeminiClient()
    return client.generate_content(prompt, system_instruction)
