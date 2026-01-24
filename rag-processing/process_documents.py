"""
RAG Document Processor

Main orchestration script for document processing pipeline:
1. Fetch pending documents from D1
2. Download PDFs from R2
3. Extract text with PyMuPDF
4. Chunk text semantically
5. Generate embeddings
6. Upload chunks and vectors to Cloudflare
"""

import os
import json
import logging
from typing import List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

import requests
from dotenv import load_dotenv
from tqdm import tqdm

from pdf_parser import extract_text_from_pdf
from chunker import chunk_text
from embedder import generate_embeddings

# Load environment
load_dotenv()

# Configuration
CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
DATABASE_ID = os.getenv('DATABASE_ID')
API_BASE_URL = os.getenv('API_BASE_URL', 'https://leukemialens-api.jr-rhinehart.workers.dev')
BATCH_SIZE = int(os.getenv('BATCH_SIZE', '10'))

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class Document:
    id: str
    pmcid: Optional[str]
    pmid: Optional[str]
    filename: str
    r2_key: str
    status: str


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


def query_d1(sql: str, params: List = None) -> dict:
    """Execute a D1 query via Cloudflare API."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/d1/database/{DATABASE_ID}/query"
    
    response = requests.post(
        url,
        headers={
            'Authorization': f'Bearer {CLOUDFLARE_API_TOKEN}',
            'Content-Type': 'application/json'
        },
        json={'sql': sql, 'params': params or []}
    )
    
    data = response.json()
    if not data.get('success'):
        raise Exception(f"D1 query failed: {data.get('errors')}")
    
    return data['result'][0]


def get_pending_documents() -> List[Document]:
    """Fetch documents with status 'pending'."""
    result = query_d1(
        "SELECT id, pmcid, pmid, filename, r2_key, status FROM documents WHERE status = 'pending' LIMIT ?",
        [BATCH_SIZE]
    )
    
    documents = []
    for row in result.get('results', []):
        documents.append(Document(
            id=row['id'],
            pmcid=row.get('pmcid'),
            pmid=row.get('pmid'),
            filename=row['filename'],
            r2_key=row['r2_key'],
            status=row['status']
        ))
    
    return documents


def download_document(doc: Document, output_path: str) -> bool:
    """Download document from R2 via API."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/documents/{doc.id}/content",
            stream=True
        )
        
        if response.status_code != 200:
            logger.error(f"Failed to download {doc.id}: {response.status_code}")
            return False
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except Exception as e:
        logger.error(f"Download error for {doc.id}: {e}")
        return False


def update_document_status(doc_id: str, status: str, chunk_count: int = 0, error: str = None):
    """Update document status via API."""
    payload = {'status': status}
    if chunk_count > 0:
        payload['chunkCount'] = chunk_count
    if error:
        payload['errorMessage'] = error
    
    response = requests.patch(
        f"{API_BASE_URL}/api/documents/{doc_id}/status",
        json=payload
    )
    
    return response.status_code == 200


def upload_chunks(doc_id: str, chunks: List[Chunk], embeddings: List[List[float]]) -> bool:
    """Upload chunks and embeddings to Cloudflare."""
    try:
        # Prepare payload
        payload = {
            'documentId': doc_id,
            'chunks': [
                {
                    'id': chunk.id,
                    'chunkIndex': chunk.chunk_index,
                    'content': chunk.content,
                    'startPage': chunk.start_page,
                    'endPage': chunk.end_page,
                    'sectionHeader': chunk.section_header,
                    'tokenCount': chunk.token_count,
                    'embedding': embeddings[i]
                }
                for i, chunk in enumerate(chunks)
            ]
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/chunks/batch",
            json=payload
        )
        
        if response.status_code != 200:
            logger.error(f"Chunk upload failed: {response.status_code} - {response.text}")
            return False
        
        return True
    except Exception as e:
        logger.error(f"Chunk upload error: {e}")
        return False


def process_document(doc: Document, data_dir: str) -> bool:
    """Process a single document through the full pipeline."""
    pdf_path = os.path.join(data_dir, f"{doc.id}.pdf")
    
    try:
        # Update status to processing
        update_document_status(doc.id, 'processing')
        
        # Step 1: Download PDF
        logger.info(f"Downloading {doc.filename}...")
        if not download_document(doc, pdf_path):
            update_document_status(doc.id, 'error', error='Download failed')
            return False
        
        # Step 2: Extract text
        logger.info(f"Extracting text from {doc.filename}...")
        text_result = extract_text_from_pdf(pdf_path)
        if not text_result or not text_result.get('text'):
            update_document_status(doc.id, 'error', error='Text extraction failed')
            return False
        
        # Step 3: Chunk text
        logger.info(f"Chunking text...")
        chunks = chunk_text(
            text=text_result['text'],
            page_breaks=text_result.get('page_breaks', []),
            document_id=doc.id
        )
        
        if not chunks:
            update_document_status(doc.id, 'error', error='Chunking produced no results')
            return False
        
        logger.info(f"Created {len(chunks)} chunks")
        
        # Step 4: Generate embeddings
        logger.info(f"Generating embeddings...")
        chunk_texts = [c.content for c in chunks]
        embeddings = generate_embeddings(chunk_texts)
        
        if len(embeddings) != len(chunks):
            update_document_status(doc.id, 'error', error='Embedding generation mismatch')
            return False
        
        # Step 5: Upload to Cloudflare
        logger.info(f"Uploading chunks and embeddings...")
        if not upload_chunks(doc.id, chunks, embeddings):
            update_document_status(doc.id, 'error', error='Upload failed')
            return False
        
        # Step 6: Mark as ready
        update_document_status(doc.id, 'ready', chunk_count=len(chunks))
        logger.info(f"✓ Processed {doc.filename}: {len(chunks)} chunks")
        
        return True
        
    except Exception as e:
        logger.exception(f"Error processing {doc.id}: {e}")
        update_document_status(doc.id, 'error', error=str(e))
        return False
    
    finally:
        # Cleanup
        if os.path.exists(pdf_path):
            os.remove(pdf_path)


def main():
    """Main processing loop."""
    logger.info("=" * 60)
    logger.info("RAG Document Processor")
    logger.info("=" * 60)
    logger.info(f"API: {API_BASE_URL}")
    logger.info(f"Batch size: {BATCH_SIZE}")
    logger.info("")
    
    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Get pending documents
    logger.info("Fetching pending documents...")
    documents = get_pending_documents()
    
    if not documents:
        logger.info("No pending documents to process.")
        return
    
    logger.info(f"Found {len(documents)} pending documents")
    
    # Process each document
    processed = 0
    failed = 0
    
    for doc in tqdm(documents, desc="Processing"):
        if process_document(doc, data_dir):
            processed += 1
        else:
            failed += 1
    
    # Summary
    logger.info("")
    logger.info("=" * 60)
    logger.info("SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Processed: {processed}")
    logger.info(f"Failed: {failed}")
    logger.info(f"Completed at: {datetime.now().isoformat()}")


if __name__ == '__main__':
    main()
