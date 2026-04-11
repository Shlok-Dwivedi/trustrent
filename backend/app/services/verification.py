from app.config import supabase
from app.utils.helpers import hash_aadhaar


def check_shadow_record(aadhaar_number: str) -> dict | None:
    h = hash_aadhaar(aadhaar_number)
    result = supabase.table("shadow_records").select("*").eq("aadhaar_hash", h).execute()
    return result.data[0] if result.data else None


def create_shadow_record(aadhaar_number: str, mobile: str):
    h = hash_aadhaar(aadhaar_number)
    existing = supabase.table("shadow_records").select("id").eq("aadhaar_hash", h).execute()
    if not existing.data:
        supabase.table("shadow_records").insert({
            "aadhaar_hash": h,
            "mobile": mobile
        }).execute()
    return h


def verify_aadhaar(user_id: str, aadhaar_number: str, mobile: str) -> dict:
    shadow = check_shadow_record(aadhaar_number)

    if shadow and shadow.get("mobile") != mobile:
        return {"success": False, "reason": "duplicate_aadhaar"}

    aadhaar_hash = create_shadow_record(aadhaar_number, mobile)

    supabase.table("users").update({
        "aadhaar_hash": aadhaar_hash,
        "is_aadhaar_verified": True
    }).eq("id", user_id).execute()

    return {"success": True, "aadhaar_hash": aadhaar_hash}
