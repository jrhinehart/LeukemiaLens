"""
Text Chunking Module

Splits extracted text into semantic chunks suitable for embedding and retrieval.
Uses sentence boundaries, paragraph structure, and section headers.
"""

import re
import os
import uuid
from typing import List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

# Configuration
CHUNK_SIZE = int(os.getenv('CHUNK_SIZE', '600'))  # Target tokens per chunk
CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '100'))  # Overlap tokens

# Simple tokenization (approximation: 1 token ≈ 4 characters)
CHARS_PER_TOKEN = 4


@dataclass
class Chunk:
    id: str
    document_id: str
    chunk_index: int
    content: str
    start_page: int
    end_page: int
    section_header: Optional[str]
    token_count: int


def estimate_tokens(text: str) -> int:
    """Estimate token count from text."""
    return len(text) // CHARS_PER_TOKEN


def find_page_for_position(position: int, page_breaks: List[int]) -> int:
    """Find which page a character position falls on."""
    for i, break_pos in enumerate(page_breaks):
        if position < break_pos:
            return i + 1
    return len(page_breaks)


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    # Simple sentence splitting on common boundaries
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    return [s.strip() for s in sentences if s.strip()]


def split_into_paragraphs(text: str) -> List[str]:
    """Split text into paragraphs."""
    paragraphs = re.split(r'\n\s*\n', text)
    return [p.strip() for p in paragraphs if p.strip()]


def detect_section_header(text: str) -> Optional[str]:
    """Check if text starts with a section header."""
    first_line = text.split('\n')[0].strip()
    
    # Common academic paper sections
    section_patterns = [
        r'^(?:Abstract|Introduction|Background|Methods?|Materials?\s+and\s+Methods?|Results?|Discussion|Conclusions?|References|Acknowledgements?)\s*$',
        r'^\d+\.?\s+[A-Z][A-Za-z\s]+$',
    ]
    
    for pattern in section_patterns:
        if re.match(pattern, first_line, re.IGNORECASE):
            return first_line
    
    return None


