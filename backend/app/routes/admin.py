from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error

admin_bp = Blueprint("admin", __name__)

def verify_admin():
    identity = get_jwt_identity()
    if identity != "admin_system":
        return False
    return True

@admin_bp.get("/stats")
@jwt_required()
def get_stats():
    if not verify_admin(): return error("Forbidden", 403)
    
    # Since Supabase python client doesn't support easy count queries without selecting data,
    # and this is a mock project, we fetch minimal columns.
    users_res = supabase.table("users").select("id", count="exact").execute()
    listings_res = supabase.table("listings").select("id", count="exact").execute()
    bookings_res = supabase.table("bookings").select("id", count="exact").execute()
    
    return success({
        "total_users": users_res.count if hasattr(users_res, 'count') else len(users_res.data),
        "total_listings": listings_res.count if hasattr(listings_res, 'count') else len(listings_res.data),
        "total_bookings": bookings_res.count if hasattr(bookings_res, 'count') else len(bookings_res.data)
    })

@admin_bp.get("/users")
@jwt_required()
def get_users():
    if not verify_admin(): return error("Forbidden", 403)
    
    res = supabase.table("users").select("*").order("created_at", desc=True).execute()
    return success({"users": res.data})

@admin_bp.delete("/users/<user_id>")
@jwt_required()
def delete_user(user_id):
    if not verify_admin(): return error("Forbidden", 403)
    
    # Delete the user. Because of cascading foreign keys in schema.sql, 
    # bookings, listings, and messages drop automatically.
    res = supabase.table("users").delete().eq("id", user_id).execute()
    if not res.data:
        return error("User not found or already deleted", 404)
        
    return success({"message": "User deleted permanently"})

@admin_bp.get("/listings")
@jwt_required()
def get_listings():
    if not verify_admin(): return error("Forbidden", 403)
    
    # Fetch all listings across all states (even archived)
    res = supabase.table("listings").select("*, users:landlord_id(name, mobile)").order("created_at", desc=True).execute()
    return success({"listings": res.data})

@admin_bp.patch("/listings/<listing_id>/toggle-archive")
@jwt_required()
def toggle_listing_archive(listing_id):
    if not verify_admin(): return error("Forbidden", 403)
    
    listing = supabase.table("listings").select("is_archived").eq("id", listing_id).execute()
    if not listing.data:
        return error("Listing not found", 404)
        
    current_status = listing.data[0].get("is_archived", False)
    
    # Toggle it
    updated = supabase.table("listings").update({"is_archived": not current_status}).eq("id", listing_id).execute()
    
    return success({"listing": updated.data[0], "message": f"Listing {'archived' if not current_status else 'unarchived'} successfully"})
