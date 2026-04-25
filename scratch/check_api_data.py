import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')

# We need to test the actual LIVE API, not the local one
API_URL = "https://trustrent-api-9lmv.onrender.com/api/bookings/"
# I don't have a user token for the live API easily, but I can check the Supabase data directly
SUPA_URL = os.getenv("SUPABASE_URL")
SUPA_KEY = os.getenv("SUPABASE_SERVICE_KEY")

headers = {
    "apikey": SUPA_KEY,
    "Authorization": f"Bearer {SUPA_KEY}"
}

# Emulate the select query from the backend
res = requests.get(f"{SUPA_URL}/rest/v1/bookings?select=*,tenant:users!bookings_tenant_id_fkey(id,name)", headers=headers)
data = res.json()

if data:
    print(f"Sample Tenant from DB: {data[0].get('tenant')}")
else:
    print("No bookings found in DB")