def chunk_text(
    text: str,
    page_breaks: List[int],
    document_id: str,
    max_chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP
) -> List[Chunk]:
    """
    Split text into overlapping chunks.
    
    Strategy:
    1. Split into paragraphs first
    2. Merge small paragraphs until target size
    3. Split large paragraphs on sentences
    4. Add overlap between chunks
    """
    chunks = []
    paragraphs = split_into_paragraphs(text)
    
    current_chunk = []
    current_tokens = 0
    current_section = None
    chunk_index = 0
    
    for para in paragraphs:
        para_tokens = estimate_tokens(para)
        
        # Check for section header
        header = detect_section_header(para)
        if header:
            current_section = header
        
        # If single paragraph exceeds chunk size, split on sentences
        if para_tokens > max_chunk_size:
            # Flush current chunk first
            if current_chunk:
                chunk_text = '\n\n'.join(current_chunk)
                chunk_start = text.find(current_chunk[0])
                chunk_end = text.find(current_chunk[-1]) + len(current_chunk[-1])
                
                chunks.append(Chunk(
                    id=str(uuid.uuid4()),
                    document_id=document_id,
                    chunk_index=chunk_index,
                    content=chunk_text,
                    start_page=find_page_for_position(chunk_start, page_breaks),
                    end_page=find_page_for_position(chunk_end, page_breaks),
                    section_header=current_section,
                    token_count=estimate_tokens(chunk_text)
                ))
                chunk_index += 1
                current_chunk = []
                current_tokens = 0
            
            # Split large paragraph into sentences
            sentences = split_into_sentences(para)
            sentence_chunk = []
            sentence_tokens = 0
            
            for sent in sentences:
                sent_tokens = estimate_tokens(sent)
                
                if sentence_tokens + sent_tokens > max_chunk_size and sentence_chunk:
                    chunk_text = ' '.join(sentence_chunk)
                    chunk_start = text.find(sentence_chunk[0])
                    
                    chunks.append(Chunk(
                        id=str(uuid.uuid4()),
                        document_id=document_id,
                        chunk_index=chunk_index,
                        content=chunk_text,
                        start_page=find_page_for_position(chunk_start, page_breaks),
                        end_page=find_page_for_position(chunk_start + len(chunk_text), page_breaks),
                        section_header=current_section,
                        token_count=estimate_tokens(chunk_text)
                    ))
                    chunk_index += 1
                    
                    # Overlap: keep last few sentences
                    overlap_tokens = 0
                    overlap_start = len(sentence_chunk)
                    for i in range(len(sentence_chunk) - 1, -1, -1):
                        overlap_tokens += estimate_tokens(sentence_chunk[i])
                        if overlap_tokens >= overlap:
                            overlap_start = i
                            break
                    
                    sentence_chunk = sentence_chunk[overlap_start:]
                    sentence_tokens = sum(estimate_tokens(s) for s in sentence_chunk)
                
                sentence_chunk.append(sent)
                sentence_tokens += sent_tokens
            
            # Add remaining sentences
            if sentence_chunk:
                chunk_text = ' '.join(sentence_chunk)
                chunk_start = text.find(sentence_chunk[0])
                
                current_chunk = [chunk_text]
                current_tokens = estimate_tokens(chunk_text)
        
        # Normal paragraph - add to current chunk
        elif current_tokens + para_tokens > max_chunk_size and current_chunk:
            # Save current chunk
            chunk_text = '\n\n'.join(current_chunk)
            chunk_start = text.find(current_chunk[0])
            chunk_end = text.find(current_chunk[-1]) + len(current_chunk[-1])
            
            chunks.append(Chunk(
                id=str(uuid.uuid4()),
                document_id=document_id,
                chunk_index=chunk_index,
                content=chunk_text,
                start_page=find_page_for_position(chunk_start, page_breaks),
                end_page=find_page_for_position(chunk_end, page_breaks),
                section_header=current_section,
                token_count=estimate_tokens(chunk_text)
            ))
            chunk_index += 1
            
            # Start new chunk with overlap
            overlap_paras = []
            overlap_tokens = 0
            for p in reversed(current_chunk):
                p_tokens = estimate_tokens(p)
                if overlap_tokens + p_tokens > overlap:
                    break
                overlap_paras.insert(0, p)
                overlap_tokens += p_tokens
            
            current_chunk = overlap_paras + [para]
            current_tokens = overlap_tokens + para_tokens
        else:
            current_chunk.append(para)
            current_tokens += para_tokens
    
    # Don't forget the last chunk
    if current_chunk:
        chunk_text = '\n\n'.join(current_chunk)
        chunk_start = text.find(current_chunk[0])
        chunk_end = text.find(current_chunk[-1]) + len(current_chunk[-1])
        
        chunks.append(Chunk(
            id=str(uuid.uuid4()),
            document_id=document_id,
            chunk_index=chunk_index,
            content=chunk_text,
            start_page=find_page_for_position(chunk_start, page_breaks),
            end_page=find_page_for_position(chunk_end, page_breaks),
            section_header=current_section,
            token_count=estimate_tokens(chunk_text)
        ))
    
    logger.info(f"Created {len(chunks)} chunks from {len(text)} characters")
    
    return chunks


if __name__ == '__main__':
    # Test chunking
    test_text = """
    Abstract
    
    This is the abstract of the paper. It contains important information about the study.
    
    Introduction
    
    The introduction provides background information. It sets up the context for the research.
    Multiple sentences here to simulate a real paper paragraph. This paragraph continues with more
    detail about the research topic and its importance to the field.
    
    Methods
    
    The methods section describes how the study was conducted. Various techniques were used
    to analyze the data and reach conclusions about the research questions.
    """
    
    chunks = chunk_text(test_text, [500, 1000, 1500], 'test-doc-id')
    
    for chunk in chunks:
        print(f"\nChunk {chunk.chunk_index}:")
        print(f"  Section: {chunk.section_header}")
        print(f"  Tokens: {chunk.token_count}")
        print(f"  Pages: {chunk.start_page}-{chunk.end_page}")
        print(f"  Content: {chunk.content[:100]}...")
