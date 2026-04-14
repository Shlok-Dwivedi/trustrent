import os
from app import create_app
from flask_jwt_extended import create_access_token
from app.config import supabase

app = create_app()

def debug_dashboard():
    with app.app_context():
        # Get a real user ID
        user = supabase.table("users").select("id, name, role").eq("name", "ABC").execute()
        if not user.data:
            print("User ABC not found")
            return
        
        user_id = user.data[0]['id']
        token = create_access_token(identity=user_id)
        
        headers = {"Authorization": f"Bearer {token}"}
        client = app.test_client()
        
        print(f"DEBUGGING FOR USER: {user.data[0]['name']} ({user_id})")
        
        # Test Listings
        print("\n--- Testing /api/listings/ ---")
        res = client.get("/api/listings/", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error: {res.data}")

        # Test Bookings
        print("\n--- Testing /api/bookings/ ---")
        res = client.get("/api/bookings/", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error: {res.data}")

        # Test Tenancies
        print("\n--- Testing /api/tenancies/ ---")
        res = client.get("/api/tenancies/", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error: {res.data}")

if __name__ == "__main__":
    debug_dashboard()
