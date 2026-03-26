import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph

def generate_cover_letter_pdf(text: str, company: str) -> io.BytesIO:
    """Takes a cover letter text string and formats it into a professional A4 PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1*inch,
        leftMargin=1*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )
    
    styles = getSampleStyleSheet()
    # Create a nice body text style based on Normal
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16, # Gives nice spacing between lines
        spaceAfter=12 # Space after paragraph
    )

    story = []
    
    # Process text layout keeping paragraph structure
    # AI generates clean paragraphs separated by double-newlines
    paragraphs = text.split('\n\n')
    for raw_paragraph in paragraphs:
        # Convert internal single newlines inside a paragraph into HTML <br/> so ReportLab properly processes them
        cleaned_p = raw_paragraph.strip().replace('\n', '<br/>')
        
        if cleaned_p:
            p = Paragraph(cleaned_p, body_style)
            story.append(p)

    doc.build(story)
    buffer.seek(0)
    return buffer
