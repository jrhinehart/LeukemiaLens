import os
import json
import requests
import logging
import time
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
DATABASE_ID = os.getenv('DATABASE_ID')
BUCKET_NAME = "leukemialens-documents"  # From wrangler.toml

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Headers for Cloudflare API
headers = {
    'Authorization': f'Bearer {CLOUDFLARE_API_TOKEN}',
    'Content-Type': 'application/json'
}

def query_d1(sql: str, params: List = None) -> dict:
    """Execute a query on Cloudflare D1."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/d1/database/{DATABASE_ID}/query"
    payload = {"sql": sql, "params": params or []}
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        logger.error(f"D1 Query Failed: {response.text}")
        return {}
    
    return response.json().get('result', [{}])[0]

def upload_to_r2(key: str, data: dict) -> bool:
    """Upload a JSON object to Cloudflare R2."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/r2/buckets/{BUCKET_NAME}/objects/{key}"
    
    # R2 PUT via API uses a different set of headers if using the direct object API
    # Note: This requires the API token to have "R2 Edit" permissions
    r2_headers = {
        'Authorization': f'Bearer {CLOUDFLARE_API_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    response = requests.put(url, headers=r2_headers, data=json.dumps(data))
    
    if response.status_code == 200:
        return True
    else:
        logger.error(f"R2 Upload Failed for {key}: {response.status_code} - {response.text}")
        return False

def check_r2_exists(key: str) -> bool:
    """Check if an object exists in R2."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/r2/buckets/{BUCKET_NAME}/objects/{key}"
    
    # Cloudflare R2 API doesn't have a simple HEAD via the management API in the same way, 
    # but we can try to GET metadata or just try to GET the object.
    # For simplicity, we'll just try to GET it.
    response = requests.get(url, headers=headers)
    return response.status_code == 200

def migrate():
    logger.info("🚀 Starting Chunk Migration from D1 to R2")
    
    # 1. Find all documents that have chunks with content in D1
    logger.info("🔍 Searching for documents with legacy chunk content in D1...")
    sql = "SELECT DISTINCT document_id FROM chunks WHERE content IS NOT NULL AND content != ''"
    result = query_d1(sql)
    rows = result.get('results', [])
    
    if not rows:
        logger.info("✅ No legacy content found in D1. Everything is already migrated or empty.")
        return

    doc_ids = [row['document_id'] for row in rows]
    logger.info(f"📦 Found {len(doc_ids)} documents to migrate.")

    success_count = 0
    fail_count = 0

    for i, doc_id in enumerate(doc_ids):
        logger.info(f"[{i+1}/{len(doc_ids)}] Processing Document: {doc_id}")
        
        # 2. Fetch all chunks for this document
        chunk_sql = "SELECT id, chunk_index, content FROM chunks WHERE document_id = ? AND content != ''"
        chunk_result = query_d1(chunk_sql, [doc_id])
        chunks = chunk_result.get('results', [])
        
        if not chunks:
            logger.warning(f"  ⚠️ No content chunks found for {doc_id} (might have been migrated already).")
            continue

        # 3. Format payload
        payload = {
            "documentId": doc_id,
            "chunks": [
                {
                    "id": c['id'],
                    "chunkIndex": c['chunk_index'],
                    "content": c['content']
                } for c in chunks
            ]
        }

        # 4. Upload to R2
        r2_key = f"chunks/{doc_id}.json"
        if upload_to_r2(r2_key, payload):
            logger.info(f"  ✅ Uploaded to R2: {r2_key}")
            
            # 5. Clear content in D1
            clear_sql = "UPDATE chunks SET content = '' WHERE document_id = ? AND content != ''"
            clear_result = query_d1(clear_sql, [doc_id])
            
            if clear_result.get('success', False):
                logger.info(f"  🧹 Cleared D1 content for {len(chunks)} chunks.")
                success_count += 1
            else:
                logger.error(f"  ❌ Failed to clear D1 content for {doc_id}")
                fail_count += 1
        else:
            logger.error(f"  ❌ Skipping D1 cleanup for {doc_id} due to R2 upload failure.")
            fail_count += 1
            
        # Optional sleep to avoid rate limiting
        time.sleep(0.1)

    logger.info("=" * 50)
    logger.info("MIGRATION SUMMARY")
    logger.info(f"  Successfully migrated: {success_count} documents")
    logger.info(f"  Failed:               {fail_count} documents")
    logger.info("=" * 50)

if __name__ == "__main__":
    confirm = input("Are you sure you want to migrate chunks? This will clear the 'content' column in D1. (y/N): ")
    if confirm.lower() == 'y':
        migrate()
    else:
        logger.info("Migration cancelled.")
