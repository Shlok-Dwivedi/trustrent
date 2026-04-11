# TrustRent — Website Structure & Information Architecture

## 1. Concept & Design Philosophy

### 1.1 Brand Identity

TrustRent embodies trust, transparency, and simplicity in India's rental ecosystem. The platform serves as a neutral trust layer connecting verified tenants with verified landlords through a map-first discovery experience.

### 1.2 Design Principles

**Trust-First UX**: Every interface element reinforces credibility. Verified badges, trust scores, and verification status appear prominently throughout the user journey.

**Map-Centric Discovery**: Property search centers on geographic exploration rather than traditional list-based browsing, making the experience intuitive and visual.

**Minimal Friction**: Registration and verification processes are streamlined to reduce drop-offs while maintaining security standards.

**Mobile-First Indian Context**: Interface designed for primary mobile usage with touch-optimized interactions, considering varying network conditions and regional language considerations.

### 1.3 Visual Direction

| Element | Direction |
|---------|-----------|
| **Color Palette** | Deep teal (#0D7377) as primary trust color, warm amber (#F59E0B) for verification highlights, neutral grays for backgrounds |
| **Typography** | Inter for interface text (excellent legibility), DM Sans for headings (modern, approachable) |
| **Iconography** | Lucide icons with 2px stroke weight, supplemented by custom verified/checkmark icons |
| **Imagery** | High-quality property photography, real people (not stock), subtle gradient overlays for trust messaging |
| **Motion** | Subtle entrance animations (200-300ms), smooth page transitions, micro-interactions for verification states |

---

## 2. Information Architecture

### 2.1 Global Navigation

**Header (Persistent)**

- Logo (left) — Links to home/dashboard
- Search bar (center) — Area/location search with autocomplete
- Navigation links (right):
  - For unauthenticated: "List Property" | "Login" | "Sign Up"
  - For tenants: "My Visits" | "Saved" | "Messages" | Avatar dropdown
  - For landlords: "My Properties" | "Visit Requests" | "Messages" | Avatar dropdown
- Mobile: Hamburger menu with slide-out drawer

**Footer (Persistent)**

- Quick links: About, How It Works, Trust & Safety, Help & Support
- Legal: Privacy Policy, Terms of Service, Cookie Policy
- Social: Twitter/X, Instagram, LinkedIn, WhatsApp
- Language selector (English/Hindi toggle planned)
- Copyright and company info

### 2.2 Page Hierarchy

```
TrustRent
│
├── Landing (Unauthenticated)
│   ├── Hero Section
│   ├── How It Works
│   ├── Trust Features
│   ├── Property Showcase
│   ├── Testimonials
│   ├── App Download CTA
│   └── FAQ
│
├── Authentication
│   ├── Phone Login
│   ├── OTP Verification
│   ├── Registration Type Selection (Tenant/Landlord)
│   └── Aadhaar Verification Flow
│
├── Tenant Portal
│   ├── Dashboard
│   │   ├── Upcoming Visits
│   │   ├── Recent Messages
│   │   ├── Saved Properties
│   │   └── Trust Score Card
│   │
│   ├── Property Search
│   │   ├── Map View
│   │   ├── List View Toggle
│   │   ├── Filters Panel
│   │   └── Property Cards
│   │
│   ├── Property Detail
│   │   ├── Photo Gallery
│   │   ├── Property Info
│   │   ├── Landlord Trust Profile
│   │   ├── Reviews Section
│   │   └── Visit Booking CTA
│   │
│   ├── Visit Management
│   │   ├── Upcoming Visits
│   │   ├── Pending Requests (sent)
│   │   ├── Visit History
│   │   └── Leave Review Modal
│   │
│   ├── Saved Properties
│   └── My Profile
│       ├── Personal Info
│       ├── Verification Status
│       ├── Trust Score Breakdown
│       └── Review History
│
├── Landlord Portal
│   ├── Dashboard
│   │   ├── Property Views This Week
│   │   ├── Active Visit Requests
│   │   ├── Recent Messages
│   │   ├── Trust Score Card
│   │   └── Earnings (placeholder)
│   │
│   ├── Property Management
│   │   ├── All Properties List
│   │   ├── Add New Property
│   │   ├── Edit Property
│   │   ├── Property Analytics
│   │   └── Archive/Restore
│   │
│   ├── Visit Requests
│   │   ├── Pending (action required)
│   │   ├── Accepted
│   │   ├── Declined
│   │   └── Completed
│   │
│   ├── Tenant Applications
│   │   ├── Active Applications
│   │   ├── Tenant Profiles
│   │   └── Application Status
│   │
│   └── My Profile
│       ├── Personal Info
│       ├── Verification Status
│       ├── Trust Score Breakdown
│       └── Review History
│
├── Property Detail (Public/Shared Link)
│   ├── Photo Gallery
│   ├── Property Info
│   ├── Landlord Trust Profile
│   ├── Reviews
│   └── Booking CTA
│
├── About & Informational
│   ├── About Us
│   ├── How It Works
│   ├── Trust & Safety
│   ├── Pricing (if applicable)
│   ├── Blog/Resources
│   └── Careers
│
├── Support
│   ├── Help Center (FAQ)
│   ├── Contact Us
│   ├── Report Issue
│   └── Grievance Redressal
│
└── Legal
    ├── Privacy Policy
    ├── Terms of Service
    ├── Cookie Policy
    └── Grievance Officer
```

---

## 3. User Flows

### 3.1 Tenant Registration & Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      TENANT ONBOARDING FLOW                      │
└─────────────────────────────────────────────────────────────────┘

[Start: Landing Page]
       │
       ▼
┌──────────────────┐
│ Click "Sign Up"  │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: Phone Registration                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  +91 [Mobile Number Input]                          │    │
│  │  [Send OTP Button]                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: OTP Verification                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Enter 6-digit OTP: [ ] [ ] [ ] [ ] [ ] [ ]         │    │
│  │  Auto-read enabled (if supported)                    │    │
│  │  Resend in 30s | Wrong number? Edit                   │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: Basic Profile Setup                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Full Name*                                         │    │
│  │  Email (optional)                                   │    │
│  │  Profile Photo (upload or skip)                     │    │
│  │  You are a: [Tenant] ← Pre-selected                 │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: Aadhaar Verification (Optional)         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔒 Why verify with Aadhaar?                         │    │
│  │  • Builds your trust score                          │    │
│  │  • Landlords trust verified tenants more             │    │
│  │  • Only the Aadhaar hash is stored, never raw data   │    │
│  │                                                      │    │
│  │  [Verify with Aadhaar]  [Skip for Now]               │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼ (if Aadhaar selected)
┌─────────────────────────────────────────────────────────────┐
│              STEP 5: Aadhaar Input & OTP                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Aadhaar Number: [____________]                       │    │
│  │  Registered Mobile: +91 [___________] (for OTP)       │    │
│  │  [Generate Aadhaar OTP]                              │    │
│  │                                                      │    │
│  │  OTP: [ ] [ ] [ ] [ ]  |  [Verify]                   │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 6: Verification Processing                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⏳ Verifying your identity...                       │    │
│  │  [Animated progress indicator]                        │    │
│  │  This takes just a moment                            │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 7: Success!                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✅ Aadhaar Verified                                 │    │
│  │  🎉 Welcome to TrustRent!                            │    │
│  │                                                      │    │
│  │  Your Trust Score: ⭐⭐⭐☆☆ (3/5)                     │    │
│  │  • Aadhaar Verified: +2 points                       │    │
│  │  • Phone Verified: +1 point                           │    │
│  │                                                      │    │
│  │  [Start Exploring Properties]                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

[End: Tenant Dashboard]
```

### 3.2 Landlord Registration & Property Listing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDLORD ONBOARDING FLOW                     │
└─────────────────────────────────────────────────────────────────┘

[Start: Landing Page]
       │
       ▼
┌──────────────────┐
│ Click "List Property" │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: Phone Registration                      │
│  (Same as tenant flow)                                       │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: Basic Profile Setup                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Full Name* | Business Name (if applicable)          │    │
│  │  Email* | Profile Photo                              │    │
│  │  You are a: [ ] Landlord                             │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: Aadhaar Verification                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⚠️ Aadhaar verification is mandatory for landlords │    │
│  │  This ensures tenants can trust your listings        │    │
│  │                                                      │    │
│  │  [Verify with Aadhaar]                               │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: Property Listing Creation                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Property Type: [Apartment] [Villa] [PG] [Room]    │    │
│  │  Title*: __________________________________         │    │
│  │  Description*: __________________________________   │    │
│  │  Rent*: _______ | Security Deposit*: ________       │    │
│  │  City*: _________ | Area*: ____________             │    │
│  │  Address (visible only after booking): _________    │    │
│  │                                                      │    │
│  │  Photos: [Upload up to 10] [ ] [ ] [ ]               │    │
│  │          Drag to reorder, first = cover photo      │    │
│  │                                                      │    │
│  │  Amenities: ☐ Parking ☐ AC ☐ WiFi ☐ furnished...  │    │
│  │  Available From: [Date Picker]                      │    │
│  │  Preferred Tenants: ☐ Family ☐ Bachelor ☐ Anyone   │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 5: Pin Location on Map                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │                                             │    │    │
│  │  │         [Interactive Google Map]            │    │    │
│  │  │         Click to pin exact location         │    │    │
│  │  │         (Exact address hidden from users)   │    │    │
│  │  │                                             │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │  Area detected: Koramangala, Bangalore            │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 6: Visit Availability Setup                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Available visiting days:                           │    │
│  │  [Mon ✓] [Tue ✓] [Wed ✓] [Thu ✓] [Fri ✓] [Sat □]   │    │
│  │                                                      │    │
│  │  Preferred time slots:                              │    │
│  │  [ ] Morning (9 AM - 12 PM)                        │    │
│  │  [ ] Afternoon (12 PM - 4 PM)                      │    │
│  │  [ ] Evening (4 PM - 7 PM)                         │    │
│  └─────────────────────────────────────────────────────┘    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 7: Preview & Publish                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Preview how your listing looks to tenants]        │    │
│  │                                                      │    │
│  │  Trust Badge Preview:                               │    │
│  │  Your listing will show:                            │    │
│  │  • ✅ Verified Landlord badge                        │    │
│  │  • ⭐ 0.0 Trust Score (builds with reviews)        │    │
│  │                                                      │    │
│  │  [Save as Draft]  [Publish Listing]                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

[End: Landlord Dashboard with new property visible]
```

### 3.3 Property Discovery & Visit Booking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPERTY DISCOVERY FLOW                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────────────────────────────┐
│ MAP VIEW     │     │  FILTER PANEL                           │
│              │     │  ┌──────────────────────────────────┐   │
│    [Google   │     │  │ Property Type: [All ▾]           │   │
│     Map]     │     │  │ Rent Range: [5K ──●─── 50K]      │   │
│              │     │  │ Bedrooms: [1] [2] [3] [4+]       │   │
│  📍 📍       │     │  │ Amenities: [Select...]           │   │
│    📍   📍   │     │  │ Verified Only: [✓]               │   │
│  📍          │     │  │ Min Trust Score: ⭐⭐ [2+]        │   │
│              │     │  │ Available From: [This month ▾]   │   │
│              │     │  └──────────────────────────────────┘   │
│  ○━━○━━○━━○  │     │  12 properties found                   │
│  List Toggle │     │  ┌────────────┐ ┌────────────┐         │
└──────────────┘     └──┤ [Property] │ │ [Property] │         │
                        │ │ Card]     │ │ [Card]     │         │
                        │ └────────────┘ └────────────┘         │
                        │ ┌────────────┐ ┌────────────┐         │
                        │ │ [Property] │ │ [Property] │         │
                        │ │ Card]      │ │ [Card]     │         │
                        │ └────────────┘ └────────────┘         │
                        └──────────────────────────────────────────┘
                                 │
                                 ▼ (User clicks property)
                        ┌──────────────────────────────────────────┐
                        │           PROPERTY DETAIL PAGE            │
                        │  ┌────────────────────────────────────┐  │
                        │  │  [Photo Gallery - Carousel]        │  │
                        │  │  ● ○ ○ ○ ○                          │  │
                        │  └────────────────────────────────────┘  │
                        │                                          │
                        │  📍 Koramangala 5th Block, Bangalore     │
                        │  2BHK Apartment | ₹25,000/month          │
                        │                                          │
                        │  ┌─────────────┐ ┌─────────────────────┐  │
                        │  │ Landlord   │ │ Property Details   │  │
                        │  │ Profile    │ │ • 2 Bedrooms       │  │
                        │  │ ⭐⭐⭐⭐☆    │ │ • 2 Bathrooms      │  │
                        │  │ ✅ Verified │ │ • 1200 sq ft       │  │
                        │  │ 4.2/5 (12) │ │ • Semi-furnished   │  │
                        │  └─────────────┘ └─────────────────────┘  │
                        │                                          │
                        │  📅 Available Slots: Mon, Wed, Fri        │
                        │     [Morning ▾]  [Afternoon ▾]           │
                        │                                          │
                        │  ┌────────────────────────────────────┐  │
                        │  │  [📅 Book a Visit] (Primary CTA)   │  │
                        │  └────────────────────────────────────┘  │
                        │                                          │
                        │  Reviews (3)                            │
                        │  ┌────────────────────────────────────┐  │
                        │  │ ⭐⭐⭐⭐⭐ "Very responsive..."        │  │
                        │  │ ⭐⭐⭐⭐☆ "Good property..."          │  │
                        │  └────────────────────────────────────┘  │
                        └──────────────────────────────────────────┘
                                 │
                                 ▼ (User clicks "Book a Visit")
                        ┌──────────────────────────────────────────┐
                        │           VISIT BOOKING MODAL             │
                        │  ┌────────────────────────────────────┐  │
                        │  │  Step 1: Select Date & Time         │  │
                        │  │  ┌─────────────────────────────┐   │  │
                        │  │  │     April 2026              │   │  │
                        │  │  │  Mo Tu We Th Fr Sa Su       │   │  │
                        │  │  │     6  7  8  9 10 11 12     │   │  │
                        │  │  │    [●]                       │   │  │
                        │  │  └─────────────────────────────┘   │  │
                        │  │                                     │  │
                        │  │  Preferred Time: [Morning ▾]       │  │
                        │  │                                     │  │
                        │  │  Step 2: Your Details               │  │
                        │  │  Name: Rahul Sharma                  │  │
                        │  │  Phone: +91 98765 43210             │  │
                        │  │  Notes (optional): _______________  │  │
                        │  │                                     │  │
                        │  │  [Cancel]  [Send Visit Request]     │  │
                        │  └────────────────────────────────────┘  │
                        └──────────────────────────────────────────┘
                                 │
                                 ▼ (Landlord receives notification)
                        ┌──────────────────────────────────────────┐
                        │           SMS TO LANDLORD                 │
                        │  TrustRent: Rahul S. wants to visit      │
                        │  your property at Koramangala 2BHK.        │
                        │  Date: Apr 8, 2026 | Morning.             │
                        │  Reply ACCEPT/9 or DECLINE.              │
                        └──────────────────────────────────────────┘
