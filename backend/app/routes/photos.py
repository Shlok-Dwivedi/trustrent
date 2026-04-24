from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.config import supabase
from app.utils.helpers import success, error
import uuid
import os

photos_bp = Blueprint("photos", __name__)

BUCKET = "listing-photos"


@photos_bp.post("/upload")
@jwt_required()
def upload_photo():
    """
    Upload a photo for a listing to Supabase Storage.
    Accepts multipart/form-data with field 'file'.
    Returns the public URL of the uploaded photo.
    """
    user_id = get_jwt_identity()

    if "file" not in request.files:
        return error("No file provided")

    file = request.files["file"]
    if not file or file.filename == "":
        return error("Empty file")

    # Validate MIME type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        return error("Only JPEG, PNG, WebP, GIF images are allowed")

    # Build a unique storage path: <user_id>/<uuid>.<ext>
    ext = os.path.splitext(file.filename or "photo.jpg")[1].lower() or ".jpg"
    filename = f"{user_id}/{uuid.uuid4()}{ext}"

    file_bytes = file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        return error("File size exceeds the 10MB limit", 413)

    try:
        # Upload to Supabase Storage
        supabase.storage.from_(BUCKET).upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": file.content_type, "upsert": "false"},
        )

        # Get the public URL
        public_url = supabase.storage.from_(BUCKET).get_public_url(filename)

        return success({"url": public_url, "path": filename})

    except Exception as e:
        msg = str(e)
        if "already exists" in msg.lower():
            return error("File already uploaded, please try again")
        return error(f"Upload failed: {msg}", 500)


@photos_bp.delete("/delete")
@jwt_required()
def delete_photo():
    """
    Delete a photo from Supabase Storage.
    Accepts JSON with field 'path' (the storage path returned during upload).
    """
    user_id = get_jwt_identity()
    data = request.json or {}
    path = data.get("path", "")

    if not path:
        return error("path is required")

    # Security: ensure the path starts with the user's own folder
    if not path.startswith(f"{user_id}/"):
        return error("Unauthorized", 403)

    try:
        supabase.storage.from_(BUCKET).remove([path])
        return success(message="Photo deleted")
    except Exception as e:
        return error(f"Delete failed: {str(e)}", 500)
