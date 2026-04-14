import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

def diagnose():
    print("Checking tables...")
    # 1. Find the user
    user = supabase.table("users").select("id, name, role").eq("name", "ABC").execute()
    if not user.data:
        print("User 'ABC' not found.")
        return
    
    user_id = user.data[0]['id']
    print(f"Found user ABC: {user_id} (Role: {user.data[0]['role']})")

    # 2. Test Listings fetch
    try:
        print("\nTesting 'listings' fetch...")
        res = supabase.table("listings").select("*").eq("landlord_id", user_id).execute()
        print(f"Success! Found {len(res.data)} listings.")
    except Exception as e:
        print(f"FAILED 'listings' fetch: {e}")

    # 3. Test listing_photos join/fetch
    try:
        print("\nTesting 'listing_photos' fetch...")
        res = supabase.table("listing_photos").select("*").limit(1).execute()
        print(f"Success! Found listing_photos table.")
    except Exception as e:
        print(f"FAILED 'listing_photos' fetch: {e}")

    # 4. Test saved_properties fetch
    try:
        print("\nTesting 'saved_properties' fetch...")
        res = supabase.table("saved_properties").select("*", count="exact").limit(1).execute()
        print(f"Success! Found saved_properties table.")
    except Exception as e:
        print(f"FAILED 'saved_properties' fetch: {e}")

    # 5. Test Bookings fetch with join
    try:
        print("\nTesting 'bookings' join fetch...")
        res = supabase.table("bookings").select("*, tenant:users(name)").eq("landlord_id", user_id).execute()
        print(f"Success! Bookings join worked.")
    except Exception as e:
        print(f"FAILED 'bookings' join: {e}")

if __name__ == "__main__":
    diagnose()
