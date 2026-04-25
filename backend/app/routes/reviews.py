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
    tenancy_id = data.get("tenancy_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not (booking_id or tenancy_id) or not rating:
        return error("booking_id or tenancy_id and rating required")
    if not (1 <= int(rating) <= 5):
        return error("Rating must be between 1 and 5")

    try:
        # If it's a visit review
        if booking_id:
            source = supabase.table("bookings").select("tenant_id, landlord_id, listing_id, status").eq("id", booking_id).execute()
            review_type = "visit"
        else:
            source = supabase.table("tenancies").select("tenant_id, landlord_id, listing_id, status").eq("id", tenancy_id).execute()
            review_type = "living"

        if not source.data:
            return error("Reference not found", 404)

        s = source.data[0]
        if user_id not in [s["tenant_id"], s["landlord_id"]]:
            return error("Unauthorized", 403)

        reviewee_id = s["landlord_id"] if user_id == s["tenant_id"] else s["tenant_id"]

        # Deduplicate
        q = supabase.table("reviews").select("id").eq("reviewer_id", user_id)
        if booking_id: q = q.eq("booking_id", booking_id)
        else: q = q.eq("tenancy_id", tenancy_id)

        existing = q.execute()
        if existing.data:
            return error("You have already reviewed this", 409)

        review = supabase.table("reviews").insert({
            "booking_id": booking_id,
            "tenancy_id": tenancy_id,
            "listing_id": s["listing_id"],
            "reviewer_id": user_id,
            "reviewee_id": reviewee_id,
            "type": review_type,
            "rating": int(rating),
            "comment": comment
        }).execute()

        review_id = review.data[0]["id"]
        photo_urls = data.get("photo_urls", [])
        if photo_urls:
            try:
                photo_rows = [{"review_id": review_id, "photo_url": url} for url in photo_urls]
                supabase.table("review_photos").insert(photo_rows).execute()
            except Exception as photo_err:
                print(f"[WARN] review_photos insert failed: {photo_err}")
                # Don't fail the whole review just because photos couldn't be saved

        recalculate_trust_score(reviewee_id)

        reviewee = supabase.table("users").select("mobile").eq("id", reviewee_id).execute()
        if reviewee.data:
            notify(reviewee_id, MESSAGES["review_received"], "review_received", reviewee.data[0]["mobile"])

        return success({
            "review": review.data[0],
            "photos": photo_urls
        }, status=201)

    except Exception as e:
        print(f"[ERROR] create_review: {e}")
        import traceback
        traceback.print_exc()
        return error(f"Failed to submit review: {str(e)}", 500)


@reviews_bp.get("/user/<user_id>")
def get_user_reviews(user_id):
    reviews = supabase.table("reviews").select(
        "*, reviewer:users!reviews_reviewer_id_fkey(name, profile_pic_url), review_photos(photo_url)"
    ).eq("reviewee_id", user_id).order("created_at", desc=True).execute()
    return success({"reviews": reviews.data})


@reviews_bp.get("/my")
@jwt_required()
def get_my_submitted_reviews():
    """Returns all reviews the current user has submitted (as reviewer).
    Used by the frontend to pre-populate 'already reviewed' state on page load."""
    user_id = get_jwt_identity()
    try:
        reviews = supabase.table("reviews").select("id, booking_id, tenancy_id").eq("reviewer_id", user_id).execute()
        # Return both booking_ids and tenancy_ids so the frontend can check either
        reviewed_booking_ids = [r["booking_id"] for r in reviews.data if r.get("booking_id")]
        reviewed_tenancy_ids = [r["tenancy_id"] for r in reviews.data if r.get("tenancy_id")]
        return success({"booking_ids": reviewed_booking_ids, "tenancy_ids": reviewed_tenancy_ids})
    except Exception as e:
        return success({"booking_ids": [], "tenancy_ids": []})  # Fail silently — don't block dashboard load


def recalculate_trust_score(user_id: str):
    user_data = supabase.table("users").select("is_aadhaar_verified").eq("id", user_id).execute()
    is_verified = user_data.data[0]["is_aadhaar_verified"] if user_data.data else False
    
    reviews = supabase.table("reviews").select("rating, type").eq("reviewee_id", user_id).execute()
    
    # Weighted average
    # type 'living' (tenancy) = 1.5 weight
    # type 'visit' = 1.0 weight
    total_weighted_sum = 0.0
    total_weight = 0.0
    
    if reviews.data:
        for r in reviews.data:
            weight = 1.5 if r.get("type") == "living" else 1.0
            total_weighted_sum += (r["rating"] * weight)
            total_weight += weight
        
        avg_rating = total_weighted_sum / total_weight
    else:
        avg_rating = 0.0
    
    # Add Aadhaar bonus (2.0) if verified, capped at 5.0
    final_score = avg_rating
    if is_verified:
        final_score = min(avg_rating + 2.0, 5.0)
    
    supabase.table("users").update({"trust_score": round(final_score, 2)}).eq("id", user_id).execute()
