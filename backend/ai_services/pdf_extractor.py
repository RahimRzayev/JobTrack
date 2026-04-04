import logging
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_field_or_path):
    """
    Extracts and returns text from a Django FileField or a file path using PyPDF2.
    """
    if not file_field_or_path:
        return ""
    
    try:
        reader = PdfReader(file_field_or_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise ValueError(f"Failed to read PDF file: {e}") from e
