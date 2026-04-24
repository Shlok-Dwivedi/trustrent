import os
import sys
# Add backend to path so we can import supabase config
sys.path.append(os.path.abspath("backend"))

from app.config import supabase

try:
    res = supabase.table("tenancies").select("*").limit(1).execute()
    if res.data:
        print(f"Tenancies columns: {list(res.data[0].keys())}")
    else:
        print("Tenancies table exists but is empty.")
except Exception as e:
    print(f"Error: {e}")
