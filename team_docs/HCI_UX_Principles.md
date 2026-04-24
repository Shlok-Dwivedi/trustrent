# TrustRent: Human-Computer Interaction (HCI) & UX Principles

This document maps core HCI heuristics to the specific features implemented in the TrustRent platform. This proves that the platform's UI/UX is built on academic and industry-standard usability principles.

## 1. Consistency & Standards
*   **Implementation**: The platform utilizes a strict Design System. We use a unified color palette (Deep Teal `#0D7377` for primary actions, Amber for accents) and consistent typography (Inter/Outfit). 
*   **Benefit**: Whether a user is on the Tenant Search page or the Landlord Dashboard, buttons, input fields, and terminology always look and behave exactly the same way.

## 2. Feedback (System Status)
*   **Implementation**: We implemented real-time visual feedback for all actions. 
    *   *Micro-interactions*: Buttons have CSS transition hover states to indicate clickability.
    *   *Asynchronous Feedback*: When logging in or fetching data, a spinning `Loader2` icon appears. 
    *   *System Messages*: Toast notifications instantly appear for both successes ("Booking Confirmed") and failures ("Invalid OTP").

## 3. Visibility of System Status
*   **Implementation**: Users never have to guess what state their data is in.
    *   Bookings utilize clear, color-coded status pills (e.g., Yellow for "Pending", Green for "Confirmed", Red for "Declined").
    *   The Map Search UI actively shows a loading state during the 500ms debounce window so the user knows the map is recalculating.

## 4. Error Prevention and Recovery
*   **Implementation (Prevention)**: We stop errors before they happen.
    *   The Photo Upload system physically blocks files larger than 10MB before they hit the server, preventing database bloat.
    *   Input sanitization: "Anytime" booking slots are automatically normalized to "10:00:00" to prevent database crashes.
*   **Implementation (Recovery)**: If an error does occur, the backend utilizes `try-except` blocks to prevent the app from crashing. Instead of a blank screen, the user receives a graceful error message (e.g., "Invalid OTP, please try again").

## 5. Constraints
*   **Implementation**: We use physical UI constraints to guide user behavior securely.
    *   *Form Constraints*: Submit buttons are dynamically disabled (greyed out) until all required fields are filled correctly.
    *   *Role Constraints (RBAC)*: The UI physically hides Landlord management tools from Tenant accounts, preventing unauthorized navigation.

## 6. Learnability
*   **Implementation**: The system is designed for high "Day-1" learnability.
    *   *Progressive Disclosure*: Instead of a massive signup form, the user only enters a phone number. Only *after* verifying the OTP are they asked for their Name and Role.
    *   *Bilingual Support*: By integrating `i18next` for English/Hindi, the cognitive load is drastically reduced for non-English speakers.

## 7. Simplicity (Minimalist Design)
*   **Implementation**: Guided by the SRS requirement of "Under 5 interactions to book."
    *   We utilize a "Glassmorphism" aesthetic with ample whitespace to reduce visual clutter.
    *   The dual-dashboard architecture ensures that Landlords aren't distracted by Tenant search tools, and Tenants aren't distracted by Landlord analytics.

## 8. Mental Models
*   **Implementation**: The UI maps to real-world expectations.
    *   *Search*: The split-screen "Map on the right, list on the left" perfectly mimics the established mental models set by industry giants like Airbnb and Zillow.
    *   *Messaging*: The chat interface uses standard "Sender on Right, Receiver on Left" speech bubbles, matching the mental model of WhatsApp or iMessage.
    *   *Terminology*: We use standard Indian real estate mental models (e.g., "BHK" instead of "Rooms").
