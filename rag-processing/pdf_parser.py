"""
PDF Text Extraction Module

Uses PyMuPDF (fitz) to extract text from PDF documents with page boundary tracking.
"""

import fitz  # PyMuPDF
import re
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    """Clean extracted text."""
    # Remove page headers/footers (common patterns)
    # Remove lines that are just page numbers
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Remove common header/footer patterns
    text = re.sub(r'^\s*(Page \d+ of \d+|www\..+|https?://.+)\s*$', '', text, flags=re.MULTILINE)
    
    # Remove excessive whitespace and merge into one line
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def extract_section_headers(text: str) -> List[Dict]:
    """Identify potential section headers in text."""
    headers = []
    
    # Common academic paper sections
    section_patterns = [
        r'^(?:Abstract|Introduction|Background|Methods?|Materials?\s+and\s+Methods?|Results?|Discussion|Conclusions?|References|Acknowledgements?)\s*$',
        r'^\d+\.?\s+[A-Z][A-Za-z\s]+$',  # Numbered sections like "1. Introduction"
        r'^[A-Z][A-Z\s]{2,}$',  # ALL CAPS headers
    ]
    
    for i, line in enumerate(text.split('\n')):
        line = line.strip()
        for pattern in section_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                headers.append({
                    'text': line,
                    'position': i
                })
                break
    
    return headers


def extract_text_from_pdf(pdf_path: str) -> Optional[Dict]:
    """
    Extract text from a PDF file.
    
    Returns:
        {
            'text': str,           # Full extracted text
            'page_count': int,     # Number of pages
            'page_breaks': List[int],  # Character positions of page breaks
            'metadata': Dict       # PDF metadata (title, author, etc.)
        }
    """
    try:
        doc = fitz.open(pdf_path)
        logger.info(f"PDF opened: {pdf_path}, Page count: {len(doc)}")
        
        full_text = []
        page_breaks = []
        current_position = 0
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Extract text with layout preservation
            text = page.get_text("text")
            cleaned = clean_text(text)
            
            if cleaned:
                full_text.append(cleaned)
                current_position += len(cleaned) + 1  # +1 for newline
                page_breaks.append(current_position)
        
        # Get metadata
        metadata = doc.metadata or {}
        
        doc.close()
        
        combined_text = '\n\n'.join(full_text)
        
        logger.info(f"Extracted {len(combined_text)} characters from {len(page_breaks)} pages")
        
        return {
            'text': combined_text,
            'page_count': len(page_breaks),
            'page_breaks': page_breaks,
            'metadata': {
                'title': metadata.get('title', ''),
                'author': metadata.get('author', ''),
                'subject': metadata.get('subject', ''),
                'created': metadata.get('creationDate', '')
            }
        }
        
    except Exception as e:
        logger.exception(f"Error extracting text from {pdf_path}: {e}")
        return None


def extract_text_by_page(pdf_path: str) -> List[Dict]:
    """
    Extract text from PDF page by page.
    
    Returns list of page objects with text and page number.
    """
    try:
        doc = fitz.open(pdf_path)
        pages = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            cleaned = clean_text(text)
            
            if cleaned:
                pages.append({
                    'page_number': page_num + 1,
                    'text': cleaned,
                    'char_count': len(cleaned)
                })
        
        doc.close()
        return pages
        
    except Exception as e:
        logger.exception(f"Error extracting pages from {pdf_path}: {e}")
        return []


if __name__ == '__main__':
    # Test with a sample PDF
    import sys
    if len(sys.argv) > 1:
        result = extract_text_from_pdf(sys.argv[1])
        if result:
            print(f"Pages: {result['page_count']}")
            print(f"Characters: {len(result['text'])}")
            print(f"First 500 chars:\n{result['text'][:500]}")