```

---

## 4. Page Layouts

### 4.1 Landing Page (Unauthenticated)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [TrustRent Logo]           [List Property]  [Login]  [Sign Up]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │              FIND VERIFIED RENTALS IN INDIA                 │   │
│  │                                                              │   │
│  │     ┌─────────────────────────────────────────────────┐     │   │
│  │     │  🔍  Search by area, locality, or city...       │     │   │
│  │     └─────────────────────────────────────────────────┘     │   │
│  │                                                              │   │
│  │     [For Tenants]  [For Landlords]                          │   │
│  │                                                              │   │
│  │     ⭐ 10,000+ Verified Properties | 50,000+ Trust Matches    │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HOW IT WORKS                                                       │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │   STEP 1    │    │   STEP 2    │    │   STEP 3    │              │
│  │    🔐       │    │    🔍       │    │    📅       │              │
│  │   Verify    │    │   Discover  │    │   Visit     │              │
│  │  Yourself   │    │  Properties │    │  & Trust    │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │   STEP 4    │    │   STEP 5    │    │   STEP 6    │              │
│  │    🤝       │    │    ⭐       │    │   🏠       │              │
│  │   Connect   │    │   Review    │    │  Move In    │              │
│  │   & Agree   │    │  & Score   │    │  Happily   │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  WHY TRUSTRENT?                                                     │
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐                     │
│  │  ✅ DUAL VERIFIED  │  │  📊 TRUST SCORE    │                     │
│  │  Both tenants &    │  │  Real reviews from  │                     │
│  │  landlords verify  │  │  actual visits, not │                     │
│  │  identity           │  │  self-reported      │                     │
│  └────────────────────┘  └────────────────────┘                     │
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐                     │
│  │  🗺️ MAP-FIRST       │  │  🔒 FRAUD PROOF    │                     │
│  │  See properties     │  │  Aadhaar hash      │                     │
│  │  visually by area,  │  │  prevents deleted  │                     │
│  │  no more guesswork  │  │  accounts returning │                     │
│  └────────────────────┘  └────────────────────┘                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FEATURED PROPERTIES                                                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [Filter chips: Verified Only | Under 20K | Recently Added]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │  [Photo]   │ │  [Photo]   │ │  [Photo]   │ │  [Photo]   │     │
│  │            │ │            │ │            │ │            │     │
│  │  Koramangala│ │  Whitefield│ │  Indiranagar│ │  HSR       │     │
│  │  ₹22,000   │ │  ₹18,000   │ │  ₹35,000   │ │  ₹28,000   │     │
│  │  ⭐4.5     │ │  ⭐4.2     │ │  ⭐4.8     │ │  ⭐4.6     │     │
│  │  ✅ Verified│ │  ✅ Verified│ │  ✅ Verified│ │  ✅ Verified│     │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
│                                                                     │
│  [View All Properties →]                                            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TESTIMONIALS                                                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  "Finally found a landlord who responded! TrustRent's        │   │
│  │   verification gave me confidence to finalize quickly."     │   │
│  │   — Priya S., Tenant, Bangalore                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           🏠 LIST YOUR PROPERTY TODAY                         │   │
│  │                                                              │   │
│  │    Reach 50,000+ verified tenants looking for rentals.        │   │
│  │    No spam, no fake inquiries—just genuine interest.          │   │
│  │                                                              │   │
│  │    [List Property Free →]                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
│ ┌─────────────┬─────────────┬─────────────┬───────────────────┐   │
│ │ Quick Links │ Legal        │ Connect     │ Download App      │   │
│ │ • About     │ • Privacy    │ • Twitter   │ [Google Play]     │   │
│ │ • How Works │ • Terms      │ • Instagram │ [App Store]       │   │
│ │ • Trust     │ • Cookies    │ • LinkedIn  │                   │   │
│ │ • Help      │              │ • WhatsApp │                   │   │
│ └─────────────┴─────────────┴─────────────┴───────────────────┘   │
│ © 2026 TrustRent. Made with ❤️ in India.                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Property Search Page (Map + List View)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [TrustRent Logo]                    [Messages] [Bell] [Profile ●]   │
├────────────────────────┬────────────────────────────────────────────┤
│                        │                                            │
│   FILTER PANEL         │           MAP VIEW                         │
│   (Collapsible)        │                                            │
│   ┌──────────────────┐ │     ┌────────────────────────────────┐    │
│   │ Property Type    │ │     │                                │    │
│   │ [All ▾]          │ │     │    [Google Maps with pins]     │    │
│   └──────────────────┘ │     │                                │    │
│   ┌──────────────────┐ │     │         📍                     │    │
│   │ Rent Range       │ │     │    📍        📍                │    │
│   │ ₹5,000 ──── ₹1L  │ │     │              📍                │    │
│   │ [──────●─────]   │ │     │                                │    │
│   └──────────────────┘ │     │     📍              📍         │    │
│   ┌──────────────────┐ │     │              📍                │    │
│   │ Bedrooms         │ │     │                                │    │
│   │ [1] [2] [3] [4+] │ │     └────────────────────────────────┘    │
│   └──────────────────┘ │                                            │
│   ┌──────────────────┐ │     [Satellite] [Map] [List Toggle]        │
│   │ Amenities       │ │                                            │
│   │ ☐ Parking       │ ├────────────────────────────────────────────┤
│   │ ☐ AC            │ │                                            │
│   │ ☐ WiFi          │ │  PROPERTIES NEAR Koramangala               │
│   │ ☐ Furnished     │ │  (24 found)                                │
│   └──────────────────┘ │                                            │
│   ┌──────────────────┐ │  ┌────────────────────────────────────┐   │
│   │ Availability    │ │  │ [Card] Koramangala 5th Block       │   │
│   │ [Available Now ▾]│ │  │ [Photo]  ⭐4.5 (12 reviews)         │   │
│   └──────────────────┘ │  │  2 BHK | ₹25,000 | ✅ Verified      │   │
│   ┌──────────────────┐ │  │  Posted 2 days ago                  │   │
│   │ ☐ Verified Only │ │  └────────────────────────────────────┘   │
│   │ Min Trust: ⭐⭐⭐ │ │  ┌────────────────────────────────────┐   │
│   └──────────────────┘ │  │ [Card] Ejipura                     │   │
│                        │  │ [Photo]  ⭐4.2 (8 reviews)         │   │
│   [Clear All]          │  │  1 BHK | ₹15,000 | ✅ Verified     │   │
│                        │  └────────────────────────────────────┘   │
│                        │  ┌────────────────────────────────────┐   │
│                        │  │ [Card] Sony Junction              │   │
│                        │  │ [Photo]  ⭐4.8 (21 reviews)        │   │
│                        │  │  3 BHK | ₹40,000 | ✅ Verified    │   │
│                        │  └────────────────────────────────────┘   │
│                        │                                            │
│                        │  [Load More ↓]                            │
│                        │                                            │
└────────────────────────┴────────────────────────────────────────────┘
```

