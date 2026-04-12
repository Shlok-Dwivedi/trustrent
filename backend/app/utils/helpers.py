import hashlib
import random
import string


def hash_aadhaar(aadhaar_number: str) -> str:
    clean = aadhaar_number.replace(" ", "").strip()
    return hashlib.sha256(clean.encode()).hexdigest()


def generate_otp(length=6) -> str:
    return "".join(random.choices(string.digits, k=length))


def success(data=None, message="Success", status=200):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp, status


def error(message="Something went wrong", status=400):
    return {"success": False, "message": message, "error": message}, status
