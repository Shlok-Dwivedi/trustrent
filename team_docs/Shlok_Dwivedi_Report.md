# Individual Contribution Report: Shlok Dwivedi
**Role: Lead Backend & Deployment Architect**

## 1. Role Overview
Shlok Dwivedi served as the technical backbone of the TrustRent project, taking full responsibility for the server-side architecture, database integrity, and production deployment. His role was critical in transforming the conceptual requirements into a high-performance, secure, and scalable reality. As the Lead DevOps engineer, he ensured that the platform transitioned seamlessly from a local development environment to a globally accessible production state.

## 2. Key Contributions
### A. Backend API Development (Flask & Python)
Shlok designed and implemented a modular RESTful API using the Flask framework. Recognizing the need for maintainability, he utilized a Blueprint-based structure to isolate different business domains such as Authentication, Listings, Bookings, and Messaging. This modularity allowed for parallel development and easier debugging. He authored over 30 individual endpoints, ensuring each followed industry-standard REST principles and returned structured JSON responses with appropriate HTTP status codes.

### B. Database & Infrastructure (Supabase & PostgreSQL)
Shlok managed the full lifecycle of the database. He chose Supabase as the backend-as-a-service provider to leverage the power of PostgreSQL while utilizing Supabase’s Real-time capabilities and Storage buckets. He designed the complex relational schema, including foreign key constraints and Row Level Security (RLS) policies. These RLS rules were a cornerstone of the platform’s security, ensuring that landlords could only edit their own listings and tenants could only see their own private messages.

### C. Security & Identity Privacy
A standout contribution was Shlok’s implementation of the "Shadow Records" system. To comply with modern data privacy standards, he engineered a process where Aadhaar numbers are verified and then immediately salted and hashed. These hashes are stored in a protected `shadow_records` table, preventing users from creating multiple accounts to manipulate their Trust Score while ensuring raw biometric ID data never stays on the server. He also implemented stateless authentication using JWT (JSON Web Tokens), managing token issuance, validation, and secure expiration.

### D. Cloud Deployment & DevOps
Shlok managed the end-to-end CI/CD (Continuous Integration/Continuous Deployment) pipeline. He deployed the Flask backend to Render, configuring environment variables, Gunicorn production servers, and health-check monitoring. For the frontend, he utilized Vercel to ensure fast, global delivery via CDN. His work here ensured that the "TrustRent" URL was stable and accessible for the final presentation.

## 3. Methodology and Tools
Shlok’s methodology was rooted in the "Reliability First" principle. He implemented comprehensive `try-except` fail-safes across all critical routes—especially those involving external services like Supabase Storage or SMS APIs—to prevent cascading system failures. This "Graceful Degradation" meant that if a non-critical service (like view tracking) failed, the core user experience remained unaffected.

**Tools Used:**
- **Language/Framework:** Python 3.11, Flask
- **Database:** PostgreSQL (Supabase), Redis (for OTP caching)
- **Security:** JWT, Salted SHA-256 Hashing
- **DevOps:** Render, Vercel, Git, GitHub Actions
- **Testing:** Postman, Diagnostic Scripts (diagnose_api.py)

## 4. Impact
Through Shlok’s leadership in backend development, the project achieved a "Production-Ready" status. His focus on security ensured that the platform is not just a prototype but a secure environment where users can trust their data. His deployment strategy allowed for real-time testing and feedback during the development phase, significantly accelerating the project’s timeline.
