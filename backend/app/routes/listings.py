from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error

listings_bp = Blueprint("listings", __name__)


@listings_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def create_listing():
    if request.method == "OPTIONS":
        return success({"message": "OK"})
    user_id = get_jwt_identity()

    user = supabase.table("users").select("role, is_aadhaar_verified").eq("id", user_id).execute()
    if not user.data or user.data[0]["role"] != "landlord":
        return error("Only verified landlords can list properties", 403)

    data = request.json
    required = ["title", "rent", "bhk", "address", "lat", "lng"]
    if not all(data.get(f) for f in required):
        return error(f"Required fields: {', '.join(required)}")

    try:
        listing = supabase.table("listings").insert({
            "landlord_id": user_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "rent": data["rent"],
            "bhk": data["bhk"],
            "address": data["address"],
            "lat": data["lat"],
            "lng": data["lng"],
            "furnishing": data.get("furnishing", "unfurnished"),
            "amenities": data.get("amenities", []),
            "visit_days": data.get("visit_days", []),
            "visit_slots": data.get("visit_slots", []),
            "is_active": True,
            "is_archived": False
        }).execute()

        if not listing.data:
            return error("Failed to create listing record", 500)

        listing_id = listing.data[0]["id"]

        photos = data.get("photo_urls", [])
        if photos:
            photo_rows = [{"listing_id": listing_id, "photo_url": url, "order": i}
                          for i, url in enumerate(photos)]
            supabase.table("listing_photos").insert(photo_rows).execute()

        return success({"listing": listing.data[0]}, status=201)
    except Exception as e:
        print(f"Error creating listing: {e}")
        return error(f"Server Error: {str(e)}", 500)


@listings_bp.get("/")
@jwt_required()
def get_my_listings():
    user_id = get_jwt_identity()
    
    try:
        # Fetch listings. We try to get photos too. 
        # If the join fails, we'll catch and retry without it.
        res = supabase.table("listings").select("*").eq("landlord_id", user_id).eq("is_archived", False).execute()
        listings_data = res.data or []
        
        for l in listings_data:
            # 1. Fetch photos for this listing
            photos = supabase.table("listing_photos").select("photo_url, order").eq("listing_id", l["id"]).execute()
            l["listing_photos"] = photos.data or []
            
            # 2. Fetch saved counts
            try:
                saved = supabase.table("saved_properties").select("id", count="exact").eq("listing_id", l["id"]).execute()
                l["saved_count"] = saved.count if hasattr(saved, 'count') and saved.count is not None else 0
            except:
                l["saved_count"] = 0
                
        return success({"listings": listings_data})
    except Exception as e:
        print(f"Error in get_my_listings: {e}")
        return error(str(e), 500)


@listings_bp.get("/<listing_id>")
def get_listing(listing_id):
    listing = supabase.table("listings").select(
        "*, listing_photos(photo_url, order), users(id, name, profile_pic_url, trust_score, is_aadhaar_verified)"
    ).eq("id", listing_id).eq("is_active", True).execute()

    if not listing.data:
        return error("Listing not found", 404)

    result = listing.data[0]
    try:
        reviews = supabase.table("reviews").select(
            "*, reviewer:users(name, profile_pic_url)"
        ).eq("listing_id", listing_id).order("created_at", desc=True).limit(5).execute()
        result["reviews"] = reviews.data
    except Exception as e:
        print(f"Warning: Failed to fetch reviews (cache/schema issue?): {e}")
        result["reviews"] = []

    return success({"listing": result})


@listings_bp.patch("/<listing_id>")
@jwt_required()
def update_listing(listing_id):
    user_id = get_jwt_identity()

    existing = supabase.table("listings").select("landlord_id").eq("id", listing_id).execute()
    if not existing.data or existing.data[0]["landlord_id"] != user_id:
        return error("Not found or unauthorized", 403)

    data = request.json
    allowed = ["title", "description", "rent", "bhk", "furnishing", "amenities", "is_active", "address", "visit_days", "visit_slots"]
    updates = {k: v for k, v in data.items() if k in allowed}

    updated = supabase.table("listings").update(updates).eq("id", listing_id).execute()
    return success({"listing": updated.data[0]})


@listings_bp.delete("/<listing_id>")
@jwt_required()
def archive_listing(listing_id):
    user_id = get_jwt_identity()

    existing = supabase.table("listings").select("landlord_id").eq("id", listing_id).execute()
    if not existing.data or existing.data[0]["landlord_id"] != user_id:
        return error("Not found or unauthorized", 403)

    supabase.table("listings").update({"is_archived": True, "is_active": False}).eq("id", listing_id).execute()
    return success(message="Listing archived")


@listings_bp.post("/<listing_id>/restore")
@jwt_required()
def restore_listing(listing_id):
    user_id = get_jwt_identity()

    existing = supabase.table("listings").select("landlord_id").eq("id", listing_id).execute()
    if not existing.data or existing.data[0]["landlord_id"] != user_id:
        return error("Not found or unauthorized", 403)

    supabase.table("listings").update({"is_archived": False, "is_active": True}).eq("id", listing_id).execute()
    return success(message="Listing restored")


@listings_bp.patch("/<listing_id>/view")
@jwt_required(optional=True)
def increment_view(listing_id):
    """
    Increments the view count for a listing.
    Optional JWT to avoid counting the landlord's own views.
    """
    user_id = get_jwt_identity()
    
    # Get current views and landlord_id
    res = supabase.table("listings").select("view_count, landlord_id").eq("id", listing_id).execute()
    if not res.data:
        return error("Listing not found", 404)
        
    listing = res.data[0]
    
    # Don't increment if the logged-in user is the landlord
    if user_id and user_id == listing["landlord_id"]:
        return success({"views": listing["view_count"]})
        
    new_count = (listing["view_count"] or 0) + 1
    supabase.table("listings").update({"view_count": new_count}).eq("id", listing_id).execute()
    
    return success({"views": new_count})