### 4.3 Property Detail Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [← Back] [TrustRent Logo]                    [Messages] [Profile ●] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PHOTO GALLERY                                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                                                          │  │  │
│  │  │              [Large Property Image]                     │  │  │
│  │  │                                                          │  │  │
│  │  │   [←]                                      [→]           │  │  │
│  │  │                                                          │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  [Thumb] [Thumb] [Thumb] [Thumb] [Thumb]  +3 more           │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Koramangala 5th Block, Bangalore                           │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │                                                              │  │
│  │  2 BHK Semi-Furnished Apartment                              │  │
│  │  ₹25,000/month • ₹50,000 deposit                            │  │
│  │                                                              │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────┐   │  │
│  │  │ LANDLORD PROFILE       │  │ PROPERTY DETAILS        │   │  │
│  │  │                        │  │                         │   │  │
│  │  │ 👤 Rajesh Kumar        │  │ 🛏️ 2 Bedrooms          │   │  │
│  │  │ ⭐⭐⭐⭐☆ 4.2/5         │  │ 🚿 2 Bathrooms          │   │  │
│  │  │ (12 reviews)           │  │ 📐 1,200 sq ft          │   │  │
│  │  │                        │  │ 🏢 Floor: 3rd of 5      │   │  │
│  │  │ ✅ Aadhaar Verified    │  │ 📅 Available: Apr 15    │   │  │
│  │  │ ✅ Phone Verified       │  │ 🕐 Facing: East        │   │  │
│  │  │                        │  │                         │   │  │
│  │  │ Member since: Jan 2025 │  └─────────────────────────┘   │  │
│  │  │ Response: < 1 hour     │                                  │  │
│  │  │                        │                                  │  │
│  │  │ [View Full Profile]    │                                  │  │
│  │  └────────────────────────┘                                  │  │
│  │                                                              │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  DESCRIPTION                                                  │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  Spacious 2 BHK apartment in the heart of Koramangala.      │  │
│  │  Well-ventilated rooms with ample natural light. Close to   │  │
│  │  metro station (5 min walk), markets, and restaurants...    │  │
│  │  [Read more]                                                  │  │
│  │                                                              │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  AMENITIES                                                    │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │
│  │  │🚗 Parking│ │❄️ AC    │ │📶 WiFi │ │🧹 Clean│           │  │
│  │  │   Yes   │ │  Living │ │ Provided│ │ Service │           │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │
│  │  │🔒 Security│ │🏠 Power │ │🚿 Water │ │🏋️ Gym │           │  │
│  │  │ 24/7    │ │ Backup  │ │ 24/7    │ │ Available│           │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │  │
│  │                                                              │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  VISIT SCHEDULE                                               │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  Available: Monday, Wednesday, Friday                         │  │
│  │  Time slots: Morning (9 AM-12 PM), Evening (4 PM-7 PM)        │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │         [📅 SELECT DATE & BOOK VISIT]                │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │ 💬 Message Landlord  |  🤍 Save Property  |  📤 Share│   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  REVIEWS (12)                                                 │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ ⭐⭐⭐⭐⭐  "Amazing property, exactly as shown in       │  │  │
│  │  │         photos. Rajesh was very helpful during the     │  │  │
│  │  │         visit."                                        │  │  │
│  │  │         — Amit M., visited Mar 2026                    │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ ⭐⭐⭐⭐☆  "Good location but slightly noisy during      │  │  │
│  │  │         peak hours. Landlord is responsive."           │  │  │
│  │  │         — Sneha K., visited Feb 2026                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  [Show all 12 reviews →]                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SIMILAR PROPERTIES                                           │  │
│  │  [Card] [Card] [Card] [Card]                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 Tenant Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [TrustRent Logo]              [Messages ●] [Bell] [Profile ●]      │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  SIDEBAR     │  WELCOME BACK, RAHUL                                │
│  ──────────  │  ─────────────────────────────────────────────────   │
│  📊 Dashboard│                                                      │
│  🔍 Search   │  YOUR TRUST SCORE                                    │
│  📅 My Visits│  ┌─────────────────────────────────────────────┐    │
│  💾 Saved    │  │  ⭐⭐⭐☆☆  3.0/5                              │    │
│  💬 Messages │  │  ───────────────────────────────────────    │    │
│  📝 Reviews  │  │  • Aadhaar Verified (+2)                    │    │
│  ──────────  │  │  • Phone Verified (+1)                      │    │
│  ⚙️ Settings │  │  • No completed visits yet                  │    │
│  📤 Logout   │  │                                              │    │
│              │  │  [Build your score →]                       │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  UPCOMING VISITS                                      │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ 📅 Tomorrow, 10:00 AM                       │    │
│              │  │ Koramangala 2BHK | Rajesh K.               │    │
│              │  │ Status: ✅ Confirmed                        │    │
│              │  │ [Get Directions] [View Details]            │    │
│              │  └─────────────────────────────────────────────┘    │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ 📅 Apr 10, 4:00 PM                          │    │
│              │  │ HSR Layout 1BHK | Priya M.                 │    │
│              │  │ Status: ⏳ Pending landlord approval        │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  RECENT MESSAGES                                     │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ 💬 Rajesh K.: "Sure, see you tomorrow..."   │    │
│              │  │ 💬 Priya M.: "Saturday works for me?"       │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  SAVED PROPERTIES (3)                                │
│              │  ┌───────┐ ┌───────┐ ┌───────┐                      │
│              │  │ [📷] │ │ [📷] │ │ [📷] │                      │
│              │  │ ₹22K │ │ ₹35K │ │ ₹18K │                      │
│              │  └───────┘ └───────┘ └───────┘                      │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 4.5 Landlord Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [TrustRent Logo]              [Messages ●] [Bell] [Profile ●]      │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  SIDEBAR     │  LANDLORD DASHBOARD                                    │
│  ──────────  │  ─────────────────────────────────────────────────   │
│  📊 Dashboard│                                                      │
│  🏠 Properties│  QUICK STATS                                          │
│  📅 Visit Req.│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  💬 Messages │  │  4       │ │  23      │ │  1,240   │            │
│  📝 Reviews  │  │  Active  │ │  Views   │ │  Inquiries│           │
│  ──────────  │  │  Listings│ │  This Week│ │  Total   │            │
│  ⚙️ Settings │  └──────────┘ └──────────┘ └──────────┘            │
│  📤 Logout   │                                                      │
│              │  YOUR TRUST SCORE                                     │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │  ⭐⭐⭐⭐☆  4.2/5                              │    │
│              │  │  ───────────────────────────────────────     │    │
│              │  │  • Aadhaar Verified (+2)                    │    │
│              │  │  • 12 tenant reviews                       │    │
│              │  │  • <1hr response time (+1)                 │    │
│              │  │  • 85% visit completion rate               │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  PENDING VISIT REQUESTS                               │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ 👤 Rahul Sharma                              │    │
│              │  │ ⭐3.0 Trust | ✅ Aadhaar Verified           │    │
│              │  │ Property: Koramangala 2BHK                 │    │
│              │  │ Date: Apr 8, 2026 | Morning                 │    │
│              │  │ Notes: "First time renter, serious about    │    │
│              │  │        the property."                      │    │
│              │  │                                              │    │
│              │  │   [Decline]           [Accept]             │    │
│              │  └─────────────────────────────────────────────┘    │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ 👤 Sneha Patel                              │    │
│              │  │ ⭐4.5 Trust | ✅ Aadhaar Verified           │    │
│              │  │ Property: HSR 1BHK                          │    │
│              │  │ Date: Apr 10, 2026 | Evening                 │    │
│              │  │   [Decline]           [Accept]             │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  RECENT ACTIVITY                                      │
│              │  • 5 new views on Koramangala listing (2h ago)     │
│              │  • Rahul S. sent a visit request (4h ago)          │
│              │  • New review: ⭐⭐⭐⭐⭐ from Amit M. (1d ago)     │
│              │                                                      │
│              │  [＋ Add New Property]                               │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 4.6 Visit Booking Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  BOOK A VISIT                                           [✕]   │  │
│  │  ─────────────────────────────────────────────────────────    │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  📍 Koramangala 5th Block, 2BHK Apartment              │   │  │
│  │  │  📷 [Thumbnail]  ₹25,000/month | ⭐4.2 landlord       │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │  STEP 1: SELECT DATE                                           │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │    April 2026                                            │  │  │
│  │  │  Su Mo Tu We Th Fr Sa                                   │  │  │
│  │  │            1  2  3  4                                    │  │  │
│  │  │    5  6 [7] 8  9 10 11                                  │  │  │
│  │  │   12 13 14 15 16 17 18                                  │  │  │
│  │  │   19 20 21 22 23 24 25                                  │  │  │
│  │  │   26 27 28 29 30                                         │  │  │
│  │  │                                                         │  │  │
│  │  │   Available days highlighted | Today: Apr 6              │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  STEP 2: SELECT TIME SLOT                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  ⏰ Morning (9:00 AM - 12:00 PM)        [Available]    │  │  │
│  │  │  ⏰ Evening (4:00 PM - 7:00 PM)          [Available]    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  STEP 3: YOUR DETAILS (Pre-filled)                             │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Name: Rahul Sharma                                    │  │  │
│  │  │  Phone: +91 98765 43210                                │  │  │
│  │  │  Email: rahul.s@example.com                             │  │  │
│  │  │  Notes to landlord (optional):                         │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐   │  │  │
│  │  │  │ I'm a working professional, relocating from... │   │  │  │
│  │  │  └─────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  📱 You'll receive SMS updates on +91 98765 43210       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  [Cancel]              [Send Visit Request]                   │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.7 Review Modal (Post-Visit)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  HOW WAS YOUR VISIT?                                   [✕]   │  │
│  │  ─────────────────────────────────────────────────────────    │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  📍 Koramangala 2BHK with Rajesh Kumar                 │   │  │
│  │  │  📅 Visited on April 7, 2026 at 10:00 AM              │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │  Rate your experience:                                        │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │    ☆    ☆    ☆    ☆    ☆                              │  │  │
│  │  │   1    2    3    4    5                                │  │  │
│  │  │                                                         │  │  │
│  │  │  Select a rating by clicking the stars                  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Your review (help others make informed decisions):           │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                                                         │  │  │
│  │  │                                                         │  │  │
│  │  │                                                         │  │  │
│  │  │                                                         │  │  │
│  │  │                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  0/500 characters                                            │  │
│  │                                                               │  │
│  │  Quick tags (select all that apply):                          │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │✅ Matches│ │📸 Photos │ │🏠 Clean │ │⏰ On Time│            │  │
│  │  │  Photos │ │ Accurate│ │ Property│ │         │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │📍 Good  │ │💰 Fair  │ │🗣️ Good  │ │❌ Mislead│            │  │
│  │  │ Location│ │ Pricing │ │Communication│  ing │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │  │
│  │                                                               │  │
│  │  Your review is public and affects landlord's trust score.   │  │
│  │                                                               │  │
│  │  [Skip for Now]              [Submit Review]                  │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Inventory

