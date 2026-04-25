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

# Try the exact query from search.py
query = (
    "id, title, rent, bhk, furnishing, lat, lng, address, "
    "listing_photos(photo_url), "
    "users(name, trust_score, is_aadhaar_verified), "
    "reviews(rating)"
)

print("Testing search query...")
res = requests.get(f"{url}/rest/v1/listings?select={query}&is_active=eq.true&limit=1", headers=headers)
print(f"Status: {res.status_code}")
print(f"Response: {res.text}")
