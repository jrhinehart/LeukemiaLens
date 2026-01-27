"""
XML Text Extraction Module

Extracts text from PMC Open Access XML files (JATS/NLM format).
These come as .tgz archives containing .nxml files.
"""

import tarfile
import tempfile
import re
import os
from pathlib import Path
from typing import Dict, List, Optional
from xml.etree import ElementTree as ET
import logging

logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    """Clean extracted text."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_element_text(element: Optional[ET.Element]) -> str:
    """Recursively extract all text from an XML element and its children."""
    if element is None:
        return ""
    
    text_parts = []
    
    # Get direct text
    if element.text:
        text_parts.append(element.text)
    
    # Get text from children
    for child in element:
        # Skip certain elements that shouldn't be included in main text
        if child.tag in ('xref', 'ext-link', 'email'):
            # Include the text but not the reference details
            if child.text:
                text_parts.append(child.text)
            if child.tail:
                text_parts.append(child.tail)
        elif child.tag in ('fig', 'table-wrap', 'supplementary-material'):
            # Skip figures/tables inline but get caption
            caption = child.find('.//caption')
            if caption is not None:
                text_parts.append(extract_element_text(caption))
            if child.tail:
                text_parts.append(child.tail)
        else:
            text_parts.append(extract_element_text(child))
        
        if child.tail:
            text_parts.append(child.tail)
    
    return ''.join(text_parts)


def parse_jats_xml(xml_path: str) -> Optional[Dict]:
    """
    Parse a JATS/NLM XML file and extract text with structure.
    
    Returns:
        {
            'text': str,           # Full extracted text
            'page_count': int,     # Estimated based on content length
            'page_breaks': List[int],  # Simulated page breaks
            'metadata': Dict       # Article metadata
        }
    """
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        # Handle namespace if present
        ns = {}
        if root.tag.startswith('{'):
            ns_end = root.tag.find('}')
            ns['ns'] = root.tag[1:ns_end]
        
        sections = []
        current_position = 0
        page_breaks = []
        
        # Extract article metadata
        article_meta = root.find('.//article-meta')
        metadata = {}
        if article_meta is not None:
            title_group = article_meta.find('.//title-group/article-title')
            if title_group is not None:
                metadata['title'] = extract_element_text(title_group)
            
            # Get authors
            authors = []
            for contrib in article_meta.findall('.//contrib[@contrib-type="author"]'):
                name = contrib.find('.//name')
                if name is not None:
                    surname = name.find('surname')
                    given = name.find('given-names')
                    if surname is not None:
                        author_name = surname.text or ''
                        if given is not None and given.text:
                            author_name = f"{given.text} {author_name}"
                        authors.append(author_name)
            metadata['authors'] = ', '.join(authors)
        
        # Extract abstract
        abstract = root.find('.//abstract')
        if abstract is not None:
            abstract_text = extract_element_text(abstract)
            if abstract_text:
                sections.append("ABSTRACT\n\n" + clean_text(abstract_text))
                current_position += len(sections[-1]) + 2
                page_breaks.append(current_position)
        
        # Extract body sections
        body = root.find('.//body')
        if body is not None:
            for sec in body.findall('.//sec'):
                # Get section title
                title = sec.find('title')
                section_title = extract_element_text(title) if title is not None else ""
                
                # Get section content (paragraphs)
                paragraphs = []
                for p in sec.findall('.//p'):
                    p_text = extract_element_text(p)
                    if p_text:
                        paragraphs.append(clean_text(p_text))
                
                if paragraphs:
                    section_text = ""
                    if section_title:
                        section_text = section_title.upper() + "\n\n"
                    section_text += "\n\n".join(paragraphs)
                    sections.append(section_text)
                    current_position += len(section_text) + 2
                    page_breaks.append(current_position)
        
        # If no structured sections found, try to get all text from body
        if not sections and body is not None:
            body_text = extract_element_text(body)
            if body_text:
                sections.append(clean_text(body_text))
                current_position += len(sections[-1]) + 2
                page_breaks.append(current_position)
        
        combined_text = '\n\n'.join(sections)
        
        # Estimate page count (~3000 chars per page for academic text)
        estimated_pages = max(1, len(combined_text) // 3000)
        
        logger.info(f"Extracted {len(combined_text)} characters from XML ({estimated_pages} estimated pages)")
        
        return {
            'text': combined_text,
            'page_count': estimated_pages,
            'page_breaks': page_breaks,
            'metadata': metadata
        }
        
    except ET.ParseError as e:
        logger.error(f"XML parse error in {xml_path}: {e}")
        return None
    except Exception as e:
        logger.exception(f"Error parsing XML {xml_path}: {e}")
        return None


def extract_text_from_xml(tgz_path: str) -> Optional[Dict]:
    """
    Extract text from a PMC Open Access tgz archive.
    
    The archive typically contains:
    - PMC{ID}.nxml - The main article XML
    - Various image files
    
    Returns same structure as extract_text_from_pdf() for compatibility.
    """
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Extract the tgz archive
            with tarfile.open(tgz_path, 'r:gz') as tar:
                tar.extractall(tmpdir)
            
            # Find the .nxml file
            nxml_files = list(Path(tmpdir).rglob('*.nxml'))
            
            if not nxml_files:
                logger.error(f"No .nxml file found in {tgz_path}")
                return None
            
            # Use the first (usually only) nxml file
            nxml_path = nxml_files[0]
            logger.info(f"Found XML file: {nxml_path.name}")
            
            return parse_jats_xml(str(nxml_path))
            
    except tarfile.TarError as e:
        logger.error(f"Error extracting tar archive {tgz_path}: {e}")
        return None
    except Exception as e:
        logger.exception(f"Error extracting text from {tgz_path}: {e}")
        return None


if __name__ == '__main__':
    # Test with a sample tgz file
    import sys
    if len(sys.argv) > 1:
        result = extract_text_from_xml(sys.argv[1])
        if result:
            print(f"Estimated pages: {result['page_count']}")
            print(f"Characters: {len(result['text'])}")
            print(f"Metadata: {result['metadata']}")
            print(f"\nFirst 1000 chars:\n{result['text'][:1000]}")