### 5.1 Navigation Components

| Component | States | Description |
|-----------|--------|-------------|
| **Header** | Default, Scrolled (shadow), Mobile menu open | Persistent top navigation with search, auth actions |
| **Sidebar** | Expanded, Collapsed, Mobile drawer | Dashboard navigation for authenticated users |
| **Breadcrumb** | Default | Page hierarchy indicator |
| **Tab Navigation** | Default, Active, Disabled | Within-page section navigation |
| **Pagination** | Default, First page, Last page, Loading | Results pagination |
| **Bottom Nav (Mobile)** | Default, Active item | Mobile app-like bottom navigation |

### 5.2 Form Components

| Component | States | Description |
|-----------|--------|-------------|
| **Text Input** | Default, Focus, Filled, Error, Disabled, Loading | Single-line text entry |
| **Textarea** | Default, Focus, Filled, Error, Disabled | Multi-line text entry |
| **Select Dropdown** | Default, Open, Selected, Error, Disabled | Single-option selection |
| **Multi-Select** | Default, Open, Selected (tags), Error | Multiple option selection |
| **Checkbox** | Unchecked, Checked, Indeterminate, Disabled | Boolean or multi-select option |
| **Radio Group** | Unselected, Selected, Disabled | Exclusive single selection |
| **Date Picker** | Default, Open, Date selected, Range mode | Calendar date selection |
| **Time Slot Picker** | Available, Selected, Unavailable | Time range selection |
| **OTP Input** | Empty, Partial, Complete, Error, Resend available | 6-digit OTP entry with auto-focus |
| **Search Input** | Default, Focus, Loading, With suggestions | Location/content search |
| **Range Slider** | Default, Dragging, With labels | Min/max value selection |
| **File Upload** | Empty, Dragging, Uploading, Complete, Error | Photo/document upload |

