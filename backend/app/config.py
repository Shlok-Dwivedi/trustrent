import os
from supabase import create_client

# ----------------------------------------------------
# Supabase Configuration
# ----------------------------------------------------
# This uses the service_role key to allow admin bypass 
# for creating users and reading database tables directly.
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# ----------------------------------------------------
# MOCK IN-MEMORY OTP STORE (Bypassing Redis)
# ----------------------------------------------------
# Dictionary format: { "9999999999": "123456" }
OTP_STORE = {}

