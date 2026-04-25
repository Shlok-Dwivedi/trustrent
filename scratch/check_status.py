import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

res = requests.get(f"{url}/rest/v1/listings?title=eq.ghdbdbdfb&select=id,title,status,is_active,is_archived", headers=headers)
print(res.json())