### 5.3 Display Components

| Component | States | Description |
|-----------|--------|-------------|
| **Property Card** | Default, Hover, Saved, Verified badge | Property listing preview |
| **Property Card (Map)** | Default, Hover, Selected | Compact card for map markers |
| **Landlord Card** | Default, Verified, With score | Landlord profile preview |
| **Trust Badge** | Unverified, Partial, Full | Verification status indicator |
| **Trust Score Display** | 1-5 stars with numeric value | Trust score visualization |
| **Photo Gallery** | Single, Multiple, Lightbox open | Property photo carousel |
| **Review Card** | Default, With photos, Helpful marked | User review display |
| **Stats Card** | Default, Loading, With trend | Dashboard metric display |
| **Activity Item** | Default, Unread, Clicked | Activity feed item |
| **Message Bubble** | Sent, Delivered, Read | Chat message display |
| **Empty State** | No results, No data, Error | Placeholder for empty lists |
| **Loading State** | Skeleton, Spinner, Progress bar | Loading indicators |

### 5.4 Action Components

| Component | States | Description |
|-----------|--------|-------------|
| **Primary Button** | Default, Hover, Active, Loading, Disabled | Main CTA action |
| **Secondary Button** | Default, Hover, Active, Disabled | Secondary action |
| **Icon Button** | Default, Hover, Active, Disabled | Icon-only action |
| **Visit Request Card** | Pending, Accepted, Declined, Completed | Visit request display |
| **Action Toast** | Success, Error, Warning, Info | Temporary notification |
| **Modal** | Default, Full-screen (mobile), Loading | Overlay dialog |
| **Confirmation Dialog** | Default, Loading | Destructive action confirmation |
| **Dropdown Menu** | Closed, Open, With icons | Action menu |
| **Filter Chip** | Unselected, Selected, Removable | Filter toggle |

