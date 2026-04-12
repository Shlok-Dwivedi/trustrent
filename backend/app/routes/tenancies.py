from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error
from app.services.notification import notify, MESSAGES

tenancies_bp = Blueprint("tenancies", __name__)

@tenancies_bp.post("/")
@jwt_required()
def request_tenancy():
    """
    Tenant requests to start occupation.
    """
    user_id = get_jwt_identity()
    data = request.json
    
    booking_id = data.get("booking_id")
    listing_id = data.get("listing_id")
    
    if not listing_id:
        return error("listing_id is required")
        
    # Get listing to verify landlord
    listing = supabase.table("listings").select("landlord_id").eq("id", listing_id).execute()
    if not listing.data:
        return error("Listing not found", 404)
        
    landlord_id = listing.data[0]["landlord_id"]

    # If booking_id provided, verify it's confirmed
    if booking_id:
        booking = supabase.table("bookings").select("status, tenant_id").eq("id", booking_id).execute()
        if not booking.data or booking.data[0]["status"] != "confirmed":
            return error("Can only request occupation for a confirmed visit", 400)
        # Ensure only the tenant relative to this booking can request
        if booking.data[0]["tenant_id"] != user_id:
            return error("Unauthorized", 403)
    
    # Prevent duplicate active/requested tenancy for this listing
    existing = supabase.table("tenancies").select("id").eq("listing_id", listing_id).in_("status", ["active", "requested"]).execute()
    if existing.data:
        return error("There is already a tenancy request or active stay for this property", 409)

    try:
        tenancy = supabase.table("tenancies").insert({
            "booking_id": booking_id,
            "listing_id": listing_id,
            "landlord_id": landlord_id,
            "tenant_id": user_id,
            "status": "requested"
        }).execute()
        
        if not tenancy.data:
            return error("Failed to create tenancy record", 500)

        # Notify landlord
        landlord = supabase.table("users").select("mobile").eq("id", landlord_id).execute()
        if landlord.data:
            msg = f"TrustRent: A tenant has requested to move in! Open the app to confirm occupation."
            notify(landlord_id, msg, "tenancy_requested", landlord.data[0]["mobile"])

        return success({"tenancy": tenancy.data[0]}, status=201)
    except Exception as e:
        print(f"Error in request_tenancy: {e}")
        return error(f"Tenancy Request Failed: {str(e)}", 500)

@tenancies_bp.patch("/<tenancy_id>/confirm")
@jwt_required()
def confirm_tenancy(tenancy_id):
    """
    Landlord confirms the occupation request.
    """
    user_id = get_jwt_identity()
    
    tenancy = supabase.table("tenancies").select("*").eq("id", tenancy_id).eq("landlord_id", user_id).execute()
    if not tenancy.data:
        return error("Tenancy request not found or unauthorized", 404)
        
    t = tenancy.data[0]
    if t["status"] != "requested":
        return error("Only pending requests can be confirmed", 400)
        
    # Use Postgres compatible NOW() or handle via default
    import datetime
    today = datetime.date.today().isoformat()

    updated = supabase.table("tenancies").update({
        "status": "active",
        "start_date": today
    }).eq("id", tenancy_id).execute()
    
    # NEW: Automatically mark the listing as rented so it disappears from search
    listing_id = t["listing_id"]
    supabase.table("listings").update({"status": "rented"}).eq("id", listing_id).execute()
    
    # Notify tenant
    tenant_id = t["tenant_id"]
    tenant = supabase.table("users").select("mobile").eq("id", tenant_id).execute()
    if tenant.data:
        msg = "TrustRent: Congratulations! Your landlord has confirmed your occupation. Welcome home!"
        notify(tenant_id, msg, "tenancy_started", tenant.data[0]["mobile"])
        
    return success({"tenancy": updated.data[0]})

@tenancies_bp.get("/")
@jwt_required()
def get_my_tenancies():
    user_id = get_jwt_identity()
    role_res = supabase.table("users").select("role").eq("id", user_id).execute()
    role = role_res.data[0]["role"] if role_res.data else "tenant"

    query = supabase.table("tenancies").select(
        "*, listing:listings(title, address, rent), "
        "landlord:users!tenancies_landlord_id_fkey(name, mobile), "
        "tenant:users!tenancies_tenant_id_fkey(name, mobile)"
    )
    
    if role == "landlord":
        query = query.eq("landlord_id", user_id)
    else:
        query = query.eq("tenant_id", user_id)
        
    try:
        res = query.order("created_at", desc=True).execute()
        return success({"tenancies": res.data})
    except Exception as e:
        # If table doesn't exist yet, return empty list gracefully
        if "PGRST205" in str(e) or "schema cache" in str(e).lower():
            return success({"tenancies": []})
        print(f"Error in get_my_tenancies: {e}")
        return error(str(e), 500)

@tenancies_bp.patch("/<tenancy_id>/end")
@jwt_required()
def end_tenancy(tenancy_id):
    """
    End a tenancy (Check out). Can be called by either party.
    """
    user_id = get_jwt_identity()
    
    tenancy = supabase.table("tenancies").select("*").eq("id", tenancy_id).execute()
    if not tenancy.data:
        return error("Tenancy not found", 404)
        
    t = tenancy.data[0]
    if user_id not in [t["landlord_id"], t["tenant_id"]]:
        return error("Unauthorized", 403)
        
    import datetime
    today = datetime.date.today().isoformat()

    updated = supabase.table("tenancies").update({
        "status": "ended",
        "end_date": today
    }).eq("id", tenancy_id).execute()
    
    # Notify the other party
    other_id = t["tenant_id"] if user_id == t["landlord_id"] else t["landlord_id"]
    other_user = supabase.table("users").select("mobile").eq("id", other_id).execute()
    if other_user.data:
        msg = "TrustRent: Your tenancy has ended. Please leave a review of your experience!"
        notify(other_id, msg, "tenancy_ended", other_user.data[0]["mobile"])
        
    return success({"tenancy": updated.data[0]})
