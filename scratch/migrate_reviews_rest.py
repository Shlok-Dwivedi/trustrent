import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Missing Supabase credentials")
    exit(1)

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

print("Fetching reviews with missing listing_id...")
# Use REST API directly
fetch_url = f"{url}/rest/v1/reviews?listing_id=is.null&select=*"
res = requests.get(fetch_url, headers=headers)
reviews = res.json()

print(f"Found {len(reviews)} reviews to fix.")

for r in reviews:
    listing_id = None
    if r.get("booking_id"):
        b_res = requests.get(f"{url}/rest/v1/bookings?id=eq.{r['booking_id']}&select=listing_id", headers=headers)
        b_data = b_res.json()
        if b_data:
            listing_id = b_data[0]["listing_id"]
    elif r.get("tenancy_id"):
        t_res = requests.get(f"{url}/rest/v1/tenancies?id=eq.{r['tenancy_id']}&select=listing_id", headers=headers)
        t_data = t_res.json()
        if t_data:
            listing_id = t_data[0]["listing_id"]
    
    if listing_id:
        print(f"Fixing review {r['id']} -> listing {listing_id}")
        patch_url = f"{url}/rest/v1/reviews?id=eq.{r['id']}"
        requests.patch(patch_url, headers=headers, json={"listing_id": listing_id})
    else:
        print(f"Could not find listing_id for review {r['id']}")

print("Migration complete!")
