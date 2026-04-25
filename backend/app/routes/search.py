from flask import Blueprint, request
from app.config import supabase
from app.utils.helpers import success, error

search_bp = Blueprint("search", __name__)


@search_bp.route("/", methods=["GET", "OPTIONS"], strict_slashes=False)
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
            "users(name, trust_score, is_aadhaar_verified), "
            "reviews(rating)"
        ).eq("is_active", True).eq("is_archived", False).eq("status", "available")

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

        try:
            res = q.execute()
            data = res.data or []
            for item in data:
                revs = item.get("reviews", [])
                item["review_count"] = len(revs)
                if revs:
                    item["avg_rating"] = sum(r["rating"] for r in revs) / len(revs)
                else:
                    item["avg_rating"] = 0
                # Remove raw reviews to keep payload small
                if "reviews" in item: del item["reviews"]
            return success({"listings": data, "count": len(data)})
        except Exception as e:
            # Fallback if 'status' column is missing during migration
            print(f"Search warning: {e}")
            q_fallback = supabase.table("listings").select(
                "id, title, rent, bhk, furnishing, lat, lng, address, "
                "listing_photos(photo_url), "
                "users(name, trust_score, is_aadhaar_verified), "
                "reviews(rating)"
            ).eq("is_active", True).eq("is_archived", False)
            q_fallback = q_fallback.gte("lat", lat - lat_delta).lte("lat", lat + lat_delta)
            q_fallback = q_fallback.gte("lng", lng - lng_delta).lte("lng", lng + lng_delta)
            res = q_fallback.execute()
            data = res.data or []
            for item in data:
                revs = item.get("reviews", [])
                item["review_count"] = len(revs)
                item["avg_rating"] = sum(r["rating"] for r in revs) / len(revs) if revs else 0
                if "reviews" in item: del item["reviews"]
            return success({"listings": data, "count": len(data)})

    results = perform_search(radius_km)
    
    # Fallback to 100km city-level search if 0 results
    if not results.data and radius_km < 100:
        results = perform_search(100)
        return success({"listings": results.data, "count": len(results.data), "fallback": True})

    return success({"listings": results.data, "count": len(results.data)})


def cos_approx(lat_deg: float) -> float:
    import math
    return math.cos(math.radians(lat_deg)) or 0.0001
