from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.services.notification import notify, MESSAGES
from app.utils.helpers import success, error

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.post("/")
@jwt_required()
def create_review():
    user_id = get_jwt_identity()
    data = request.json

    booking_id = data.get("booking_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not booking_id or not rating:
        return error("booking_id and rating required")
    if not (1 <= int(rating) <= 5):
        return error("Rating must be between 1 and 5")

    booking = supabase.table("bookings").select(
        "tenant_id, landlord_id, listing_id, status"
    ).eq("id", booking_id).execute()

    if not booking.data:
        return error("Booking not found", 404)

    b = booking.data[0]
    if b["status"] != "confirmed":
        return error("Can only review after a confirmed visit")
    if user_id not in [b["tenant_id"], b["landlord_id"]]:
        return error("Unauthorized", 403)

    reviewee_id = b["landlord_id"] if user_id == b["tenant_id"] else b["tenant_id"]

    existing = supabase.table("reviews").select("id").eq(
        "booking_id", booking_id
    ).eq("reviewer_id", user_id).execute()
    if existing.data:
        return error("You have already reviewed this visit", 409)

    review = supabase.table("reviews").insert({
        "booking_id": booking_id,
        "listing_id": b["listing_id"],
        "reviewer_id": user_id,
        "reviewee_id": reviewee_id,
        "rating": int(rating),
        "comment": comment
    }).execute()

    recalculate_trust_score(reviewee_id)

    reviewee = supabase.table("users").select("mobile").eq("id", reviewee_id).execute()
    if reviewee.data:
        notify(reviewee_id, MESSAGES["review_received"], "review_received", reviewee.data[0]["mobile"])

    return success({"review": review.data[0]}, status=201)


@reviews_bp.get("/user/<user_id>")
def get_user_reviews(user_id):
    reviews = supabase.table("reviews").select(
        "*, reviewer:users!reviews_reviewer_id_fkey(name, profile_pic_url)"
    ).eq("reviewee_id", user_id).order("created_at", desc=True).execute()
    return success({"reviews": reviews.data})


def recalculate_trust_score(user_id: str):
    user_data = supabase.table("users").select("is_aadhaar_verified").eq("id", user_id).execute()
    is_verified = user_data.data[0]["is_aadhaar_verified"] if user_data.data else False
    
    reviews = supabase.table("reviews").select("rating").eq("reviewee_id", user_id).execute()
    
    # Base score is average of ratings (or 0 if no reviews)
    avg_rating = 0.0
    if reviews.data:
        avg_rating = sum(r["rating"] for r in reviews.data) / len(reviews.data)
    
    # Add Aadhaar bonus (2.0) if verified, capped at 5.0
    final_score = avg_rating
    if is_verified:
        final_score = min(avg_rating + 2.0, 5.0)
    
    supabase.table("users").update({"trust_score": round(final_score, 2)}).eq("id", user_id).execute()
