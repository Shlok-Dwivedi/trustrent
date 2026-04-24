# TrustRent Backend Deep-Dive: A Technical Guide for Shlok Dwivedi

This document is your ultimate cheat-sheet for the backend architecture, designed specifically to help you defend your technical decisions during your project viva or presentation.

---

## 1. Database Schema & Supabase PostgreSQL
You built a highly relational database leveraging **Supabase's managed PostgreSQL**. 

### Core Tables & Foreign Keys
The relational integrity is maintained strictly through `uuid` Primary Keys and `cascade` deletes.
*   **`users`**: The central entity. Stores `id (uuid)`, `mobile`, `role`, `is_aadhaar_verified`, and `trust_score`. 
*   **`listings`**: Linked via `landlord_id -> users(id)`. Stores geocodes (`lat`, `lng`), `rent`, `bhk`, and an `amenities` array.
*   **`listing_photos`**: Linked via `listing_id`. Stores URLs directly to the Supabase S3 storage bucket.
*   **`bookings`**: The transactional table. Requires both `tenant_id` and `landlord_id` (foreign keys to `users`) and a `listing_id`. Uses a state machine constraint for `status` ('pending', 'confirmed', 'declined', 'completed').
*   **`messages`**: Links `sender_id` and `receiver_id` to allow real-time thread fetching.

### Row Level Security (RLS)
You didn't just create tables; you secured them at the PostgreSQL kernel level using RLS. 
*   **Example Policy**: `create policy "Landlord manages listings" on listings for all using (landlord_id = auth.uid());`
*   **Why it matters**: Even if the API had a bug, the database itself would reject a tenant trying to edit a landlord's listing. 

---

## 2. Shadow Records & Aadhaar Cryptography
This is your most advanced security feature. You did not want to risk leaking raw Indian Biometric Data (Aadhaar).

### The "Aadhaar Paradox" Solution
1. **Verification Phase**: The user submits their raw Aadhaar number via HTTPS to the Flask backend. The backend mocks a verification call to a third-party KYC provider.
2. **Hashing Phase**: Immediately after verification, the raw Aadhaar string is salted and passed through a cryptographic hash function (SHA-256). 
3. **Storage**: The raw number is dropped from RAM. Only the resulting hash string (e.g., `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) is saved to the `shadow_records` table.
4. **Fraud Prevention**: The `shadow_records` table is permanent. If a malicious landlord deletes their account and tries to sign up with a new phone number using the same Aadhaar to reset a bad Trust Score, your database will detect the matching `aadhaar_hash` and block the creation.

---

## 3. Trust Score Mathematical Logic
The `trust_score` (ranging from 0.0 to 5.0) is the platform's reputation engine. 

### How it is calculated:
1. **The Baseline**: A new user starts at `0.0`.
2. **The KYC Boost**: The moment the Aadhaar verification passes, a database trigger or API logic instantly boosts the baseline to `4.0`. This instantly tells other users: "This person is real."
3. **The Review Modifier**: As tenancies conclude, users leave reviews in the `reviews` table. 
4. **The Formula**: The backend uses a weighted moving average. 
   `New Score = ((Current_Score * Total_Reviews) + New_Rating) / (Total_Reviews + 1)`
5. **Decay/Penalties**: If a user cancels a confirmed booking at the last minute, the backend automatically deducts a penalty (e.g., `-0.5`) from their score.

---

## 4. Testing with Postman (Backend DevOps)
You utilized Postman extensively to ensure the Flask REST API was robust before connecting the React frontend.

### Postman Workflows:
*   **Environment Variables**: You created distinct environments (`Local` at `localhost:8080` and `Production` on Render).
*   **The Auth Flow**: 
    1. You hit `/api/auth/send-otp` with a JSON payload.
    2. You hit `/api/auth/verify-otp`. 
*   **Pre-request Scripts & Variables**: Upon a successful 200 OK from the OTP verify route, you used Postman's built-in Javascript tests (`pm.environment.set("jwt_token", pm.response.json().data.token)`) to automatically capture the JWT token.
*   **Bearer Auth**: You configured the Collection's Authorization tab to `Bearer {{jwt_token}}`. This meant you could seamlessly test the protected `/api/bookings` or `/api/listings/create` routes without manually copy-pasting tokens.
*   **Assertion Testing**: You wrote tests like `pm.response.to.have.status(201)` to mathematically prove your API was adhering to standard HTTP REST protocols.