### 5.5 Verification Components

| Component | States | Description |
|-----------|--------|-------------|
| **Verification Banner** | Pending, Verified, Failed | Aadhaar verification status |
| **OTP Timer** | Counting, Expired, Resend available | OTP countdown |
| **Progress Stepper** | Step 1-N, Current, Completed | Multi-step flow indicator |
| **Verification Success** | Default, With confetti | Successful verification display |
| **Shadow Table Warning** | Default | Fraud prevention notice |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Description | Layout Adaptation |
|------------|-------|-------------|-------------------|
| **Mobile S** | < 375px | Small mobile | Single column, bottom nav |
| **Mobile M** | 375-424px | Standard mobile | Single column, bottom nav |
| **Mobile L** | 425-767px | Large mobile | Single column with side padding |
| **Tablet** | 768-1023px | Tablets, small laptops | Two-column layout, collapsible sidebar |
| **Desktop** | 1024-1279px | Standard desktop | Full sidebar, three-column search |
| **Desktop L** | 1280-1535px | Large desktop | Expanded content area |
| **Desktop XL** | > 1536px | Extra large displays | Max-width container, centered content |

### 6.1 Key Responsive Patterns

**Search Page**

- Mobile: Full-width map with bottom sheet property list
- Tablet: Side panel with map, scrollable list
- Desktop: Three-column with filters, map, and list

