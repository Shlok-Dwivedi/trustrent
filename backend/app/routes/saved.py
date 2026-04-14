from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error

saved_bp = Blueprint("saved", __name__)


@saved_bp.post("/<listing_id>")
@jwt_required()
def save_listing(listing_id):
    user_id = get_jwt_identity()
    try:
        existing = supabase.table("saved_properties").select("id").eq(
            "user_id", user_id
        ).eq("listing_id", listing_id).execute()

        if existing.data:
            return error("Already saved", 409)

        saved = supabase.table("saved_properties").insert({
            "user_id": user_id,
            "listing_id": listing_id
        }).execute()

        return success({"saved": saved.data[0]}, status=201)
    except Exception as e:
        print(f"Error saving listing: {e}")
        return error("Failed to save property. Please try again later.", 500)


@saved_bp.delete("/<listing_id>")
@jwt_required()
def unsave_listing(listing_id):
    user_id = get_jwt_identity()

    supabase.table("saved_properties").delete().eq(
        "user_id", user_id
    ).eq("listing_id", listing_id).execute()

    return success(message="Removed from saved")


@saved_bp.get("/")
@jwt_required()
def get_saved():
    user_id = get_jwt_identity()

    saved = supabase.table("saved_properties").select(
        "listing_id, listings(id, title, rent, bhk, address, lat, lng, "
        "listing_photos(photo_url), users(name, trust_score, is_aadhaar_verified))"
    ).eq("user_id", user_id).execute()

    return success({"saved": saved.data})
