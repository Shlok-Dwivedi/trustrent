from app.config import supabase

res = supabase.table("reviews").select("*").execute()
print(f"Total reviews: {len(res.data)}")
for r in res.data:
    print(f"ID: {r['id']}, Listing ID: {r.get('listing_id')}, Reviewee: {r['reviewee_id']}")
