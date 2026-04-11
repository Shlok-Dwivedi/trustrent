from flask import Blueprint, request
from app.config import supabase
from app.utils.helpers import success, error

search_bp = Blueprint("search", __name__)


@search_bp.get("/")
def search_properties():
    # Required: lat, lng, radius (km)
    # Optional: min_rent, max_rent, bhk, furnishing
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        radius_km = float(request.args.get("radius", 5))
    except (TypeError, ValueError):
        return error("lat, lng are required as numbers")

    def perform_search(r_km):
        # Bounding box approximation (1 degree lat ~ 111km)
        lat_delta = r_km / 111.0
        lng_delta = r_km / (111.0 * abs(cos_approx(lat)))

        q = supabase.table("listings").select(
            "id, title, rent, bhk, furnishing, lat, lng, address, "
            "listing_photos(photo_url), "
            "users(name, trust_score, is_aadhaar_verified)"
        ).eq("is_active", True).eq("is_archived", False)

        q = q.gte("lat", lat - lat_delta).lte("lat", lat + lat_delta)
        q = q.gte("lng", lng - lng_delta).lte("lng", lng + lng_delta)

        min_rent = request.args.get("min_rent")
        max_rent = request.args.get("max_rent")
        bhk = request.args.get("bhk")
        furnishing = request.args.get("furnishing")

        if min_rent: q = q.gte("rent", int(min_rent))
        if max_rent: q = q.lte("rent", int(max_rent))
        if bhk: q = q.eq("bhk", bhk) # Fixed: BHK is stored as '1BHK', '2BHK' etc.
        if furnishing: q = q.eq("furnishing", furnishing)

        return q.execute()

    results = perform_search(radius_km)
    
    # Fallback to 100km city-level search if 0 results
    if not results.data and radius_km < 100:
        results = perform_search(100)
        return success({"listings": results.data, "count": len(results.data), "fallback": True})

    return success({"listings": results.data, "count": len(results.data)})


def cos_approx(lat_deg: float) -> float:
    import math
    return math.cos(math.radians(lat_deg)) or 0.0001
