import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

# Realistic browser headers to bypass basic bot-detection
SCRAPE_HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/123.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}


def scrape_job_url(url: str) -> str:
    """
    Fetches the HTML from the provided URL, parses it with BeautifulSoup,
    and returns cleaned text content to be passed to Gemini.
    Raises a user-friendly exception on failure.
    """
    try:
        session = requests.Session()
        response = session.get(
            url,
            headers=SCRAPE_HEADERS,
            timeout=15,
            allow_redirects=True,
        )

        # Raise for HTTP errors (4xx, 5xx)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove noise: scripts, styles, nav, footer, header
        for tag in soup(['script', 'style', 'noscript', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()

        # Prefer the main content area if present (improves quality)
        main = soup.find('main') or soup.find('article') or soup.body
        text_source = main if main else soup

        text = text_source.get_text(separator=' ')

        # Clean whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split('  '))
        cleaned = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Check for common bot-blocking/CAPTCHA phrases
        lower_cleaned = cleaned.lower()
        bot_phrases = [
            "solve this captcha",
            "verify you are human",
            "pardon our interruption",
            "security check",
            "think that you are a bot",
            "are you a robot",
            "checking if the site connection is secure"
        ]
        
        legal_login_phrases = [
            "cookie policy",
            "cookie banner",
            "sign in",
            "join now",
            "agree & join",
            "forgot password",
            "welcome to your professional community"
        ]
        
        job_keywords = ["requirements", "responsibilities", "apply", "qualifications", "experience", "salary"]

        if any(phrase in lower_cleaned for phrase in bot_phrases) and len(cleaned) < 5000:
             raise Exception("SCRAPING_BLOCKED")

        has_legal_login = sum(1 for phrase in legal_login_phrases if phrase in lower_cleaned)
        has_job_keywords = any(kw in lower_cleaned for kw in job_keywords)
        
        if has_legal_login >= 1 and not has_job_keywords:
             raise Exception("SCRAPING_FAILED")

        # Truncate to stay within Gemini context limits
        return cleaned[:30_000]

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response is not None else 'unknown'
        if status_code == 403:
            raise Exception("SCRAPING_FAILED")
        elif status_code == 404:
            raise Exception(f"The job posting URL returned 404 Not Found. Please check the URL and try again.")
        else:
            raise Exception(f"HTTP {status_code} error when fetching the URL. Please check the URL and try again.")
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the URL. Please check the URL and your network connection.")
    except requests.exceptions.Timeout:
        raise Exception("The request timed out. The website may be slow or unavailable.")
    except Exception as e:
        logger.error(f"Scrape error for {url}: {e}")
        raise Exception(f"Failed to scrape URL: {str(e)}")
