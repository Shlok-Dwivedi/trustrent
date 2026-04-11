from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error

messages_bp = Blueprint("messages", __name__)

# NOTE: Real-time delivery is handled entirely on the frontend
# using Supabase Realtime subscriptions on the 'messages' table.
# This backend handles: sending messages, fetching history,
# and listing conversations. No websocket server needed here.


@messages_bp.post("/")
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    data = request.json

    receiver_id = data.get("receiver_id")
    listing_id = data.get("listing_id")
    content = data.get("content", "").strip()

    if not receiver_id or not content:
        return error("receiver_id and content required")

    receiver = supabase.table("users").select("id").eq("id", receiver_id).execute()
    if not receiver.data:
        return error("Receiver not found", 404)

    # conversation_id is always sorted so both sides share same thread
    participants = sorted([user_id, receiver_id])
    conversation_id = f"{participants[0]}_{participants[1]}"
    if listing_id:
        conversation_id += f"_{listing_id}"

    message = supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "sender_id": user_id,
        "receiver_id": receiver_id,
        "listing_id": listing_id,
        "content": content,
        "is_read": False
    }).execute()

    return success({"message": message.data[0]}, status=201)


@messages_bp.get("/conversations")
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()

    # Get distinct conversations this user is part of
    sent = supabase.table("messages").select(
        "conversation_id, receiver_id, content, created_at, "
        "receiver:users!messages_receiver_id_fkey(name, profile_pic_url)"
    ).eq("sender_id", user_id).order("created_at", desc=True).execute()

    received = supabase.table("messages").select(
        "conversation_id, sender_id, content, created_at, "
        "sender:users!messages_sender_id_fkey(name, profile_pic_url)"
    ).eq("receiver_id", user_id).order("created_at", desc=True).execute()

    seen = set()
    conversations = []

    for msg in (sent.data + received.data):
        cid = msg["conversation_id"]
        if cid not in seen:
            seen.add(cid)
            conversations.append(msg)

    return success({"conversations": conversations})


@messages_bp.get("/<conversation_id>")
@jwt_required()
def get_messages(conversation_id):
    user_id = get_jwt_identity()

    if user_id not in conversation_id:
        return error("Unauthorized", 403)

    messages = supabase.table("messages").select(
        "*, sender:users!messages_sender_id_fkey(name, profile_pic_url)"
    ).eq("conversation_id", conversation_id).order("created_at").execute()

    # mark as read
    supabase.table("messages").update({"is_read": True}).eq(
        "conversation_id", conversation_id
    ).eq("receiver_id", user_id).execute()

    return success({"messages": messages.data})
