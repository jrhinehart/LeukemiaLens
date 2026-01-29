"""
GPU-Optimized RAG Backfill Script

High-throughput batch processing for embedding generation and Vectorize upload.
Designed to run on a local machine with GPU for initial backfill of documents.

Features:
- GPU acceleration with automatic detection
- Resume capability via checkpoint file
- Progress tracking with ETA
- Configurable batch sizes
- Parallel chunk processing
"""

import os
import sys
import json
import time
import argparse
import logging
import threading
from typing import List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import requests
from dotenv import load_dotenv
from tqdm import tqdm

from pdf_parser import extract_text_from_pdf
from xml_parser import extract_text_from_xml
from chunker import chunk_text
from embedder import generate_embeddings, get_device, EMBEDDING_DIM, pre_load_model

# Load environment
load_dotenv()

# Configuration
CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
DATABASE_ID = os.getenv('DATABASE_ID')
API_BASE_URL = os.getenv('API_BASE_URL', 'https://leukemialens-api.jr-rhinehart.workers.dev')

# Paths
CHECKPOINT_FILE = Path(__file__).parent / 'data' / 'backfill_checkpoint.json'

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
    study_id: Optional[int]
    filename: str
    format: str  # 'pdf' or 'xml'
    r2_key: str
    status: str


