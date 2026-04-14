import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

def verify_all():
    user = supabase.table("users").select("id, name").eq("name", "ABC").execute()
    user_id = user.data[0]['id']
    print(f"Verifying for user: {user_id}")

    try:
        print("\nTesting 'bookings' join...")
        res = supabase.table("bookings").select("*, tenant:users!bookings_tenant_id_fkey(name)").eq("landlord_id", user_id).execute()
        print(f"Bookings Success: Found {len(res.data)}")
    except Exception as e:
        print(f"FAILED bookings: {e}")

    try:
        print("\nTesting 'reviews' join...")
        res = supabase.table("reviews").select("*, reviewer:users!reviews_reviewer_id_fkey(name)").eq("reviewee_id", user_id).execute()
        print(f"Reviews Success: Found {len(res.data)}")
    except Exception as e:
        print(f"FAILED reviews: {e}")

    try:
        print("\nTesting 'messages' join...")
        res = supabase.table("messages").select("*, receiver:users!messages_receiver_id_fkey(name)").eq("sender_id", user_id).execute()
        print(f"Messages Success: Found {len(res.data)}")
    except Exception as e:
        print(f"FAILED messages: {e}")

if __name__ == "__main__":
    verify_all()