**Property Detail**

- Mobile: Stacked sections, sticky booking CTA
- Desktop: Side-by-side content and booking panel

**Dashboard**

- Mobile: Bottom tab navigation, swipeable cards
- Desktop: Fixed sidebar with main content area

---

## 7. Technical Page Structure

### 7.1 Route Map

| Route | Page | Auth Required | Role |
|-------|------|---------------|------|
| `/` | Landing Page | No | All |
| `/auth/login` | Phone Login | No | All |
| `/auth/verify` | OTP Verification | Yes (partial) | All |
| `/auth/register` | Registration | No | All |
| `/auth/aadhaar` | Aadhaar Verification | Yes | All |
| `/search` | Property Search | Recommended | Tenant |
| `/property/:id` | Property Detail | No | All |
| `/property/:id/book` | Book Visit | Yes | Tenant |
| `/dashboard` | User Dashboard | Yes | All |
| `/dashboard/visits` | My Visits | Yes | Tenant |
| `/dashboard/saved` | Saved Properties | Yes | Tenant |
| `/dashboard/reviews` | My Reviews | Yes | All |
| `/dashboard/profile` | My Profile | Yes | All |
| `/landlord/dashboard` | Landlord Dashboard | Yes | Landlord |
| `/landlord/properties` | My Properties | Yes | Landlord |
| `/landlord/properties/add` | Add Property | Yes | Landlord |
| `/landlord/properties/:id/edit` | Edit Property | Yes | Landlord |
| `/landlord/requests` | Visit Requests | Yes | Landlord |
| `/about` | About Us | No | All |
| `/how-it-works` | How It Works | No | All |
| `/trust-safety` | Trust & Safety | No | All |
| `/help` | Help Center | No | All |
| `/contact` | Contact Us | No | All |
| `/privacy` | Privacy Policy | No | All |
| `/terms` | Terms of Service | No | All |

### 7.2 Page Metadata Template

```json
{
  "title": "Property Name | TrustRent",
  "description": "Verified 2BHK apartment in Koramangala. ₹25,000/month. Landlord Rajesh K. has a 4.2★ trust score. Book a visit today!",
  "og_image": "https://cdn.trustrent.in/properties/123/gallery/cover.jpg",
  "canonical": "https://trustrut.in/property/abc123"
}
```

---

## 8. State Management

### 8.1 Global State

| State Key | Type | Description | Storage |
|-----------|------|-------------|---------|
| `user` | Object / null | Current user profile | Supabase Auth |
| `userRole` | 'tenant' / 'landlord' | User role | Local state |
| `verificationStatus` | Object | Aadhaar, phone verification | Supabase |
| `trustScore` | Number | Calculated trust score | Supabase (derived) |
| `theme` | 'light' / 'dark' / 'system' | UI theme preference | LocalStorage |
| `language` | 'en' / 'hi' | Interface language | LocalStorage |

### 8.2 Feature State

| State Key | Type | Description |
|-----------|------|-------------|
| `searchFilters` | Object | Current search/filter state |
| `selectedProperty` | Object | Currently viewed property |
| `mapBounds` | Object | Current map viewport |
| `bookingDraft` | Object | In-progress visit booking |
| `notifications` | Array | User notifications |
| `messages` | Object | Conversation threads |
| `uploadQueue` | Array | Pending file uploads |

---

## 9. Interaction Patterns

