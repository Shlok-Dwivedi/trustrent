import requests
import os
from app.config import supabase


def send_sms(mobile: str, message: str) -> bool:
    api_key = os.getenv("FAST2SMS_API_KEY")
    
    if not api_key:
        print("\n" + "!"*50)
        print(f"[ SMS SIMULATION MODE ] (API Key Missing)")
        print(f"To: +91 {mobile}")
        print(f"Message: {message}")
        print("!"*50 + "\n")
        return True

    try:
        response = requests.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": api_key},
            json={
                "message": message,
                "language": "english",
                "route": "q",
                "numbers": mobile,
            },
            timeout=10
        )
        res_data = response.json()
        if not res_data.get("return"):
            print(f"\n[ SMS DELIVERY FAILED ]: {res_data.get('message')}")
            print(f"FALLBACK LOG: To +91 {mobile} -> {message}\n")
        return res_data.get("return", False)
    except Exception as e:
        print(f"\n[ SMS CRITICAL ERROR ]: {e}")
        print(f"FALLBACK LOG: To +91 {mobile} -> {message}\n")
        return False


def notify(user_id: str, message: str, notif_type: str, mobile: str = None):
    try:
        supabase.table("notifications").insert({
            "user_id": user_id,
            "message": message,
            "type": notif_type,
            "is_read": False
        }).execute()
    except Exception as e:
        print(f"Warning: Notification blocked (schema missing?): {e}")

    if mobile:
        send_sms(mobile, message)


MESSAGES = {
    "visit_requested": "TrustRent: New visit request for your property. Open the app to respond.",
    "visit_confirmed": "TrustRent: Your visit has been confirmed! Check the app for details.",
    "visit_declined": "TrustRent: Your visit request was declined. Try another time slot.",
    "aadhaar_verified": "TrustRent: Your Aadhaar verification is complete. You now have a Verified badge!",
    "review_received": "TrustRent: You received a new review. Check your profile.",
    "tenancy_started": "TrustRent: Congratulations! Your occupation has been confirmed. Welcome home!",
    "tenancy_ended": "TrustRent: Your tenancy has ended. Please leave a review of your experience!",
}
