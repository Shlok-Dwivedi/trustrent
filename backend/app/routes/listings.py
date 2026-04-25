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
    required = ["title", "rent", "bhk", "address", "lat", "lng", "plot_no", "area", "landmark", "city"]
    if not all(data.get(f) for f in required):
        return error(f"Required fields: {', '.join(required)}")

    try:
        # Security: Prevent duplicate or retired property recreation
        existing = supabase.table("listings").select("is_archived").eq("landlord_id", user_id).eq("plot_no", data["plot_no"]).execute()
        if existing.data:
            if existing.data[0].get("is_archived"):
                return error("You have permanently retired this property. It cannot be registered again.", 403)
            return error("You already have an active listing for this property.", 400)
        listing = supabase.table("listings").insert({
            "landlord_id": user_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "rent": data["rent"],
            "bhk": data["bhk"],
            "address": data["address"],
            "plot_no": data["plot_no"],
            "building_name": data.get("building_name", ""),
            "area": data["area"],
            "locality_2": data.get("locality_2", ""),
            "landmark": data["landmark"],
            "city": data["city"],
            "lat": data["lat"],
            "lng": data["lng"],
            "furnishing": data.get("furnishing", "unfurnished"),
            "amenities": data.get("amenities", []),
            "visit_days": data.get("visit_days", []),
            "visit_slots": data.get("visit_slots", []),
            "is_active": True,
            "is_archived": False,
            "status": "available"
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


@listings_bp.get("/recent")
def get_recent_listings():
    """Fetches the 4 newest verified properties for the landing page."""
    try:
        # Fetch 4 latest active listings
        res = supabase.table("listings").select(
            "*, listing_photos(photo_url, order)"
        ).eq("is_active", True).eq("status", "available").order("created_at", desc=True).limit(4).execute()
        
        return success({"listings": res.data})
    except Exception as e:
        print(f"Error in get_recent_listings: {e}")
        return error(str(e), 500)


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
            photos = supabase.table("listing_photos").select("id, photo_url, order").eq("listing_id", l["id"]).execute()
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
        reviews_res = supabase.table("reviews").select(
            "*, reviewer:users!reviews_reviewer_id_fkey(name, profile_pic_url)"
        ).eq("listing_id", listing_id).order("created_at", desc=True).limit(20).execute()
        
        # Filter: only show reviews left by others (tenants), not the landlord themselves
        landlord_id = result.get("user_id")
        result["reviews"] = [r for r in reviews_res.data if r.get("reviewer_id") != landlord_id]
    except Exception as e:
        print(f"Warning: Failed to fetch reviews: {e}")
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
    try:
        res = supabase.table("listings").select("view_count, landlord_id").eq("id", listing_id).execute()
        if not res.data:
            return error("Listing not found", 404)
            
        listing = res.data[0]
        
        # Don't increment if the logged-in user is the landlord
        if user_id and user_id == listing["landlord_id"]:
            return success({"views": listing.get("view_count", 0)})
            
        new_count = (listing.get("view_count") or 0) + 1
        supabase.table("listings").update({"view_count": new_count}).eq("id", listing_id).execute()
        
        return success({"views": new_count})
    except Exception as e:
        print(f"Non-critical view tracker failure: {e}")
        # Return success anyway to avoid breaking property detail page for user
        return success({"views": 0})


@listings_bp.post("/<listing_id>/photos")
@jwt_required()
def add_listing_photo(listing_id):
    """Add a photo URL to a listing (after uploading via /api/photos/upload)."""
    user_id = get_jwt_identity()
    data = request.json or {}
    photo_url = data.get("photo_url")
    if not photo_url:
        return error("photo_url is required")

    # Ownership check
    listing = supabase.table("listings").select("landlord_id").eq("id", listing_id).execute()
    if not listing.data or listing.data[0]["landlord_id"] != user_id:
        return error("Unauthorized", 403)

    try:
        res = supabase.table("listing_photos").insert({
            "listing_id": listing_id,
            "photo_url": photo_url
        }).execute()
        return success({"photo": res.data[0]}, status=201)
    except Exception as e:
        return error(f"Failed to save photo: {str(e)}", 500)


@listings_bp.delete("/<listing_id>/photos/<photo_id>")
@jwt_required()
def delete_listing_photo(listing_id, photo_id):
    """Remove a photo from a listing."""
    user_id = get_jwt_identity()

    # Ownership check
    listing = supabase.table("listings").select("landlord_id").eq("id", listing_id).execute()
    if not listing.data or listing.data[0]["landlord_id"] != user_id:
        return error("Unauthorized", 403)

    try:
        supabase.table("listing_photos").delete().eq("id", photo_id).eq("listing_id", listing_id).execute()
        return success(message="Photo deleted")
    except Exception as e:
        return error(f"Failed to delete photo: {str(e)}", 500)

