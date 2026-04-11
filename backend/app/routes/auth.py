import random
import os
from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.config import supabase, OTP_STORE
from app.services.notification import send_sms
from app.utils.helpers import success, error

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/admin-login")
def admin_login():
    data = request.json or {}
    secret = data.get("secret", "").strip()
    
    # Check against environment variable, fallback to default
    valid_secret = os.getenv("ADMIN_SECRET_KEY", "trustrent_admin")
    
    if secret == valid_secret:
        jwt_token = create_access_token(identity="admin_system")
        return success({
            "token": jwt_token, 
            "user": {
                "id": "admin_system",
                "role": "admin",
                "name": "System Administrator",
                "is_profile_complete": True,
                "is_aadhaar_verified": True
            }
        })
    
    return error("Invalid admin credentials", 401)


@auth_bp.route("/send-otp", methods=["POST", "OPTIONS"])
def send_otp():
    """
    Simulates sending an SMS OTP.
    It generates a random 6-digit code, stores it in the Mock OTP_STORE dictionary,
    and prints it to the terminal buffer for exactly testing purposes.
    """
    if request.method == "OPTIONS":
        return success({"message": "OK"})

    data = request.json
    mobile = data.get("mobile", "").replace("+91", "").strip()

    if not mobile or len(mobile) < 10:
        return error("Valid 10-digit mobile number required", status=400)

    # Generate a random 6-digit OTP
    generated_otp = str(random.randint(100000, 999999))
    
    # Store in memory mapping the phone number to the OTP
    OTP_STORE[mobile] = generated_otp

    # Send via real SMS gateway (or simulated fallback)
    message = f"Your TrustRent verification code is {generated_otp}. Do not share this."
    send_sms(mobile, message)

    return success({"message": "OTP sent successfully"})


@auth_bp.route("/verify-otp", methods=["POST", "OPTIONS"])
def verify_otp():
    """
    Validates the OTP inputted by the incoming user against the OTP_STORE.
    If successful, finds or creates the user in Supabase and mints a JWT token.
    """
    data = request.json
    mobile = data.get("mobile", "").replace("+91", "").strip()
    otp = data.get("otp", "").strip()

    if not mobile or not otp:
        return error("Mobile and OTP are required", 400)

    # Check if the OTP matches our in-memory store
    stored_otp = OTP_STORE.get(mobile)
    if not stored_otp or stored_otp != otp:
        return error("Invalid or expired OTP", 401)

    # OTP is valid! Remove it from memory so it can't be reused
    del OTP_STORE[mobile]

    # Check if this user already exists in Supabase
    existing = supabase.table("users").select("*").eq("mobile", mobile).execute()

    if existing.data:
        # Existing User
        user = existing.data[0]
        jwt_token = create_access_token(identity=user["id"])
        return success({"token": jwt_token, "user": user, "is_new": False})
    
    # New User! Create them in Supabase
    new_user = supabase.table("users").insert({
        "mobile": mobile,
        "is_aadhaar_verified": False,
        "is_profile_complete": False,
        "trust_score": 0.0,
        "role": None
    }).execute()

    user = new_user.data[0]
    jwt_token = create_access_token(identity=user["id"])
    return success({"token": jwt_token, "user": user, "is_new": True}, status=201)


@auth_bp.post("/setup-profile")
@jwt_required()
def setup_profile():
    user_id = get_jwt_identity()
    data = request.json

    name = data.get("name")
    role = data.get("role")
    email = data.get("email")

    if not name or role not in ["tenant", "landlord"]:
        return error("Name and valid role (tenant/landlord) required", 400)

    updated = supabase.table("users").update({
        "name": name,
        "role": role,
        "email": email,
        "is_profile_complete": True
    }).eq("id", user_id).execute()

    return success({"user": updated.data[0]})


@auth_bp.get("/me")
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    
    if user_id == "admin_system":
        return success({
            "user": {
                "id": "admin_system",
                "role": "admin",
                "name": "System Administrator",
                "is_profile_complete": True,
                "is_aadhaar_verified": True
            }
        })
        
    user = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user.data:
        return error("User not found", 404)
    return success({"user": user.data[0]})


@auth_bp.post("/verify-aadhaar")
@jwt_required()
def verify_aadhaar():
    user_id = get_jwt_identity()
    data = request.json
    
    aadhaar_last_4 = data.get("aadhaar_last_4")
    if not aadhaar_last_4 or len(str(aadhaar_last_4)) != 4:
        return error("Please provide exactly the last 4 digits of your Aadhaar", 400)
    
    # Get current user to update trust score
    user_res = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user_res.data:
        return error("User not found", 404)
        
    user = user_res.data[0]
    # Cap trust score at 5.0
    new_trust_score = min(user.get("trust_score", 0.0) + 2.0, 5.0)

    updated = supabase.table("users").update({
        "is_aadhaar_verified": True,
        "trust_score": new_trust_score
    }).eq("id", user_id).execute()

    return success({"user": updated.data[0], "message": "Aadhaar verified successfully!"})
