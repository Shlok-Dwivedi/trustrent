from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.services.notification import notify, MESSAGES
from app.utils.helpers import success, error

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.post("/")
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()

    user = supabase.table("users").select("role, mobile").eq("id", user_id).execute()
    if not user.data or user.data[0]["role"] != "tenant":
        return error("Only tenants can book visits", 403)

    data = request.json
    listing_id = data.get("listing_id")
    slot_date = data.get("slot_date")
    slot_time = data.get("slot_time")

    if not all([listing_id, slot_date, slot_time]):
        return error("listing_id, slot_date, slot_time required")

    listing = supabase.table("listings").select(
        "landlord_id, title, status, users(mobile)"
    ).eq("id", listing_id).eq("is_active", True).execute()

    if not listing.data:
        return error("Listing not found or inactive", 404)
        
    if listing.data[0].get("status") == "rented":
        return error("This property is currently occupied and not available for visits", 400)

    landlord_id = listing.data[0]["landlord_id"]
    landlord_mobile = listing.data[0]["users"]["mobile"]

    # prevent duplicate pending booking
    existing = supabase.table("bookings").select("id").eq(
        "tenant_id", user_id
    ).eq("listing_id", listing_id).eq("status", "pending").execute()

    if existing.data:
        return error("You already have a pending request for this property", 409)

    booking = supabase.table("bookings").insert({
        "tenant_id": user_id,
        "landlord_id": landlord_id,
        "listing_id": listing_id,
        "slot_date": slot_date,
        "slot_time": slot_time,
        "status": "pending"
    }).execute()

    notify(landlord_id, MESSAGES["visit_requested"], "visit_requested", landlord_mobile)

    return success({"booking": booking.data[0]}, status=201)


@bookings_bp.get("/")
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    user = supabase.table("users").select("role").eq("id", user_id).execute()
    if not user.data:
        return error("User not found", 404)

    role = user.data[0]["role"]
    status_filter = request.args.get("status")

    if role == "tenant":
        query = supabase.table("bookings").select(
            "*, listing:listings(title, address, rent, listing_photos(photo_url)), "
            "landlord:users!bookings_landlord_id_fkey(name, profile_pic_url, trust_score)"
        ).eq("tenant_id", user_id)
    else:
        query = supabase.table("bookings").select(
            "*, listing:listings(title, address, rent), "
            "tenant:users!bookings_tenant_id_fkey(name, profile_pic_url, trust_score, is_aadhaar_verified)"
        ).eq("landlord_id", user_id)

    if status_filter:
        query = query.eq("status", status_filter)

    bookings = query.order("created_at", desc=True).execute()
    return success({"bookings": bookings.data})


@bookings_bp.patch("/<booking_id>/respond")
@jwt_required()
def respond_to_booking(booking_id):
    user_id = get_jwt_identity()
    data = request.json
    action = data.get("action")

    if action not in ["accept", "decline"]:
        return error("action must be 'accept' or 'decline'")

    booking = supabase.table("bookings").select(
        "*, tenant:users!bookings_tenant_id_fkey(mobile)"
    ).eq("id", booking_id).eq("landlord_id", user_id).eq("status", "pending").execute()

    if not booking.data:
        return error("Booking not found or already responded", 404)

    new_status = "confirmed" if action == "accept" else "declined"
    updated = supabase.table("bookings").update(
        {"status": new_status}
    ).eq("id", booking_id).execute()

    tenant_id = booking.data[0]["tenant_id"]
    tenant_mobile = booking.data[0]["tenant"]["mobile"]
    msg_key = "visit_confirmed" if action == "accept" else "visit_declined"
    notify(tenant_id, MESSAGES[msg_key], msg_key, tenant_mobile)

    return success({"booking": updated.data[0]})


@bookings_bp.patch("/<booking_id>/cancel")
@jwt_required()
def cancel_booking(booking_id):
    user_id = get_jwt_identity()

    booking = supabase.table("bookings").select("tenant_id, status").eq("id", booking_id).execute()
    if not booking.data:
        return error("Booking not found", 404)

    b = booking.data[0]
    if b["tenant_id"] != user_id:
        return error("Unauthorized", 403)
    if b["status"] not in ["pending", "confirmed"]:
        return error("Cannot cancel this booking")

    updated = supabase.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()
    return success({"booking": updated.data[0]})
