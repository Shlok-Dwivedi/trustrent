import os
from supabase import create_client
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv('backend/.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Missing Supabase credentials")
    exit(1)

supabase = create_client(url, key)

print("Fetching reviews with missing listing_id...")
reviews = supabase.table("reviews").select("*").is_("listing_id", "null").execute()

print(f"Found {len(reviews.data)} reviews to fix.")

for r in reviews.data:
    listing_id = None
    if r.get("booking_id"):
        res = supabase.table("bookings").select("listing_id").eq("id", r["booking_id"]).execute()
        if res.data:
            listing_id = res.data[0]["listing_id"]
    elif r.get("tenancy_id"):
        res = supabase.table("tenancies").select("listing_id").eq("id", r["tenancy_id"]).execute()
        if res.data:
            listing_id = res.data[0]["listing_id"]
    
    if listing_id:
        print(f"Fixing review {r['id']} -> listing {listing_id}")
        supabase.table("reviews").update({"listing_id": listing_id}).eq("id", r["id"]).execute()
    else:
        print(f"Could not find listing_id for review {r['id']}")

print("Migration complete!")
