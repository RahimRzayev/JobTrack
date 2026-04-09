import logging
import threading
from functools import wraps
from google import genai
from django.conf import settings

logger = logging.getLogger(__name__)


def with_timeout(timeout_seconds=30):
    """Decorator to add a thread-safe timeout to function calls."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = [None]
            exception = [None]

            def target():
                try:
                    result[0] = func(*args, **kwargs)
                except Exception as e:
                    exception[0] = e

            thread = threading.Thread(target=target, daemon=True)
            thread.start()
            thread.join(timeout=timeout_seconds)

            if thread.is_alive():
                raise TimeoutError(f"Gemini API request timed out after {timeout_seconds} seconds")
            if exception[0] is not None:
                raise exception[0]
            return result[0]
        return wrapper
    return decorator


class GeminiClient:
    """Singleton class for managing the Google Gemini AI connection via API key."""

    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None or cls._client is None:
            cls._instance = super(GeminiClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize the Gemini client with an API key."""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            cls = type(self)
            cls._instance = None
            raise ValueError(
                "GEMINI_API_KEY is not set. Add GEMINI_API_KEY=your-key to your .env file. "
                "Get a free key at https://aistudio.google.com/apikey"
            )
        try:
            self._client = genai.Client(api_key=api_key)
            logger.info("Successfully initialized Gemini AI client")
        except Exception as e:
            cls = type(self)
            cls._instance = None
            raise

    def generate_content(self, prompt: str, system_instruction: str = None, model: str = 'gemini-2.5-flash') -> str:
        """Generate and return text response from Gemini with timeout."""
        if not self._client:
            raise RuntimeError("Gemini client is not initialized.")

        timeout = 45 if 'pro' in model else 30

        @with_timeout(timeout_seconds=timeout)
        def _call():
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"

            response = self._client.models.generate_content(
                model=model,
                contents=full_prompt,
                config={'temperature': 0},
            )
            return response.text

        try:
            return _call()
        except TimeoutError:
            logger.error(f"Gemini API request timed out ({model}, {timeout}s)")
            raise
        except Exception as e:
            logger.error(f"Error generating Gemini content ({model}): {e}")
            raise


# Model constants
MODEL_FLASH = 'gemini-2.5-flash'
MODEL_PRO = 'gemini-2.5-pro'


def call_gemini(prompt: str, system_instruction: str = None, model: str = MODEL_FLASH) -> str:
    """
    Helper function to get a response from Gemini.
    Uses the GeminiClient singleton under the hood.
    """
    client = GeminiClient()
    return client.generate_content(prompt, system_instruction, model=model)
