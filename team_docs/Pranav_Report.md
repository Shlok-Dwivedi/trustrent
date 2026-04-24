# Individual Contribution Report: Pranav
**Role: SRS & Frontend Architecture Lead**

## 1. Role Overview
Pranav served as the primary bridge between the conceptual project vision and the technical frontend execution. As the author of the Software Requirements Specification (SRS), he laid the foundational logic that governed every feature built. Transitioning into the Lead Frontend Architect role, he was responsible for setting up the modern web stack and implementing the core systems that define the user's discovery experience—namely the map-based search and the multi-language support system.

## 2. Key Contributions
### A. Requirements Engineering (SRS v1.0.0)
Pranav authored a 40+ page industry-grade SRS document that served as the "Source of Truth" for the entire team. He meticulously defined the functional requirements (e.g., property listing lifecycle, booking state transitions) and non-functional requirements (e.g., 1-second search latency, 400ms map debounce). His work included creating the Appendix B API Summary and Database Relationship models, which Shlok used to build the backend. Pranav’s focus on edge cases—such as how to handle "Anytime" booking slots—ensured the project had no logical dead-ends.

### B. Core Frontend Infrastructure (React & Vite)
Pranav was responsible for initializing the frontend ecosystem. He chose Vite for its superior build speed and HMR (Hot Module Replacement) capabilities. He designed the folder structure (`/components`, `/pages`, `/locales`, `/store`), ensuring that the project remained organized as it scaled. He integrated Tailwind CSS for the design system and established the global state management patterns using Zustand, allowing for seamless user data sharing across the search, messaging, and profile pages.

### C. Map-Based Search & Discovery
One of the project's most complex features—the Map-Based Search—was architected by Pranav. He integrated Leaflet.js with React to create a performant, interactive map. He implemented the `MapMoveHandler`, a sophisticated component that triggers a property search only after the user stops panning the map (using a 500ms debounce), thereby preventing API overload. He also designed the custom "Price Pill" markers and the "FlyTo" animations that smooth the transition between the list view and the map markers.

### D. Internationalization (i18next)
To make TrustRent accessible to a broader Indian audience, Pranav implemented a full Internationalization (i18n) framework. He configured `i18next` and `react-i18next`, creating the JSON schema for English and Hindi locales. He ensured that every string in the app—from navigation links to error toasts—was wrapped in the `t()` translation hook. This allows the entire platform to toggle languages instantly without a page reload, a key requirement in the final SRS.

## 3. Methodology and Tools
Pranav followed a "User-Centric Design" methodology. He translated the abstract requirements in the SRS into concrete React components by first wireframing the user flows. He maintained a strict "Component Reusability" policy, creating global elements like `Button`, `Input`, and `Card` that ensured visual consistency across the tenant and landlord dashboards.

**Tools Used:**
- **Frameworks:** React 18, Vite
- **Mapping:** Leaflet, OpenStreetMap (Nominatim API)
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **i18n:** i18next, react-i18next
- **State Management:** Zustand
- **Documentation:** Microsoft Word (for SRS), Markdown

## 4. Impact
Pranav’s contribution was the "Visual Engine" of the project. His SRS ensured the team moved in one direction without confusion, and his frontend architecture created a fast, fluid, and multilingual interface. His map-based search system transformed TrustRent from a simple listing site into a professional-grade marketplace tool.
