import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

user_id = "c5e428c1-64cc-48eb-a41f-101fb119f966"

# Test the join query exactly as in reviews.py
try:
    res = requests.get(
        f"{url}/rest/v1/reviews?select=*,reviewer:users!reviews_reviewer_id_fkey(name,profile_pic_url),review_photos(photo_url)&reviewee_id=eq.{user_id}&order=created_at.desc",
        headers=headers
    )
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
