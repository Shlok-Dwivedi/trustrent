import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

def diagnose():
    user = supabase.table("users").select("id, name").eq("name", "ABC").execute()
    if not user.data: return print("User 'ABC' not found.")
    user_id = user.data[0]['id']
    print(f"User ID: {user_id}")

    # TEST REVIEWS
    try:
        print("\nTesting 'reviews' join...")
        res = supabase.table("reviews").select("*, reviewer:users(name)").eq("reviewee_id", user_id).execute()
        print("Reviews Success")
    except Exception as e:
        print(f"FAILED reviews: {e}")

    # TEST MESSAGES
    try:
        print("\nTesting 'messages' join...")
        res = supabase.table("messages").select("*, sender:users(name)").limit(1).execute()
        print("Messages Success")
    except Exception as e:
        print(f"FAILED messages: {e}")

if __name__ == "__main__":
    diagnose()