@dataclass
class BackfillStats:
    started_at: str
    documents_processed: int
    documents_failed: int
    chunks_created: int
    vectors_uploaded: int
    last_document_id: Optional[str]
    _lock = threading.Lock()
    
    def update(self, success: bool, chunks: int = 0, vectors: int = 0, doc_id: str = None):
        with self._lock:
            if success:
                self.documents_processed += 1
            else:
                self.documents_failed += 1
            self.chunks_created += chunks
            self.vectors_uploaded += vectors
            if doc_id:
                self.last_document_id = doc_id

    def save(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w') as f:
            json.dump(asdict(self), f, indent=2)
    
    @classmethod
    def load(cls, path: Path) -> Optional['BackfillStats']:
        if not path.exists():
            return None
        with open(path) as f:
            data = json.load(f)
            return cls(**data)


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


def get_pending_documents(limit: int = 1000, 
                          year: Optional[int] = None, month: Optional[int] = None, include_errors: bool = False) -> List[Document]:
    """Fetch documents with status 'pending', optionally filtered by date."""
    
    # 1. First, get a total count for better logging
    try:
        count_query = "SELECT COUNT(*) as count FROM documents WHERE status = 'pending'"
        count_result = query_d1(count_query)
        total_pending = count_result.get('results', [{}])[0].get('count', 0)
        logger.info(f"🔍 Total 'pending' documents in database: {total_pending}")
    except Exception as e:
        logger.warning(f"Could not fetch total pending count: {e}")

    # 2. Build the main query
    base_query = """
        SELECT d.id, d.pmcid, d.pmid, d.study_id, d.filename, d.format, d.r2_key, d.status 
        FROM documents d
    """
    
    # Include both pending and error status if requested
    if include_errors:
        conditions = ["(d.status = 'pending' OR d.status = 'error')"]
    else:
        conditions = ["d.status = 'pending'"]
    params = []
    
    if year:
        # If we have a year, we MUST join with studies
        base_query += " JOIN studies s ON s.id = d.study_id"
        
        if month:
            month_str = str(month).zfill(2)
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            conditions.append("s.pub_date >= ?")
            conditions.append("s.pub_date <= ?")
            params.append(f"{year}-{month_str}-01")
            params.append(f"{year}-{month_str}-{last_day}")
        else:
            conditions.append("s.pub_date >= ?")
            conditions.append("s.pub_date <= ?")
            params.append(f"{year}-01-01")
            params.append(f"{year}-12-31")
    
    if limit > 0:
        query = f"{base_query} WHERE {' AND '.join(conditions)} ORDER BY d.id LIMIT ?"
        params.append(limit)
    else:
        query = f"{base_query} WHERE {' AND '.join(conditions)} ORDER BY d.id"
    
    result = query_d1(query, params)
    rows = result.get('results', [])
    
    if not rows and year:
        logger.warning(f"⚠️ No documents found for year {year}{f'-{month}' if month else ''}. " 
                       "Checks if study_id is populated in documents table.")

    return [Document(**row) for row in rows]


def download_document(doc: Document, output_path: str) -> bool:
    """Download document from R2 via API."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/documents/{doc.id}/content",
            stream=True,
            timeout=60
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


def update_study_metadata(study_id: Optional[int], pmid: Optional[str], pmcid: Optional[str]):
    """Update study extraction method and processed_at in D1."""
    method = 'rag_batch_v1'
    
    if study_id:
        try:
            query_d1(
                "UPDATE studies SET extraction_method = ?, processed_at = datetime('now') WHERE id = ?",
                [method, study_id]
            )
            return True
        except Exception as e:
            logger.error(f"Failed to update study metadata by ID {study_id}: {e}")
    
    # Fallback to source_id (PMID or PMCID)
    source_id = None
    if pmid:
        source_id = f"PMID:{pmid}"
    elif pmcid:
        source_id = f"PMCID:{pmcid}" if not pmcid.startswith('PMC') else pmcid
        if not source_id.startswith('PMC'):
             source_id = f"PMC{source_id}"
    
    if source_id:
        try:
            # We use LIKE for PMC because it might be stored with or without prefix
            sql = "UPDATE studies SET extraction_method = ?, processed_at = datetime('now') WHERE source_id = ?"
            query_d1(sql, [method, source_id])
            return True
        except Exception as e:
            logger.error(f"Failed to update study metadata by source_id {source_id}: {e}")
            
    return False


def upload_chunks(doc_id: str, chunks: List, embeddings: List[List[float]]) -> bool:
    """Upload chunks and embeddings to Cloudflare."""
    try:
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
            json=payload,
            timeout=120
        )
        
        if response.status_code != 200:
            logger.error(f"Chunk upload failed: {response.status_code} - {response.text}")
            return False
        
        return True
    except Exception as e:
        logger.error(f"Chunk upload error: {e}")
        return False


def process_document(doc: Document, data_dir: Path, stats: BackfillStats) -> bool:
    """Process a single document through the full pipeline."""
    # Determine file extension based on format
    file_ext = '.tgz' if doc.format == 'xml' else '.pdf'
    file_path = data_dir / f"{doc.id}{file_ext}"
    
    try:
        update_document_status(doc.id, 'processing')
        
        # Step 1: Download document
        if not download_document(doc, str(file_path)):
            update_document_status(doc.id, 'error', error='Download failed')
            return False
        
        # Step 2: Extract text (route based on format)
        if doc.format == 'xml':
            text_result = extract_text_from_xml(str(file_path))
        else:
            text_result = extract_text_from_pdf(str(file_path))
            
        if not text_result or not text_result.get('text'):
            update_document_status(doc.id, 'error', error=f'Text extraction failed ({doc.format})')
            return False
        
        # Step 3: Chunk text
        chunks = chunk_text(
            text=text_result['text'],
            page_breaks=text_result.get('page_breaks', []),
            document_id=doc.id
        )
        
        if not chunks:
            update_document_status(doc.id, 'error', error='Chunking produced no results')
            return False
        
        # Step 4: Generate embeddings (GPU-accelerated)
        chunk_texts = [c.content for c in chunks]
        embeddings = generate_embeddings(chunk_texts, show_progress=False)
        
        if len(embeddings) != len(chunks):
            update_document_status(doc.id, 'error', error='Embedding generation mismatch')
            return False
        
        # Validate embedding dimension
        if len(embeddings[0]) != EMBEDDING_DIM:
            update_document_status(doc.id, 'error', error=f'Wrong embedding dimension: {len(embeddings[0])} != {EMBEDDING_DIM}')
            return False
        
        # Step 5: Upload to Cloudflare
        if not upload_chunks(doc.id, chunks, embeddings):
            update_document_status(doc.id, 'error', error='Upload failed')
            return False
        
        # Step 6: Mark as ready
        update_document_status(doc.id, 'ready', chunk_count=len(chunks))
        
        # Step 7: Update study metadata
        update_study_metadata(doc.study_id, doc.pmid, doc.pmcid)
        
        # Update stats
        stats.update(True, chunks=len(chunks), vectors=len(embeddings), doc_id=doc.id)
        
        return True
        
    except Exception as e:
        logger.exception(f"Error processing {doc.id}: {e}")
        update_document_status(doc.id, 'error', error=str(e))
        stats.update(False, doc_id=doc.id)
        return False
    
    finally:
        if file_path.exists():
            file_path.unlink()


def main():
    parser = argparse.ArgumentParser(description='GPU-optimized RAG backfill processor')
    parser.add_argument('--limit', type=int, default=0, help='Max documents to process (default: 0 for unlimited)')
    parser.add_argument('--year', type=int, help='Filter by publication year')
    parser.add_argument('--month', type=int, help='Filter by publication month (1-12, requires --year)')
    parser.add_argument('--resume', action='store_true', help='Resume from last checkpoint')
    parser.add_argument('--dry-run', action='store_true', help='List documents without processing')
    parser.add_argument('--clear-checkpoint', action='store_true', help='Clear checkpoint and start fresh')
    parser.add_argument('--workers', type=int, default=1, help='Number of parallel workers (default: 1)')
    parser.add_argument('--include-errors', action='store_true', help='Include documents in error state for reprocessing')
    args = parser.parse_args()
    
    print("=" * 70)
    print("  LeukemiaLens RAG Backfill - GPU Optimized")
    print("=" * 70)
    print(f"  Device: {get_device()}")
    print(f"  Embedding Model: BAAI/bge-base-en-v1.5 (768-dim)")
    print(f"  API: {API_BASE_URL}")
    print(f"  Limit: {'Unlimited' if args.limit <= 0 else args.limit}")
    if args.year:
        date_str = f"{args.year}-{str(args.month).zfill(2)}" if args.month else str(args.year)
        print(f"  Date Filter: {date_str}")
    print(f"  Workers: {args.workers}")
    if args.include_errors:
        print(f"  Include Errors: YES (will retry failed documents)")
    print("=" * 70)
    
    # Handle checkpoint
    if args.clear_checkpoint and CHECKPOINT_FILE.exists():
        CHECKPOINT_FILE.unlink()
        print("✓ Cleared checkpoint")
    
    # Resume from checkpoint or start fresh
    stats = None
    resume_after = None
    
    if args.resume:
        stats = BackfillStats.load(CHECKPOINT_FILE)
        if stats:
            resume_after = stats.last_document_id
            print(f"📍 Resuming after document: {resume_after}")
            print(f"   Previous progress: {stats.documents_processed} processed, {stats.chunks_created} chunks")
    
    if not stats:
        stats = BackfillStats(
            started_at=datetime.now().isoformat(),
            documents_processed=0,
            documents_failed=0,
            chunks_created=0,
            vectors_uploaded=0,
            last_document_id=None
        )
    
    # Ensure data directory exists
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Get pending documents
    status_msg = "pending and error" if args.include_errors else "pending"
    print(f"\n📥 Fetching {status_msg} documents...")
    documents = get_pending_documents(
        limit=args.limit, 
        year=args.year,
        month=args.month,
        include_errors=args.include_errors
    )
    
    if not documents:
        print("✓ No pending documents to process.")
        return
    
    print(f"📄 Found {len(documents)} pending documents")
    
    # Dry run - just list documents
    if args.dry_run:
        print("\n[DRY RUN] Documents that would be processed:")
        for i, doc in enumerate(documents[:20], 1):
            print(f"  {i}. {doc.filename} (PMCID: {doc.pmcid or 'N/A'})")
        if len(documents) > 20:
            print(f"  ... and {len(documents) - 20} more")
        return
    
    # Process documents
    print("\n🚀 Starting processing...\n")
    
    # Pre-load model in main thread to avoid race conditions with meta tensors in multi-threaded initialization
    if args.workers > 1:
        print("📥 Pre-loading embedding model...")
        pre_load_model()
    
    start_time = time.time()
    total_docs_requested = args.limit
    
    # Large loop for autonomous processing if limit is unlimited (0) or larger than one fetch
    while True:
        # Determine fetch limit for this iteration
        # If total_docs_requested is 0, we fetch 1000 at a time to keep D1 responses manageable
        fetch_limit = 1000 if total_docs_requested <= 0 else min(total_docs_requested, 1000)
        
        # Get pending documents
        status_msg = "pending and error" if args.include_errors else "pending"
        print(f"\n📥 Fetching next {fetch_limit} {status_msg} documents...")
        documents = get_pending_documents(
            limit=fetch_limit, 
            year=args.year,
            month=args.month,
            include_errors=args.include_errors
        )
        
        if not documents:
            print("✓ No more pending documents found.")
            break
            
        print(f"📦 Processing {len(documents)} documents...")
        
        if args.workers > 1:
            with ThreadPoolExecutor(max_workers=args.workers) as executor:
                # Wrap the executor map with tqdm to track overall progress
                list(tqdm(executor.map(lambda d: process_document(d, data_dir, stats), documents), 
                         total=len(documents), desc="Processing", unit="doc"))
        else:
            for doc in tqdm(documents, desc="Processing", unit="doc"):
                success = process_document(doc, data_dir, stats)
                
                # Save checkpoint every 10 documents
                if (stats.documents_processed + stats.documents_failed) % 10 == 0:
                    stats.save(CHECKPOINT_FILE)
        
        # Periodic checkpoint save
        stats.save(CHECKPOINT_FILE)
        
        # Update remaining count if not unlimited
        if total_docs_requested > 0:
            total_docs_requested -= len(documents)
            if total_docs_requested <= 0:
                break
        
        # Brief pause to be nice to the API
        time.sleep(1)
    
    # Final checkpoint save
    stats.save(CHECKPOINT_FILE)
    
    # Summary
    elapsed = time.time() - start_time
    total_attempted = stats.documents_processed + stats.documents_failed
    docs_per_min = total_attempted / (elapsed / 60) if elapsed > 0 else 0
    
    print("\n" + "=" * 70)
    print("  BACKFILL COMPLETE")
    print("=" * 70)
    print(f"  ✓ Documents processed: {stats.documents_processed}")
    print(f"  ✗ Documents failed: {stats.documents_failed}")
    print(f"  📦 Chunks created: {stats.chunks_created}")
    print(f"  🔢 Vectors uploaded: {stats.vectors_uploaded}")
    print(f"  ⏱️  Time elapsed: {elapsed:.1f}s ({docs_per_min:.1f} docs/min)")
    print("=" * 70)


if __name__ == '__main__':
    main()
