# TrustRent: Academic Syllabus Mapping Report
*Prepared for the Software Architecture Analysis (24CS02HT0401) Viva Examination*

This document serves as the definitive reference guide explicitly linking the TrustRent platform's practical implementation and codebase directly to the theoretical concepts taught across Units I to VI of the Software Architecture Analysis curriculum.

---

## Unit I: Architecture Fundamentals & Patterns

**Syllabus Focus:** Architectural styles, patterns, and system design trade-offs.

**TrustRent Implementation:**
- **Client-Server RESTful Style:** The platform completely separates the presentation layer (React frontend) from the business logic layer (Flask API). They communicate statelessly over HTTP/HTTPS.
- **Modular Pattern Design:** The backend utilizes **Flask Blueprints** (`auth.py`, `bookings.py`, `search.py`). This architectural pattern enforces strict separation of concerns, allowing multiple developers to work on different routing files simultaneously without merge conflicts.
- **Architectural Trade-offs:** The team actively weighed the trade-offs of database hosting. To prioritize rapid prototyping and robust security, the team chose a **Backend-as-a-Service (BaaS) provider (Supabase)** over a raw self-hosted SQL instance. This traded raw metal control for guaranteed uptime, automated backups, and built-in Row Level Security.

---

## Unit II: SOA, Cloud & Mobile Architectures

**Syllabus Focus:** Service-Oriented Architecture (SOA), Cloud Infrastructure, and Mobile-first system design.

**TrustRent Implementation:**
- **Cloud-Native Deployment:** TrustRent relies entirely on modern cloud architecture. The backend is hosted on **Render (Platform-as-a-Service)**, ensuring automated environment management. The frontend is distributed globally via the **Vercel Edge Network CDN**, reducing latency for end-users regardless of geographic location.
- **Service-Oriented Integrations (SOA):** The platform is not an isolated monolith. It integrates with external service providers via APIs, notably utilizing **Fast2SMS** for asynchronous SMS notifications and the **Nominatim OpenStreetMap API** for forward-geocoding property addresses to latitude/longitude coordinates.
- **Mobile-First SPA:** Instead of a traditional multi-page website, TrustRent is a **Single Page Application (SPA)** built with React and styled with TailwindCSS. The UI was designed mobile-first, ensuring all touch targets, modals, and property maps scale perfectly to smartphone resolutions, reflecting modern mobile computing architecture.

---

## Unit III: Human-Computer Interaction (HCI)

**Syllabus Focus:** Navigation, response time, localization, and mental models in UX/UI design.

**TrustRent Implementation:**
The system was explicitly retrofitted to comply with eight core HCI principles. Key syllabus mappings include:
- **Internationalization (i18n):** The entire application state can be hot-swapped between English and Hindi using `i18next`. This localizes the application for the primary Indian demographic, a core principle of inclusive HCI.
- **Response Time Strictness:** The geospatial search engine in `PropertySearch.jsx` implements a strict **500ms debounce** on map movements. This ensures the UI remains extremely responsive and fluid without overwhelming the backend API with unnecessary database queries.
- **Mental Models & Metaphors:** The "Trust Score" (0.0 to 5.0) visually mimics common rating systems (like Uber or Amazon), leveraging the user's existing mental models to instantly convey a landlord/tenant's reliability without requiring complex explanations.

---

## Unit IV: Detailed Design & Secure Software

**Syllabus Focus:** Database architecture, developing secure software, and secure design principles.

**TrustRent Implementation:**
- **Relational Integrity:** The database uses a strict **PostgreSQL schema** (`schema.sql`). It enforces referential integrity through UUID foreign keys, ensuring that if a user is deleted, their associated properties and bookings are cascade-deleted to prevent orphaned data.
- **Row Level Security (RLS):** Policies are enforced at the PostgreSQL kernel level. For example, `create policy "Landlord manages listings" on listings for all using (landlord_id = auth.uid());`. This guarantees that even if the Flask API has a vulnerability, the database itself will mathematically reject unauthorized modifications.
- **The Aadhaar Paradox (Secure Design):** To securely handle highly sensitive Indian biometric data, TrustRent utilizes a **Shadow Record System**. Raw Aadhaar numbers are never permanently stored. Upon verification, the number is passed through a **SHA-256 cryptographic hash function**. Only the resulting 64-character hash is saved, mathematically preventing mass plaintext data leaks while still allowing the system to block fraudulent duplicate accounts.

---

## Unit V & VI: Error Handling, Concurrency & System Evolution

**Syllabus Focus:** Error/exception handling strategies, concurrency control, and data structure centered design.

**TrustRent Implementation:**
- **Graceful Degradation:** The Flask backend utilizes strict `try-except` blocks to prevent catastrophic `500 Internal Server Errors` from crashing the worker threads. For example, in `photos.py`, uploads are strictly constrained to 10MB, returning a clear `413 Payload Too Large` localized error message to the frontend rather than timing out the server.
- **Concurrency & State Transitions:** The `tenancies.py` controllers enforce rigid state-machine constraints (`pending` -> `active` -> `ending` -> `ended`). Furthermore, when a tenancy becomes `active`, the system triggers an automatic database update: `supabase.table("listings").update({"status": "rented"})`. This concurrency control immediately removes the property from the search index, mathematically preventing two tenants from booking the exact same property at the same time.
- **System Evolution:** The UI components are highly modular and decoupled from the business logic. Because of the clear JSON API contract between React and Flask, the system can easily evolve (e.g., adding an iOS Native App in the future) without rewriting a single line of backend database code.