### 9.1 Micro-interactions

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Button press | Touch/click down | Scale to 0.97, slight darken | 100ms |
| Card hover | Mouse enter | Subtle shadow lift, translate Y -2px | 200ms |
| Verification badge | Success | Checkmark draw animation, pulse | 400ms |
| Trust score | Value change | Number count up, star fill animation | 500ms |
| Toast notification | Trigger | Slide in from top, auto-dismiss | 3000ms |
| Modal open | Trigger | Fade in backdrop, scale up content | 250ms |
| Page transition | Route change | Fade out current, fade in new | 200ms |
| Form field focus | Click/tap | Border color transition, label float | 200ms |

### 9.2 Loading States

| Context | Loading Type | Behavior |
|---------|--------------|----------|
| Initial page load | Full-page skeleton | Animated placeholder shapes |
| Data fetch | Inline spinner | Centered in container |
| Image upload | Progress bar | Percentage indicator |
| Search results | Infinite scroll skeleton | Card placeholders |
| Map markers | Fade in | Staggered appearance |

### 9.3 Error Handling

| Error Type | Display | Action |
|------------|---------|--------|
| Form validation | Inline error below field | Red border, error text |
| API error (non-blocking) | Toast notification | Dismiss after 5s |
| API error (blocking) | Inline error state | Retry button |
| Network error | Full-page offline state | Retry when online |
| 404 | Custom 404 page | Navigate home link |
| Auth expired | Redirect to login | Preserve intended destination |

---

## 10. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | Full tab navigation, Enter to activate, Escape to close modals |
| **Screen Reader** | ARIA labels, proper heading hierarchy (h1 → h6), alt text for images |
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text and UI components |
| **Focus Indicators** | Visible 2px outline on all interactive elements |
| **Touch Targets** | Minimum 44x44px for all interactive elements |
| **Motion Sensitivity** | Respect `prefers-reduced-motion` for animations |
| **Language** | Proper `lang` attribute, RTL support ready for Hindi |
| **Form Labels** | All inputs have associated labels or ARIA labels |

---

## 11. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Page Size (initial) | < 500KB | WebPageTest |
| Image Optimization | WebP with fallbacks | Automated |
| Bundle Splitting | Route-based | Webpack/Vite |
| Service Worker | Offline capability for repeat visits | Lighthouse |
| Map Loading | Progressive (tiles first, markers after) | Manual |

---

## 12. Security Considerations

| Area | Implementation |
|------|----------------|
| **Aadhaar Data** | Only hash stored, never raw number; compliant with UIDAI guidelines |
| **Authentication** | Firebase Phone Auth with JWT tokens |
| **API Security** | Supabase Row Level Security (RLS) policies |
| **File Uploads** | Signed URLs with expiration, content-type validation |
| **XSS Prevention** | React's built-in escaping, CSP headers |
| **CSRF Protection** | SameSite cookies, token validation |
| **Rate Limiting** | API-level throttling for auth and search |
| **Shadow Table** | Aadhaar hash prevents re-registration after account deletion |

---

## 13. Future Considerations

### Phase 2 Features (Post-Launch)

- WhatsApp integration for notifications
- WhatsApp Business API for automated messages
- Language support (Hindi, regional languages)
- Push notifications (PWA)
- Tenant insurance partnership
- Rental agreement templates (non-legal advice)

### Phase 3 Features (Growth)

- Mobile app (React Native)
- Video property tours
- Virtual property walkthroughs
- AI-powered property matching
- Landlord verification tiers (verified, verified plus, trusted)

---

## 14. File Structure

```
trustrut/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   └── og-image.jpg
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── illustrations/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Toast/
│   │   │   └── Loading/
│   │   │
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── MobileNav/
│   │   │
│   │   ├── property/
│   │   │   ├── PropertyCard/
│   │   │   ├── PropertyGallery/
│   │   │   ├── PropertyFilters/
│   │   │   ├── PropertyMap/
│   │   │   └── PropertyForm/
│   │   │
│   │   ├── trust/
│   │   │   ├── TrustBadge/
│   │   │   ├── TrustScore/
│   │   │   ├── VerificationBanner/
│   │   │   └── ReviewCard/
│   │   │
│   │   ├── auth/
│   │   │   ├── PhoneLogin/
│   │   │   ├── OTPInput/
│   │   │   ├── AadhaarForm/
│   │   │   └── ProfileSetup/
│   │   │
│   │   ├── visit/
│   │   │   ├── VisitBooking/
│   │   │   ├── VisitCalendar/
│   │   │   ├── TimeSlotPicker/
│   │   │   └── VisitRequestCard/
│   │   │
│   │   └── review/
│   │       ├── ReviewModal/
│   │       ├── ReviewForm/
│   │       └── RatingStars/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Search/
│   │   ├── PropertyDetail/
│   │   ├── auth/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── Verify/
│   │   ├── dashboard/
│   │   │   ├── TenantDashboard/
│   │   │   ├── Visits/
│   │   │   ├── Saved/
│   │   │   └── Profile/
│   │   ├── landlord/
│   │   │   ├── LandlordDashboard/
│   │   │   ├── Properties/
│   │   │   ├── PropertyForm/
│   │   │   └── Requests/
│   │   └── static/
│   │       ├── About/
│   │       ├── HowItWorks/
│   │       ├── Help/
│   │       └── Legal/
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProperties.js
│   │   ├── useVisits.js
│   │   ├── useReviews.js
│   │   └── useNotifications.js
│   │
│   ├── services/
│   │   ├── supabase.js
│   │   ├── firebase.js
│   │   ├── maps.js
│   │   └── sms.js
│   │
│   ├── store/
│   │   ├── authStore.js
│   │   ├── searchStore.js
│   │   └── uiStore.js
│   │
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   ├── aadhaar.js
│   │   └── constants.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   ├── i18n/
│   │   ├── en.json
│   │   └── hi.json (planned)
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
│
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

---

*Document Version: 1.0*
*Last Updated: April 2026*
*Author: TrustRent Design Team*
