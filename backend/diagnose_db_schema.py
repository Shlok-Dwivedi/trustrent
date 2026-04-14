import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

def diagnose():
    print("--- Database Schema Diagnostic ---")
    
    # Check Listings columns
    try:
        res = supabase.table("listings").select("*").limit(1).execute()
        if res.data:
            cols = res.data[0].keys()
            print(f"Listings Columns: {', '.join(cols)}")
            
            # Check for visibility flags
            if 'status' in cols:
                status_res = supabase.table("listings").select("status").limit(5).execute()
                print(f"Current Statuses: {[r.get('status') for r in status_res.data]}")
            else:
                print("MISSING 'status' column in listings!")
                
            # Check for view count
            if 'view_count' in cols:
                print("FOUND 'view_count' (singular)")
            elif 'views_count' in cols:
                print("FOUND 'views_count' (plural) - MISMATCH DETECTED")
            else:
                print("MISSING 'view_count' column!")
                
        else:
            print("No listings found to inspect columns.")
    except Exception as e:
        print(f"Error inspecting listings: {e}")

    # Check saved_properties
    try:
        supabase.table("saved_properties").select("id").limit(1).execute()
        print("FOUND 'saved_properties' table")
    except Exception as e:
        print(f"MISSING or ERROR in 'saved_properties' table: {e}")

if __name__ == "__main__":
    diagnose()
