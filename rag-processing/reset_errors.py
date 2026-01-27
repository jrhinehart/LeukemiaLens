"""Reset error documents to pending for reprocessing."""
from dotenv import load_dotenv
load_dotenv()

import os
import requests

CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
DATABASE_ID = os.getenv('DATABASE_ID')

url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/d1/database/{DATABASE_ID}/query"
headers = {
    'Authorization': f'Bearer {CLOUDFLARE_API_TOKEN}',
    'Content-Type': 'application/json'
}

response = requests.post(url, headers=headers, json={
    'sql': "UPDATE documents SET status = 'pending', error_message = NULL WHERE status = 'error'"
})

result = response.json()
if result.get('success'):
    changes = result['result'][0].get('meta', {}).get('changes', 0)
    print(f"✓ Reset {changes} documents from 'error' to 'pending'")
else:
    print(f"✗ Failed: {result.get('errors')}")
