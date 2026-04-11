from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/")
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()

    try:
        notifs = supabase.table("notifications").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(50).execute()
        return success({"notifications": notifs.data})
    except Exception as e:
        print(f"Warning: /api/notifications error (schema missing?): {e}")
        return success({"notifications": []})


@notifications_bp.patch("/<notif_id>/read")
@jwt_required()
def mark_read(notif_id):
    user_id = get_jwt_identity()

    supabase.table("notifications").update({"is_read": True}).eq(
        "id", notif_id
    ).eq("user_id", user_id).execute()

    return success(message="Marked as read")


@notifications_bp.patch("/read-all")
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()

    supabase.table("notifications").update({"is_read": True}).eq(
        "user_id", user_id
    ).eq("is_read", False).execute()

    return success(message="All notifications marked as read")
