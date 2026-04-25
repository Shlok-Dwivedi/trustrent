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

# Fetch all Nagpur properties and their full status flags
res = requests.get(f"{url}/rest/v1/listings?select=id,title,status,is_active,is_archived,lat,lng", headers=headers)
data = res.json()

print(f"Total listings in DB: {len(data)}")
for l in data:
    if 'Nagpur' in (l.get('address') or '') or 'ghdbdbdfb' in l['title']:
        print(f"Match: {l['title']} | Status: {l['status']} | Active: {l['is_active']} | Lat/Lng: {l['lat']},{l['lng']}")
