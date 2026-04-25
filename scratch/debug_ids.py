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

print("Listings:")
res = requests.get(f"{url}/rest/v1/listings?select=id,title", headers=headers)
for l in res.json():
    print(f"ID: {l['id']}, Title: {l['title']}")

print("\nReviews:")
res = requests.get(f"{url}/rest/v1/reviews?select=id,listing_id,comment,rating", headers=headers)
for r in res.json():
    print(f"ID: {r['id']}, Listing ID: {r.get('listing_id')}, Rating: {r['rating']}, Comment: {r['comment'][:20]}...")
