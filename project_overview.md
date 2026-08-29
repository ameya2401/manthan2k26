# MANTHAN 2026 PLATFORM — SENIOR TECHNICAL ARCHITECTURE & INTERVIEW MASTER MANUAL

---

## PART 1 — PROJECT AT A GLANCE

### 1. Project Name
**Manthan 2026 Platform** (`manthan-app`, v1.0.0)

### 2. One-Line Description
A production-grade, full-stack college festival management and ticketing platform built with Next.js 14 App Router and Supabase, featuring multi-event dynamic solo/team registrations, a WhatsApp-first & cash payment coordination engine with legacy Razorpay fallback, automated high-resolution PDF pass generation with QR verification, Brevo transactional email delivery, and an RBAC-secured operational dashboard with lateral PostgreSQL export views.

### 3. Problem Being Solved
Managing a multi-tier intercollegiate festival (such as BVIMIT's Manthan) entails complex operational bottlenecks:
* **Diverse Participation Rules:** Handling solo technical hackathons (1 person), duo quizzes (1–2 persons), fixed sports teams (e.g., Box Cricket requiring exactly 7 members), and flexible cultural group performances (1–6 or 3–8 members) with dynamic fee calculation rules (per-team vs. per-participant).
* **Payment Friction & Gateway Costs:** High payment gateway failure rates, transaction surcharges, and the reality of on-ground cash/UPI collections in college environments.
* **On-Ground Security & Fraud:** Eliminating duplicate entries, fake payment receipts, and bottleneck queues at event gates through cryptographically signed QR code passes and sub-second scanner check-ins.
* **Organizer Data Fragmentation:** Consolidating relational participant records, nested team rosters, cash audit ledgers, and financial reconciliation into unified spreadsheet exports without manual data wrangling.

### 4. Target Users
1. **Student Participants:** Browse technical, cultural, and sports events; register individually or configure custom team rosters; receive branded PDF tickets via email and instant download.
2. **Event Coordinators / Staff Volunteers:** Verify participant QR codes at physical venues; manage event-specific rosters; log physical cash payments with receipt numbers.
3. **Core Administrators / Organizers:** Monitor real-time festival metrics (revenue, registrations, check-in percentages); manage cash reconciliation; export granular per-event participant spreadsheets.
4. **Auditors / Viewers:** Read-only access to registration data, financial stats, and audit logs without mutation privileges.

### 5. Main Features
* **Interactive Ancient-Themed UI:** Thematic design ("Roots meet Realms" / *Samudra Manthan*) featuring dynamic HTML5 background video transitions, custom parchment components, animated scrolls, and Swiper.js coverflow carousels.
* **Static Fast Event Catalog:** In-memory TypeScript-backed catalog for sub-millisecond response times, zero database round-trips for public catalog reads, and strict type safety.
* **Dynamic Solo & Multi-Team Registration Engine:** Multi-step wizard supporting simultaneous registration across multiple events with client- and server-side bounded team validation.
* **WhatsApp-First & Hybrid Payment Coordination:** Instant pre-filled WhatsApp handoff to coordinators with ticket ID and registration parameters; asynchronous pending registration persistence; legacy Razorpay signature verification and HMAC webhook compatibility.
* **Physical Cash Ledger & Audit System:** Dedicated cash management workflow supporting cash payment tagging against online registrations and ad-hoc physical cash entries with unique receipt numbers and collector stamps.
* **Automated Branded PDF Ticket & QR Pass Generator:** Vector-styled A4/Pass PDF compilation via `jspdf` and `qrcode` with embedded college logos, security seals, and participant credentials.
* **Transactional Email Delivery via Brevo API:** Asynchronous SMTP/REST API dispatch of HTML tickets with CID-embedded logos and Base64 PDF attachments.
* **Role-Based Admin Dashboard (RBAC):** Supabase Auth-backed portal supporting `admin`, `staff`, and `viewer` roles with self-healing user mapping, live attendee check-in/undo, search filters, and cash ledger operations.
* **High-Performance PostgreSQL Lateral Export View:** Database-level `CROSS JOIN LATERAL unnest()` and `jsonb_array_elements()` view for flattened, one-row-per-participation CSV spreadsheet generation.
* **Contextual Rule-Based Chatbot ("The Scribe"):** Interactive natural-language assistant answering queries regarding event rules, schedules, locations, and fees.

### 6. Technology Stack

| Layer | Technology | Where Used | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime & Language** | Node.js (>=18.18.0) / TypeScript 5.5 | Entire project (`tsconfig.json`, `package.json`) | Type safety, modern ES features, strict type checking across client & server |
| **Frontend Framework** | Next.js 14.2.0 (App Router) | `src/app/**` | Server & Client Components, file-system routing, API route handlers |
| **UI Library** | React 18.3.0 / React-DOM | `src/**` | Component lifecycle, hooks, state management |
| **Styling & Design System** | Tailwind CSS 3.4.0, PostCSS, Autoprefixer | `tailwind.config.js`, `src/app/globals.css` | Custom ancient gold/maroon palette, responsive utilities, parchment styling |
| **Typography** | Google Fonts (`next/font/google`) | `src/app/layout.tsx` | Next.js zero-layout-shift font optimization: *Cinzel*, *Cormorant Unicase*, *Marcellus* |
| **Animations & Transitions** | Framer Motion 11.5.0 | `src/components/**`, `src/app/page.tsx`, `src/app/register/page.tsx` | Gesture controls, page transitions, modal spring physics, accordion animations |
| **Carousel / Sliders** | Swiper.js 12.1.2 | `src/app/page.tsx` | 3D coverflow interactive event cards on landing page |
| **Icons** | Lucide React 0.441.0 | Throughout all frontend components & admin dashboard | Consistent, lightweight SVG icon system |
| **Database & Auth** | Supabase (PostgreSQL 15+, Supabase Auth, RLS) | `src/lib/supabase/**`, `src/app/api/**` | Relational storage, JSONB team documents, RLS security policies, JWT authentication |
| **Input Validation** | Zod 3.23.0 | `src/lib/validations.ts`, `src/app/api/payment/**` | Runtime request body schema validation and type inference |
| **Pass & PDF Generation** | jsPDF 4.2.0 | `src/lib/mail-service.ts`, `src/app/confirmation/**` | Programmatic vector PDF ticket generation |
| **QR Code Generation** | qrcode 1.5.4 | `src/app/api/payment/**`, `src/lib/mail-service.ts` | 2D QR matrix data URL generation for ticket validation |
| **Email Service** | Brevo (formerly Sendinblue) REST API v3 | `src/lib/mail-service.ts` | Transactional email dispatch with attachments and inline CID images |
| **Payment Gateway (Legacy)** | Razorpay Node SDK 2.9.0 / Webhooks | `src/app/api/payment/**`, `scripts/reconcile_all.js` | Order creation, HMAC-SHA256 signature verification, webhook processing |
| **Cryptography** | Node.js native `crypto` | `src/app/api/payment/verify/route.ts`, `src/app/api/payment/webhook/route.ts` | HMAC-SHA256 signature verification for payment security |
| **Deployment & Hosting** | Vercel Serverless | `vercel.json` | Serverless deployment, edge middleware execution, static asset delivery |

---

## PART 2 — COMPLETE PROJECT STRUCTURE

```text
manthan2k26/
├── .env.example                     # Reference template for environment configuration
├── .eslintrc.json                   # ESLint configuration extending next/core-web-vitals
├── add_viewer_role.sql              # SQL migration script to add 'viewer' role constraint
├── next.config.js                   # Next.js configuration (strict mode, image domains)
├── package.json                     # NPM dependencies, metadata, and operational run scripts
├── postcss.config.js                # PostCSS plugins for Tailwind CSS
├── PO.md                            # High-level product overview & resume summary
├── README.md                        # Documentation on setup, scripts, and API surface
├── tailwind.config.js               # Theme configuration (custom gold/maroon/parchment colors)
├── tsconfig.json                    # TypeScript compiler options and path aliases (@/*)
├── update_schema.sql                # SQL migration for lateral views, GIN indexes, cash columns
├── vercel.json                      # Vercel deployment configuration
├── public/                          # Static assets (logos, favicons, staff profile images)
├── scripts/                         # Operational CLI scripts for database and maintenance
│   ├── cleanup_db.js                # Data purge script for testing/resetting registrations
│   ├── debug_columns.js             # Utility to inspect live Supabase table schemas
│   ├── force_setup_viewer.js        # Hard reset script for viewer credentials
│   ├── reconcile_all.js             # Reconciles pending DB orders against Razorpay API
│   ├── setup_generalized_admins.js  # Seeds admin accounts in Supabase Auth & admin_users
│   ├── setup_viewer_account.js      # Seeds read-only viewer account
│   ├── simulate_webhook.js          # Dispatches simulated HMAC-signed Razorpay webhooks
│   └── verify_cleanup.js            # Verification script checking row counts after cleanup
└── src/
    ├── middleware.ts                # Global edge security headers and route guards
    ├── components/                  # Reusable UI component layer
    │   ├── AnimatedButton.tsx       # Button component with hover shimmer animations
    │   ├── BackButton.tsx           # Router back-navigation component
    │   ├── Chatbot.tsx              # "The Scribe" parchment-themed keyword AI assistant
    │   ├── ClientLayout.tsx         # Global intro orchestrator, background video loader, context
    │   ├── EventCard.tsx            # Event listing display card with category styling
    │   ├── FlashlightPreloader.tsx  # Preloader animation component
    │   ├── Footer.tsx               # Global site footer with links and social coordinates
    │   ├── LoadingSpinner.tsx       # CSS-based loading animation
    │   ├── LogoLoading.tsx          # SVG/Logo pulsing preloader animation
    │   ├── Navbar.tsx               # Responsive navigation bar with scroll-aware hiding
    │   ├── PaymentOverlay.tsx       # Real-time multi-step payment status overlay modal
    │   ├── RegistrationClosedButton.tsx # Modal trigger displaying registration closure chronicle
    │   ├── ScrollFilters.tsx        # SVG filters for custom scroll paper effects
    │   ├── ScrollWrapper.tsx        # Ancient parchment scroll UI container wrapper
    │   └── VideoIntro.tsx           # Fullscreen landing page video introduction player
    ├── lib/                         # Business logic, utilities, types, and database clients
    │   ├── constants.ts             # Static colors, icons, schedule data, ticket ID generators
    │   ├── events-catalog.ts        # Static in-memory database of all 16 festival events & rules
    │   ├── mail-service.ts          # jsPDF ticket rendering and Brevo API email dispatch
    │   ├── rate-limit.ts            # Database-backed rate limiter (IP + endpoint window)
    │   ├── types.ts                 # TypeScript type definitions (Event, Registration, Team, etc.)
    │   ├── useIsMobile.ts           # Custom React hook for viewport breakpoint detection
    │   ├── validations.ts           # Zod validation schemas for registration & verification
    │   └── supabase/
    │       ├── client.ts            # Browser-side Supabase client (anon key, RLS enabled)
    │       ├── schema.sql           # Complete SQL schema, RLS policies, tables, and views
    │       └── server.ts            # Server-side Supabase client (service role key, bypasses RLS)
    └── app/                         # Next.js App Router (Pages & API routes)
        ├── layout.tsx               # Root layout setting HTML metadata and Google Fonts
        ├── globals.css              # Global styles, Tailwind base, scrollbar, parchment themes
        ├── not-found.tsx            # Custom 404 page with ancient thematic styling
        ├── page.tsx                 # Landing page (Hero, Swiper Arena, Schedule, Chronicles)
        ├── about/page.tsx           # About BVIMIT & Manthan history
        ├── contact/page.tsx         # Contact info, map, and coordinator desk details
        ├── schedule/page.tsx        # Detailed Day 1 & Day 2 timeline breakdown
        ├── sponsorship/page.tsx     # Sponsorship brochure & partner packages
        ├── workforce/page.tsx       # Core development & student committee credits
        ├── privacy-policy/page.tsx  # Legal privacy terms
        ├── refund-policy/page.tsx   # Payment and ticket refund policies
        ├── terms-and-conditions/page.tsx # Participant terms & festival rules
        ├── events/
        │   ├── page.tsx             # Event catalog filter page
        │   ├── EventsFilter.tsx     # Client-side category filtering and search grid
        │   └── [slug]/page.tsx      # Dynamic event detail page with rules & coordinator info
        ├── register/page.tsx        # Multi-step dynamic registration form & team builder
        ├── payment-pending/[ticketId]/page.tsx # WhatsApp handoff & pending payment countdown
        ├── confirmation/[ticketId]/page.tsx   # Verified digital ticket view & browser print
        ├── admin/
        │   ├── page.tsx             # Admin authentication login portal
        │   └── dashboard/page.tsx   # Full operational admin dashboard (Tabs: Regs, Pending, Cash)
        └── api/                     # Backend API Route Handlers
            ├── events/route.ts      # Public GET route returning active event catalog
            ├── registration/[ticketId]/route.ts # Public GET route resolving ticket data by ID
            ├── payment/
            │   ├── create-order/route.ts    # POST: Validates form, creates PENDING record, builds WhatsApp URL, sends initial email
            │   ├── verify/route.ts          # POST: Verifies Razorpay HMAC signature & marks PAID
            │   ├── webhook/route.ts         # POST: Razorpay server-to-server webhook handler
            │   └── whatsapp-config/route.ts # GET: Returns sanitized coordinator phone number
            └── admin/
                ├── login/route.ts           # POST: Supabase Auth login with self-healing role check
                ├── stats/route.ts           # GET: Real-time dashboard KPI metrics & event capacity
                ├── registrations/route.ts   # GET: Paginated & filtered registration records
                ├── export/route.ts          # GET: Dynamic unraveled CSV spreadsheet exporter
                ├── check-in/[id]/route.ts   # POST/PATCH: Gate QR check-in & check-in undo
                └── cash-payment/
                    ├── route.ts             # GET/POST: Cash payment list & mark pending as cash paid
                    ├── manual/route.ts      # GET/POST: Ad-hoc physical cash entries ledger
                    └── export/route.ts      # GET: Combined cash transactions CSV export
```

---

## PART 3 — APPLICATION ARCHITECTURE

```text
+---------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                     |
|  +---------------------------------------------------------------------------------+  |
|  | Next.js App Router (React 18 Client/Server Components)                         |  |
|  | - Landing Page (Swiper.js / VideoIntro / Context)                              |  |
|  | - Event Catalog & Filters (EventsFilter.tsx)                                   |  |
|  | - Dynamic Multi-Step Registration Form (register/page.tsx)                     |  |
|  | - Ticket Pass & Confirmation View (confirmation/[ticketId]/page.tsx)           |  |
|  | - Admin Operational Dashboard (admin/dashboard/page.tsx)                       |  |
|  | - Rule-Based AI Chatbot (Chatbot.tsx)                                           |  |
|  +---------------------------------------------------------------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            | HTTPS Requests (JSON / Auth Bearer JWT)
                                            v
+---------------------------------------------------------------------------------------+
|                                NEXT.JS BACKEND RUNTIME                                |
|  +---------------------------------------------------------------------------------+  |
|  | Edge Middleware (src/middleware.ts)                                             |  |
|  |   - Injects Strict Security Headers (CSP, HSTS, X-Frame-Options, Permissions)   |  |
|  +---------------------------------------------------------------------------------+  |
|  | API Route Handlers (src/app/api/**)                                             |  |
|  |   - Input Validation Layer (Zod: registrationSchema, paymentVerificationSchema)  |  |
|  |   - Database Rate Limiting Layer (rate-limit.ts -> rate_limits table)           |  |
|  |   - Business Logic & Fee Calculators (constants.ts, events-catalog.ts)          |  |
|  |   - Admin JWT Verification & RBAC Guards (verifyAdmin helper)                   |  |
|  +---------------------------------------------------------------------------------+  |
+-------------------+-----------------------+-----------------------+-------------------+
                    |                       |                       |
        Service Role Key (Bypass RLS)       | SMTP REST API         | Intent URL / SDK
                    v                       v                       v
+-------------------+---+   +---------------+---+   +---------------+---+   +-----------+
|    SUPABASE POSTGRES  |   |     BREVO API     |   |   WHATSAPP    |   | RAZORPAY  |
| - events              |   | - Transactional   |   |   COORDINATOR |   | (LEGACY)  |
| - registrations       |   |   HTML Email      |   | - Direct      |   | - Orders  |
| - admin_users         |   | - Branded PDF     |   |   Pre-filled  |   | - Verify  |
| - rate_limits         |   |   Pass Attachment |   |   Chat Link   |   | - Webhook |
| - manual_cash_entries |   | - CID Logo Assets |   |               |   |   HMAC    |
| - export views (SQL)  |   +-------------------+   +---------------+---+   +-----------+
+-----------------------+
```

### Architectural Highlights:
1. **Frontend Architecture:** Utilizes Next.js 14 App Router with hybrid rendering. Public pages (`/`, `/events`, `/schedule`, `/about`) leverage SSR and static generation for fast SEO and TTFB, while dynamic interactive screens (`/register`, `/admin/dashboard`, `/confirmation/[ticketId]`) use client components with Framer Motion, optimized React hooks, and context providers (`IntroContext`).
2. **Backend / API Layer:** Completely serverless Next.js Route Handlers (`route.ts`). All business logic—especially total registration fee calculation and team boundary validation—is executed exclusively on the server to prevent client-side fee tampering.
3. **Database Architecture:** Built on Supabase PostgreSQL. High-flexibility team data is decoupled into structured `JSONB` documents within the `registrations` table, indexed with GIN (`Generalized Inverted Index`), and unraveled at query time via lateral joins. Row Level Security (RLS) protects data at the SQL engine level.
4. **Security & RBAC:** Supabase Auth manages encrypted credentials. The `admin_users` table maps UUIDs to roles (`admin`, `staff`, `viewer`). API endpoints extract and verify the JWT via `supabaseAdmin.auth.getUser(token)` and validate permissions before mutating state.
5. **Decoupled Asynchronous Communications:** Email dispatch via Brevo and PDF generation via `jsPDF` are triggered asynchronously during registration/payment events, allowing API routes to respond in sub-seconds without holding client connections open.

---

## PART 4 — END-TO-END DATA FLOW

```text
====================================================================================================
FLOW 1: PARTICIPANT REGISTRATION & WHATSAPP PAYMENT COORDINATION (PRIMARY USER FLOW)
====================================================================================================

[Student Browser]
       |
       | 1. User fills basic info (Name, Email, Phone, College, Year, Dept)
       | 2. Selects events (e.g., VantraSutra Solo + Box Cricket Team of 7)
       | 3. Enters 7 teammate names
       | 4. Clicks "Proceed to Registration"
       v
[Client Script: register/page.tsx -> handlePayment()]
       |
       | 5. Opens synchronous popup window (prevents browser popup blocker)
       | 6. Sends HTTP POST /api/payment/create-order with JSON payload
       v
[Backend Handler: src/app/api/payment/create-order/route.ts]
       |
       | 7. Rate Limiter check (checkRateLimit(ip, 'create-order'))
       | 8. Zod Validation (registrationSchema.safeParse(body))
       | 9. Server-Side Fee Recalculation:
       |      - Fetches events from static EVENT_CATALOG
       |      - Validates team size boundaries (Box Cricket: min 7, max 7)
       |      - Computes fee in Paise (e.g., 5000 + 95000 = 100,000 paise = ₹1,000)
       | 10. Generates unique Ticket ID: generateTicketId('tech') -> "MNT-TECH-M1X8K2A"
       | 11. Generates 2D QR Code Data URL with participant metadata
       | 12. Persists record in Supabase 'registrations' with payment_status = 'PENDING'
       | 13. Builds WhatsApp deep link URL with coordinator phone & prefilled summary text
       | 14. Asynchronously invokes sendTicketEmail() with 'PENDING' status pass attached
       | 15. Returns JSON { ticket_id, payment_status: 'PENDING', whatsapp_url, ... }
       v
[Student Browser]
       | 16. Popup window navigates to WhatsApp Web / App
       | 17. Main window redirects to /payment-pending/MNT-TECH-M1X8K2A
       | 18. Auto-redirect countdown (5s) transitions user to /confirmation/MNT-TECH-M1X8K2A
```

```text
====================================================================================================
FLOW 2: ON-GROUND CASH COLLECTION & PAYMENT CONFIRMATION (ADMIN/STAFF FLOW)
====================================================================================================

[Student] ---> Approves cash payment of ₹1,000 at registration desk
       |
[Staff / Admin on /admin/dashboard -> 'Pending Payments' Tab]
       |
       | 1. Searches student by Ticket ID "MNT-TECH-M1X8K2A" or Name
       | 2. Enters Cash Amount (100000 paise / ₹1000), Receipt # ("RCP-2026-081"), Notes
       | 3. Clicks "Mark as Paid (Cash)"
       v
[Backend Handler: POST /api/admin/cash-payment]
       |
       | 4. Verifies Admin Bearer JWT token in Authorization header
       | 5. Validates role is 'admin' or 'staff' (rejects 'viewer' with 403 Forbidden)
       | 6. Updates registrations table:
       |      - payment_status = 'PAID'
       |      - payment_method = 'cash'
       |      - cash_amount = 100000
       |      - cash_received_by = "Ameya Bhagat (Admin)"
       |      - cash_receipt_number = "RCP-2026-081"
       |      - cash_received_at = NOW()
       | 7. Returns { success: true }
       v
[Student Browser /confirmation/MNT-TECH-M1X8K2A]
       | 8. Status dynamically updates to "VERIFIED • PAID ENTRY"
       | 9. Download pass button enables instant printable receipt
```

```text
====================================================================================================
FLOW 3: ON-GROUND GATE CHECK-IN VIA QR SCANNER (EVENT DAY FLOW)
====================================================================================================

[Gate Volunteer] scans participant's QR code on phone or physical printout
       |
[Admin Dashboard: /admin/dashboard -> 'Registrations' Tab]
       |
       | 1. Searches Ticket ID from QR content
       | 2. Verifies status is 'PAID'
       | 3. Clicks "Check In" button
       v
[Backend Handler: POST /api/admin/check-in/[id]]
       |
       | 4. Verifies Admin Bearer token and permissions
       | 5. Validates registration.payment_status === 'PAID' (rejects PENDING with 400)
       | 6. Checks if already checked in (rejects duplicate check-in with 409 Conflict)
       | 7. Updates registrations table:
       |      - checked_in = true
       |      - checked_in_at = NOW()
       |      - checked_in_by = admin.id
       | 8. Returns { success: true, message: 'Checked in successfully' }
       v
[Admin Dashboard] -> Row turns green with "Checked In" timestamp; Undo button available
```

---

## PART 5 — FEATURE-BY-FEATURE DEEP ANALYSIS

### Feature 1: Event Catalog & Dynamic Discovery
* **Purpose:** Showcase festival events across Technical, Cultural, and Sports categories with real-time rules, prize details, team limits, and venue mapping.
* **Frontend Implementation:**
  * Component: `src/app/events/page.tsx`, `src/app/events/EventsFilter.tsx`, `src/app/events/[slug]/page.tsx`, `src/components/EventCard.tsx`.
  * State: `activeTab` ('all' | 'technical' | 'cultural' | 'sports'), `searchQuery`, `sortBy`.
  * Interactivity: Dynamic keyword search across event names and descriptions; instant category filtering; modal links to registration pre-selected with event ID.
* **Backend Implementation:**
  * Route: `GET /api/events` (`src/app/api/events/route.ts`).
  * Logic: Returns cached static catalog from `src/lib/events-catalog.ts` with `revalidate = 3600`.
* **Failure Points & Edge Cases:** Fallback logic handles internal API fetch errors by falling back directly to `getActiveEvents()` in SSR mode.
* **Interview Questions & Strong Answers:**
  * *Q: Why store the event catalog in a static TypeScript file instead of querying the Supabase database on every request?*
  * *A: Festival event metadata is write-infrequent during the event lifecycle. Storing the catalog statically in TypeScript guarantees zero database cold-start latency, sub-millisecond response times, zero database egress costs, and absolute compile-time type safety across the entire application.*

---

### Feature 2: Dynamic Multi-Event Solo/Team Registration Engine
* **Purpose:** Allow a student to register for up to 12 events simultaneously, dynamically constructing team rosters for events requiring multiple teammates.
* **Frontend Implementation:**
  * Component: `src/app/register/page.tsx`.
  * State: `step` (1: Basic Info, 2: Events & Teams, 3: Payment Review), `formData`, `selectedIds`, `teamRegistrations: Record<string, TeamRegistration>`.
  * Logic: Automatically detects whether an event requires a team via `getTeamBounds(event)`. If team size is flexible (e.g., Dance 1–6 members), renders a dynamic size selector and creates normalized name input fields.
* **Backend Implementation:**
  * Route: `POST /api/payment/create-order` (`src/app/api/payment/create-order/route.ts`).
  * Validation: `registrationSchema` (`src/lib/validations.ts`) enforces Indian mobile regex (`/^[6-9]\d{9}$/`), email validation, and team structure bounds.
* **Database Interaction:** Inserts into `registrations` table with serialized `team_registrations` JSONB array.
* **Failure Points & Edge Cases:**
  * User manipulates client JavaScript to send `team_size = 1` for Box Cricket (requires 7): Server iterates over all events and verifies `teamSize === bounds.min`.
  * User inputs empty teammate names: Server rejects with 400 Bad Request.

---

### Feature 3: WhatsApp Payment Coordination Flow
* **Purpose:** Enable direct, fee-free fee collection by handing off payment coordination to organizers over WhatsApp with complete context.
* **Frontend Implementation:**
  * Component: `src/app/register/page.tsx`, `src/app/payment-pending/[ticketId]/page.tsx`.
  * Logic: Synchronously opens a window target upon user click to avoid browser popup blockers; redirects main window to a 5-second countdown page before routing to confirmation.
* **Backend Implementation:**
  * Function: `buildWhatsAppMessage()` formats candidate name, phone, college, selected events, ticket ID, and total INR.
  * Deep Link: Generates `https://api.whatsapp.com/send?phone=...&text=...`.
* **Database Interaction:** Records ticket with `payment_status = 'PENDING'`.
* **Interview Questions & Strong Answers:**
  * *Q: How do you prevent browser popup blockers from blocking the WhatsApp redirect?*
  * *A: Browsers block `window.open()` if invoked inside asynchronous callbacks (after `await fetch()`). To solve this, we trigger `window.open('about:blank', '_blank')` synchronously during the initial click event handler, execute the backend order creation, and then update the opened window's location with `popupWindow.location.replace(whatsappUrl)`.*

---

### Feature 4: High-Resolution Branded PDF Ticket & QR Generation
* **Purpose:** Provide an tamper-evident digital entry pass for verification at physical festival gates.
* **Backend & Service Implementation:**
  * Files: `src/lib/mail-service.ts`, `src/app/confirmation/[ticketId]/page.tsx`.
  * Library: `jspdf` and `qrcode`.
  * Visual Layout: Black background (`#050505`), double gold borders (`#D4AF37`), maroon corner geometric accents, dual base64 encoded college logos, dashed ticket ID box, 400x400 QR code matrix, and dynamic user details.
* **Security & Pass Encoding:** QR contains plain text structured entry pass data with Ticket ID, Name, College, Events, and Timestamp for rapid visual/scanner parsing.

---

### Feature 5: Transactional Email Delivery via Brevo API
* **Purpose:** Send automated confirmations and attached digital entry passes to participants immediately upon registration and payment confirmation.
* **Implementation:**
  * Service: `src/lib/mail-service.ts` -> `sendTicketEmail()`.
  * API Endpoint: `POST https://api.brevo.com/v3/smtp/email`.
  * Architecture: Dispatched in a non-blocking asynchronous promise chain (`.then(...)`) to prevent HTTP API latency from degrading frontend UI responsiveness.
  * Inlining: Base64 logo assets are embedded via Content-ID (`cid:logo_l`, `cid:logo_r`) to guarantee rendering across email clients without remote image blocking.

---

### Feature 6: Admin Dashboard & Gate Check-In System
* **Purpose:** Provide a centralized operations console for organizers to search attendees, manage cash payments, track financials, and check in participants via QR scanners.
* **Frontend Implementation:**
  * File: `src/app/admin/dashboard/page.tsx`.
  * Tabs:
    1. `registrations`: Paginated list with status filter, event filter, search bar, and Check-In / Undo buttons.
    2. `pending`: Filtered view of unpaid registrations with inline cash payment logging fields.
    3. `cash`: Dual-view table showing cash registration entries and ad-hoc physical cash entries with modal to create manual cash entries.
* **Backend Security:** Protected by `verifyAdmin` helper verifying JWT access tokens and querying `admin_users` table for active authorization. Role check restricts `viewer` role from all mutation endpoints (returns 403 Forbidden).

---

### Feature 7: High-Performance Lateral Export Views
* **Purpose:** Export flattened per-event registration data to CSV spreadsheets for event heads without duplicating data or writing heavy server-side loops.
* **Database View:** `organized_event_registrations_export` (`update_schema.sql`, `src/lib/supabase/schema.sql`).
* **SQL Logic:**
  ```sql
  CREATE OR REPLACE VIEW organized_event_registrations_export WITH (security_invoker = true) AS
  SELECT 
      e.category AS event_category,
      e.name AS event_name,
      r.ticket_id,
      r.name AS lead_participant_name,
      r.email AS lead_email,
      r.phone AS lead_phone,
      r.college,
      r.department,
      r.year,
      r.payment_status,
      r.payment_method,
      r.total_amount,
      r.created_at AS registration_date,
      tr.team_name,
      tr.team_size,
      (
          SELECT string_agg(m->>'name', ', ') 
          FROM jsonb_array_elements(tr.team_data->'members') AS m
      ) AS other_team_members,
      r.checked_in
  FROM registrations r
  CROSS JOIN LATERAL unnest(r.event_ids) AS eid(event_id)
  JOIN events e ON e.id = eid.event_id
  LEFT JOIN LATERAL (
      SELECT 
          t->>'team_name' AS team_name,
          (t->>'team_size')::int AS team_size,
          t AS team_data
      FROM jsonb_array_elements(
          CASE 
              WHEN jsonb_typeof(r.team_registrations) = 'array' THEN r.team_registrations 
              ELSE '[]'::jsonb 
          END
      ) AS t
      WHERE (t->>'event_id')::uuid = eid.event_id
  ) tr ON true;
  ```
* **Performance Advantage:** The unravelling of array items and JSON extraction occurs inside the PostgreSQL C engine in a single query pass.

---

## PART 6 — FILE-BY-FILE CODE UNDERSTANDING

### Core Libraries & Utilities

#### `src/middleware.ts`
* **Responsibility:** Global edge HTTP middleware. Injects OWASP-compliant HTTP security headers on all incoming requests (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Permissions-Policy`).
* **Relevance:** HIGH (Security & Architecture).

#### `src/lib/constants.ts`
* **Responsibility:** Static configuration dictionaries, color maps (`categoryColors`), committee tracks (`sportsCommitteeStructure`), schedule timeline data (`scheduleData`), ticket ID generator (`generateTicketId`), string sanitizer (`sanitizeInput`), and currency formatters (`formatFee`).
* **Critical Functions:**
  * `generateTicketId(category?: string)`: Generates structured alphanumeric ticket IDs: `MNT-<CAT>-<TIMESTAMP_36><RANDOM_3>`.
  * `sanitizeInput(input: string)`: Replaces dangerous HTML injection characters (`<`, `>`, `&`, `"`, `'`).
  * `calculateTotalFee(events: Event[], selectedIds: string[])`: Computes sum of event fees.

#### `src/lib/types.ts`
* **Responsibility:** Central TypeScript interface definitions.
* **Entities:** `Event`, `TeamMember`, `TeamRegistration`, `Registration`, `RegistrationFormData`, `AdminUser`, `ManualCashEntry`.

#### `src/lib/validations.ts`
* **Responsibility:** Zod runtime validation schemas for incoming HTTP payloads.
* **Schemas:** `registrationSchema`, `paymentVerificationSchema`, `teamMemberSchema`, `teamRegistrationSchema`. Enforces max 12 events per registration, max 50 teammates, and valid 10-digit Indian phone numbers.

#### `src/lib/rate-limit.ts`
* **Responsibility:** Database-backed distributed rate limiter.
* **Function:** `checkRateLimit(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }>`
* **Mechanism:** Queries the `rate_limits` table in Supabase. Clears records older than 15 minutes (`RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000`), counts requests for `(ip, endpoint)` in the window, and allows up to 10 requests per window.

#### `src/lib/events-catalog.ts`
* **Responsibility:** Static source of truth for all 16 festival events across Technical, Cultural, and Sports.
* **Functions:** `getActiveEvents()`, `getEventById(id)`, `getEventBySlug(slug)`, `getEventsByIds(ids[])`.

#### `src/lib/mail-service.ts`
* **Responsibility:** Programmatic PDF ticket compilation using `jsPDF` and transactional email dispatch via Brevo SMTP API.
* **Function:** `sendTicketEmail(details)`: Compiles custom gold-and-black parchment PDF pass with QR code, attaches Base64 buffer, and dispatches via HTTP POST to Brevo API.

#### `src/lib/supabase/client.ts` & `src/lib/supabase/server.ts`
* **Responsibility:** Singleton factories for Supabase PostgreSQL clients.
* **`client.ts`:** Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, respects Row Level Security (RLS). Wrapped in ES6 Proxy for lazy initialization.
* **`server.ts`:** Uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS for server-side API handlers. Strips quotes from environment variables and prevents build-time initialization errors.

---

## PART 7 — FUNCTION-BY-FUNCTION UNDERSTANDING

### 1. `checkRateLimit` (`src/lib/rate-limit.ts`)
* **Parameters:** `ip: string`, `endpoint: string`
* **Returns:** `Promise<{ allowed: boolean; remaining: number }>`
* **Logic:**
  1. Computes `windowStart = Date.now() - 15 minutes`.
  2. Executes DELETE on `rate_limits` where `window_start < windowStart`.
  3. Executes exact count query on `rate_limits` matching `ip_address == ip` AND `endpoint == endpoint` AND `window_start >= windowStart`.
  4. If `count >= 10`, returns `{ allowed: false, remaining: 0 }`.
  5. Inserts new record into `rate_limits` and returns `{ allowed: true, remaining: 10 - count - 1 }`.
* **Complexity:** Time $O(1)$ (indexed on `(ip_address, endpoint)`), Space $O(1)$.
* **Failure Mode:** If database connection drops, `create-order` catches the error and gracefully allows the request to proceed to avoid blocking genuine festival registrants.

### 2. `generateTicketId` (`src/lib/constants.ts`)
* **Parameters:** `category?: string` (e.g. `'technical'`)
* **Returns:** `string` (e.g. `'MNT-TECH-LZ8K19A'`)
* **Logic:** Concat prefix `'MNT'`, first 4 uppercase letters of category (default `'GEN'`), Base36 encoded current timestamp (`Date.now().toString(36)`), and 3 random Base36 alphanumeric characters.
* **Collision Handling:** The backend wraps database inserts in a 4-attempt retry loop; if PostgreSQL returns error code `23505` (unique constraint violation on `ticket_id`), it regenerates a new ID and retries.

### 3. `POST /api/payment/create-order` (`src/app/api/payment/create-order/route.ts`)
* **Parameters:** NextRequest containing Registration JSON.
* **Returns:** JSON `{ ticket_id, payment_status, whatsapp_url, coordinator_name, coordinator_phone }`.
* **Key Logic Steps:**
  1. Calls `checkRateLimit`.
  2. Runs `registrationSchema.safeParse(body)`.
  3. Fetches events by ID from `EVENT_CATALOG`.
  4. Recalculates total fee server-side, enforcing team boundary constraints and cultural solo/duo fee adjustments.
  5. Generates QR Code Data URL with `QRCode.toDataURL()`.
  6. Executes insert into `registrations` with retry logic for missing schema columns and duplicate ticket IDs.
  7. Builds WhatsApp redirect URL.
  8. Triggers `sendTicketEmail()` asynchronously.

### 4. `verifyAdmin` (Used across all `src/app/api/admin/**` routes)
* **Parameters:** `request: NextRequest`
* **Returns:** `Promise<AdminUser | null>`
* **Logic:**
  1. Extracts `Authorization` header and verifies `Bearer <token>` format.
  2. Calls `supabaseAdmin.auth.getUser(token)` to validate Supabase JWT.
  3. Queries `admin_users` table for row where `id == user.id`.
  4. **Self-Healing Fallback:** If ID lookup fails, searches `admin_users` by `email` (case-insensitive). If found, updates the row's `id` to the auth user's UUID.
  5. Returns admin record or `null` (triggering 401 Unauthorized).

---

## PART 8 — DATABASE DEEP DIVE

### Database Technology
**PostgreSQL 15+ hosted on Supabase**, leveraging native JSONB data types, UUID extensions (`uuid-ossp`), GIN indexing, and Row Level Security (RLS).

### Schema Definition

```text
+---------------------------------------------------------------------------------------------------+
|                                            TABLES                                                 |
+---------------------------------------------------------------------------------------------------+

TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('technical', 'cultural', 'sports')),
  fee INTEGER NOT NULL DEFAULT 0,                -- Fee stored in PAISE (₹1 = 100 paise)
  fee_calculation TEXT NOT NULL DEFAULT 'per_team' CHECK (fee_calculation IN ('per_team', 'per_participant')),
  max_participants INTEGER DEFAULT 200,
  current_participants INTEGER DEFAULT 0,
  event_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  venue TEXT NOT NULL,
  rules TEXT[],
  prize_text TEXT,
  prize_winner INTEGER,
  prize_runner_up INTEGER,
  prize_second_runner_up INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  team_size INTEGER DEFAULT 1,
  team_size_fixed INTEGER,
  team_size_min INTEGER,
  team_size_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  year TEXT,
  department TEXT,
  event_ids UUID[] NOT NULL,
  team_registrations JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount INTEGER NOT NULL,                 -- Amount in PAISE
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  payment_method TEXT CHECK (payment_method IN ('razorpay', 'cash')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  cash_amount INTEGER,
  cash_received_by TEXT,
  cash_received_at TIMESTAMPTZ,
  cash_receipt_number TEXT,
  cash_notes TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'viewer')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

TABLE manual_cash_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payer_name TEXT NOT NULL,
  payer_phone TEXT,
  payer_email TEXT,
  amount INTEGER NOT NULL,                       -- Amount in PAISE
  receipt_number TEXT,
  notes TEXT,
  collected_by TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexing & Performance
* `idx_registrations_ticket_id`: B-Tree index on `ticket_id` for instant scanner lookups.
* `idx_registrations_email`: B-Tree index for attendee search.
* `idx_registrations_payment_status`: Filter index for dashboard metrics.
* `idx_registrations_event_ids`: **GIN (Generalized Inverted Index)** on `UUID[]` array for fast event containment queries (`event_ids @> ARRAY['uuid']`).
* `idx_registrations_team_data`: **GIN Index** on `team_registrations` JSONB column for sub-millisecond nested JSON searches.
* `idx_rate_limits_ip_endpoint`: Composite index on `(ip_address, endpoint)` for fast rate-limit counter lookups.

---

## PART 9 — API DEEP DIVE

| Method | Endpoint | Purpose | Request Input | Response Output | Auth Required | Implementation File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Fetch all active events | None | `{ events: Event[] }` | Public | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/events/route.ts) |
| `GET` | `/api/registration/[ticketId]` | Lookup registration details | Route param `ticketId` | `{ registration, events }` | Public | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/registration/[ticketId]/route.ts) |
| `GET` | `/api/payment/whatsapp-config` | Fetch coordinator phone | None | `{ phone: string }` | Public | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/payment/whatsapp-config/route.ts) |
| `POST` | `/api/payment/create-order` | Create registration & WhatsApp URL | `RegistrationFormData` JSON | `{ ticket_id, payment_status, whatsapp_url }` | Public (Rate Limited) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/payment/create-order/route.ts) |
| `POST` | `/api/payment/verify` | Verify Razorpay payment | `{ razorpay_order_id, razorpay_payment_id, signature }` | `{ success: true, ticket_id }` | Public (HMAC Verified) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/payment/verify/route.ts) |
| `POST` | `/api/payment/webhook` | Razorpay server webhook | Raw Webhook Body + `x-razorpay-signature` | `{ success: true }` | Webhook Secret HMAC | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/payment/webhook/route.ts) |
| `POST` | `/api/admin/login` | Authenticate admin/staff | `{ email, password }` | `{ access_token, user: { id, email, role, name } }` | Public | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/login/route.ts) |
| `GET` | `/api/admin/stats` | Dashboard KPIs & capacities | None | `{ stats: {...}, events: [...] }` | Bearer JWT (Admin/Staff/Viewer) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/stats/route.ts) |
| `GET` | `/api/admin/registrations` | Paginated attendee list | Query params: `page, limit, status, event_id, search, date` | `{ registrations: [], total, page, limit }` | Bearer JWT (Admin/Staff/Viewer) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/registrations/route.ts) |
| `POST` | `/api/admin/check-in/[id]` | Check-in attendee at gate | Route param `id` (UUID) | `{ success: true, message }` | Bearer JWT (Admin/Staff) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/check-in/[id]/route.ts) |
| `PATCH`| `/api/admin/check-in/[id]` | Undo attendee check-in | Route param `id` (UUID) | `{ success: true, message }` | Bearer JWT (Admin/Staff) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/check-in/[id]/route.ts) |
| `GET` | `/api/admin/export` | Download unraveled CSV | Query params: `status, event_id, event_name, search, date` | `text/csv` attachment stream | Bearer JWT (Admin/Staff/Viewer) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/export/route.ts) |
| `GET` | `/api/admin/cash-payment` | List cash/pending rows | Query param `scope=pending|cash` | `{ registrations: [] }` | Bearer JWT (Admin/Staff/Viewer) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/cash-payment/route.ts) |
| `POST` | `/api/admin/cash-payment` | Mark registration as Cash Paid | `{ registration_id, cash_amount, cash_receipt_number, cash_notes }` | `{ success: true }` | Bearer JWT (Admin/Staff) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/cash-payment/route.ts) |
| `GET` | `/api/admin/cash-payment/manual` | List manual cash entries | None | `{ entries: [] }` | Bearer JWT (Admin/Staff/Viewer) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/cash-payment/manual/route.ts) |
| `POST` | `/api/admin/cash-payment/manual` | Create ad-hoc cash entry | `{ payer_name, payer_phone, payer_email, amount, receipt_number, notes }` | `{ success: true, entry }` | Bearer JWT (Admin/Staff) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/cash-payment/manual/route.ts) |
| `GET` | `/api/admin/cash-payment/export` | Download combined cash CSV | None | `text/csv` attachment stream | Bearer JWT (Admin/Staff/Viewer) | [route.ts](file:///e:/study/Manthan/manthan2k26/src/app/api/admin/cash-payment/export/route.ts) |

---

## PART 10 — AUTHENTICATION & AUTHORIZATION

```text
[Admin Login: /admin/page.tsx]
       |
       | Enters Email & Password
       v
[POST /api/admin/login]
       |
       | 1. Creates Supabase Anon Client
       | 2. Calls authClient.auth.signInWithPassword({ email, password })
       | 3. If valid -> Receives Supabase Auth User + JWT Access Token
       | 4. Queries admin_users table for matching id / email
       | 5. If authorized -> Returns { access_token, user: { role: 'admin'|'staff'|'viewer' } }
       v
[Admin Client Storage]
       | Saves in browser localStorage: 'admin_token' & 'admin_user'
       v
[Subsequent Admin API Requests]
       | Attached in Header: "Authorization: Bearer <admin_token>"
       v
[verifyAdmin() in API Routes]
       | 1. Calls supabaseAdmin.auth.getUser(token) -> Verifies JWT cryptographic signature
       | 2. Queries admin_users table to verify role
       | 3. Enforces Role Constraints:
       |      - 'admin'  -> Read, Check-in, Cash Collection, Exports, User Management
       |      - 'staff'  -> Read, Check-in, Cash Collection, Exports
       |      - 'viewer' -> Read, Exports ONLY (POST/PATCH endpoints return 403 Forbidden)
```

---

## PART 11 — ERROR HANDLING & RESILIENCE

1. **Database Schema Cache Mismatch Resilience:**
   In `src/app/api/payment/create-order/route.ts`, `verify/route.ts`, and `webhook/route.ts`, database update calls are wrapped in `updateRegistrationWithCompat()`. If an update fails because a newly added column is missing from older Supabase deployment caches (e.g. `cash_amount`), the regex extractor `extractMissingColumnFromError()` catches the missing column name, strips it from the payload, and retries the mutation up to 4 times automatically.
2. **Ticket ID Collision Resolution:**
   If `supabaseAdmin.from('registrations').insert()` throws a PostgreSQL duplicate key violation (`23505`) on `ticket_id`, the handler generates a brand-new ticket ID and retries inserting without returning a 500 error to the participant.
3. **Non-Blocking External Services:**
   Email delivery via Brevo is executed asynchronously (`.then().catch()`). If the Brevo API times out or fails due to invalid API keys, the registration process completes successfully, the ticket ID is created, and the participant is not blocked from completing their registration.

---

## PART 12 — EDGE CASES ANALYSIS

| Edge Case | Handled? | Location in Code | Actual Behavior | Improvement Recommendation |
| :--- | :---: | :--- | :--- | :--- |
| **Duplicate Ticket ID Generated** | Yes | `create-order/route.ts:L359-366` | Traps error `23505`, generates fresh ticket ID, and retries insertion. | Increase timestamp entropy in generator. |
| **Teammate Count Incomplete** | Yes | `create-order/route.ts:L277-284` | Rejects with 400 stating exact number of required teammate names. | Client-side pre-submit field focus. |
| **Cultural Solo vs Group Fee** | Yes | `create-order/route.ts:L294-298` | Server detects Solo (₹200) vs Group (₹400) and overrides flat participant fee. | Move rule configuration directly into `EVENT_CATALOG` schema. |
| **Razorpay Webhook Double Execution** | Yes | `webhook/route.ts:L152-155` | Checks `registration.payment_status === 'PAID'` and skips reprocessing with 200 OK. | Add explicit idempotent event table. |
| **Viewer Role Attempting Mutation** | Yes | `check-in/[id]/route.ts:L49-51` | Rejects mutation with 403 Forbidden ("Viewer account cannot perform actions"). | Disable action buttons conditionally in UI. |
| **Popup Blocker on WhatsApp Link** | Yes | `register/page.tsx:L384-387` | Pre-opens window target synchronously before initiating async fetch. | Add explicit manual "Click here to open WhatsApp" link fallback. |
| **Database Unavailable / Rate Limit Fail** | Yes | `create-order/route.ts:L181-184` | Catches rate limiter exception and allows order creation to proceed. | Fallback to in-memory LRU cache rate limiting. |

---

## PART 13 — SECURITY REVIEW

* **Row Level Security (RLS):** Enabled across all database tables (`events`, `registrations`, `admin_users`, `rate_limits`, `manual_cash_entries`). Public anon client cannot write to `registrations` or read others' records.
* **Security Headers Middleware:** `src/middleware.ts` enforces `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and restrictive `Permissions-Policy`.
* **Input Sanitization & XSS Defense:** `sanitizeInput()` strips HTML tags and escapes special entities.
* **HMAC Webhook Verification:** `src/app/api/payment/webhook/route.ts` computes SHA-256 HMAC over the raw request payload using `RAZORPAY_WEBHOOK_SECRET` before processing.
* **Secret Isolation:** `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, and `RAZORPAY_KEY_SECRET` are never prefixed with `NEXT_PUBLIC_` and are strictly accessed inside server-side route handlers.

---

## PART 14 — PERFORMANCE REVIEW

* **Static Catalog Architecture:** Festival event catalog is maintained in TypeScript memory (`src/lib/events-catalog.ts`), eliminating database queries for event listing and validation.
* **GIN Indexing on PostgreSQL:** Arrays (`event_ids`) and JSONB columns (`team_registrations`) use Generalized Inverted Indexes (`idx_registrations_event_ids`, `idx_registrations_team_data`), providing sub-millisecond filtering across thousands of records.
* **Database-Side Lateral Flattening:** The view `organized_event_registrations_export` executes `CROSS JOIN LATERAL unnest()` and `jsonb_array_elements()` inside the database engine, avoiding memory-intensive Node.js data transformations.
* **Asynchronous Email & PDF Dispatch:** PDF compilation and email sending occur in background promise chains, keeping API response latency under 300ms.
* **Lazy Background Video:** Landing page video background is loaded only after the intro sequence completes, preventing bandwidth contention during initial asset loading.

---

## PART 15 — DEPENDENCY AUDIT

| Package | Version | Purpose | Usage Area | Failure Impact If Removed |
| :--- | :--- | :--- | :--- | :--- |
| `next` | `^14.2.0` | Core Full-Stack React Framework | Root framework | Complete application failure |
| `react` / `react-dom` | `^18.3.0` | Component & Virtual DOM runtime | All UI components | Complete application failure |
| `@supabase/supabase-js`| `^2.45.0` | Supabase DB & Auth Client | `src/lib/supabase/**`, API routes | Total database & auth failure |
| `zod` | `^3.23.0` | Schema validation | `src/lib/validations.ts`, API routes | Input validation & type inference fail |
| `jspdf` | `^4.2.0` | PDF Pass generation | `src/lib/mail-service.ts`, confirmation | PDF entry pass generation fails |
| `qrcode` | `^1.5.4` | 2D QR matrix data URL generator | `create-order`, `verify`, `webhook` | Entry passes generated without QR code |
| `framer-motion` | `^11.5.0` | UI animations & modal transitions | Components, landing, registration | UI animations & modals fail |
| `swiper` | `^12.1.2` | 3D coverflow touch carousel | `src/app/page.tsx` (The Arena section) | Carousel breaks on landing page |
| `lucide-react` | `^0.441.0` | UI SVG Icons | Throughout entire app | Icons fail to render |
| `dotenv` | `^17.3.1` | Loads `.env.local` for CLI scripts | `scripts/**` | Operational CLI scripts fail to load env |
| `razorpay` | `^2.9.0` | Payment SDK | `scripts/reconcile_all.js` | Automated Razorpay reconciliation fails |

---

## PART 16 — CONFIGURATION & ENVIRONMENT VARIABLES

| Variable Name | Required | Purpose | Security Classification |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase PostgreSQL project API URL | Public (Safe for client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous API key (enforces RLS) | Public (Safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role admin key (bypasses RLS) | **Confidential Secret** (Server-only) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Root URL of deployment (e.g. `http://localhost:3000`) | Public |
| `WHATSAPP_PAYMENT_NUMBER` | Yes | Coordinator phone number for payment intent URLs | **Confidential / Server Config** |
| `WHATSAPP_COORDINATOR_NAME` | Yes | Coordinator display name for notifications | Server Config |
| `NEXT_PUBLIC_WHATSAPP_PAYMENT_NUMBER` | No | Client-side optimization phone number for instant popup | Public |
| `BREVO_API_KEY` | Yes | Brevo API key for transactional email delivery | **Confidential Secret** (Server-only) |
| `BREVO_SENDER_EMAIL` | Yes | Verified sender email address in Brevo | Server Config |
| `BREVO_SENDER_NAME` | Yes | Display name for transactional emails | Server Config |
| `RAZORPAY_KEY_ID` | Optional | Razorpay public key ID | Public / Server Config |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay HMAC verification secret | **Confidential Secret** (Server-only) |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook signature verification secret | **Confidential Secret** (Server-only) |
| `ADMIN_ACCOUNT_EMAIL` | Optional | Default admin email for setup scripts | Operator Config |
| `ADMIN_ACCOUNT_PASSWORD` | Optional | Default admin password for setup scripts | **Confidential Secret** |

---

## PART 17 — AI & NATURAL LANGUAGE COMPONENTS

### Component: "The Scribe" Chatbot (`src/components/Chatbot.tsx`)
* **Architecture:** Rule-based NLP keyword intent matcher wrapped in an ancient parchment-styled React interface.
* **Mechanism:** Maintains an indexed knowledge base of queries (`FAQS` array). When a user submits a prompt, the engine normalizes the string to lowercase, evaluates keyword intersections (`faq.keywords.some(...)`), and returns predefined thematic responses alongside interactive quick-reply option chips.
* **Why Rule-Based Over LLM API:** For festival logistics (deadlines, fees, venues, schedules), deterministic rule-based matching guarantees 100% factual accuracy, zero hallucination risk, zero API token cost, and sub-10ms response latency.

---

## PART 18 — CODE QUALITY & TECHNICAL DEBT REVIEW

### Strengths:
1. **Bulletproof Server-Side Validation:** Total fees, participant counts, and team boundaries are computed on the server; client payloads are treated as untrusted suggestions.
2. **Database-Level Lateral Transformations:** Offloading array unnesting and JSONB parsing to PostgreSQL views simplifies backend code and improves export performance.
3. **Resilient Error Recovery:** Backward-compatible schema retries and duplicate ticket ID generation ensure uninterrupted user registrations.

### Areas for Future Improvement (Technical Debt):
1. **Consolidated Catalog Storage:** Event rules and fee overrides are stored in `src/lib/events-catalog.ts` while database seed data is stored in `schema.sql`. Unifying event definitions into an admin-editable database table with an in-memory caching layer (e.g. Redis or Next.js cache) would allow dynamic festival updates without redeployments.
2. **Component Granularity:** `src/app/admin/dashboard/page.tsx` and `src/app/register/page.tsx` contain extensive UI logic. Splitting them into smaller sub-components (e.g. `RegistrationsTab`, `CashLedgerTab`, `TeamRosterBuilder`) would improve maintainability.

---

## PART 19 — "WHY DID YOU DO THIS?" (INTERVIEW DEFENSE)

### Q1: Why did you choose Next.js 14 App Router instead of a separate React frontend and Express backend?
* **What they are testing:** Architectural justification, deployment complexity understanding.
* **Strong Answer:** *"Next.js 14 App Router unified our frontend and backend under a single TypeScript type system. It eliminated the need to maintain separate repositories, CORS configurations, and dual deployment pipelines. Serverless Route Handlers provide automatic scaling during registration spikes, while React Server Components ensure fast initial page loads for the event catalog."*

### Q2: Why store dynamic team members in a JSONB column rather than a normalized relational `registration_members` table?
* **What they are testing:** Schema design trade-offs, database paradigms.
* **Strong Answer:** *"In a festival environment, team sizes vary drastically—from individual solo events to 8-person cricket teams and flexible dance troupes. Storing teammate rosters as a structured JSONB array inside the registration row avoids complex multi-table inserts and transactional locks during peak registration hours. Combined with GIN indexes and lateral export views, we maintain both high write throughput and instant SQL query capability."*

### Q3: Why implement a WhatsApp-first payment flow rather than forcing an automated gateway like Razorpay or Stripe?
* **What they are testing:** Product decision-making, real-world context awareness.
* **Strong Answer:** *"In college technical fests, many participant teams prefer direct UPI transfers or physical cash desks to avoid gateway convenience fees and failed transaction disputes. We engineered a hybrid payment architecture: the WhatsApp-first flow gives participants immediate coordinator assistance and logs a pending ticket, while our admin cash ledger and legacy Razorpay HMAC verification endpoints allow organizers to confirm payments across any channel seamlessly."*

---

## PART 20 — "CHANGE THIS CODE" (LIVE-CODING EXERCISES)

### Exercise 1: Add a College ID Card Image Upload to Registration
* **Files to Modify:** `src/lib/types.ts`, `src/lib/validations.ts`, `src/app/register/page.tsx`, `src/app/api/payment/create-order/route.ts`, `src/lib/supabase/schema.sql`.
* **Step-by-Step Reasoning:**
  1. Add `id_card_url: z.string().url().optional()` to `registrationSchema` in `src/lib/validations.ts`.
  2. Add `id_card_url TEXT` column to `registrations` table in `schema.sql`.
  3. In `register/page.tsx`, add an `<input type="file" accept="image/*" />` to Step 1, upload the file to a Supabase Storage bucket (`id-cards`), and store the returned public URL in `formData.id_card_url`.
  4. In `create-order/route.ts`, include `id_card_url` in the Supabase insertion payload.

### Exercise 2: Add Maximum Event Registration Limit (Capacity Check)
* **Files to Modify:** `src/app/api/payment/create-order/route.ts`.
* **Step-by-Step Reasoning:**
  1. Inside the event validation loop in `create-order/route.ts`, query Supabase for the current count of paid registrations containing `event.id`:
     ```typescript
     const { count } = await supabaseAdmin
       .from('registrations')
       .select('*', { count: 'exact', head: true })
       .contains('event_ids', [event.id])
       .eq('payment_status', 'PAID');
     ```
  2. Compare `(count || 0) >= event.max_participants`. If exceeded, return `NextResponse.json({ error: `Event "${event.name}" is sold out!` }, { status: 400 })`.

---

## PART 21 — DEBUGGING SCENARIOS

### Scenario 1: A user claims they registered, but the WhatsApp chat did not open and their screen remained stuck.
* **Root Cause & Diagnosis:** Browser popup blocker intercepted `window.open()`, or network failed during `/api/payment/create-order`.
* **Investigation Steps:**
  1. Check browser console for network error responses from `/api/payment/create-order`.
  2. Search Supabase `registrations` table by the student's email. If the record exists with status `PENDING`, provide the user with their `ticket_id` and manually confirm payment via `/admin/dashboard`.
  3. Verify `WHATSAPP_PAYMENT_NUMBER` environment variable format (must be 11–15 digits including country code with no `+` or dashes).

### Scenario 2: Admin login returns 403 "Not authorized as admin".
* **Root Cause & Diagnosis:** The user authenticated successfully with Supabase Auth, but no record with matching `id` or `email` exists in the `admin_users` table with a valid role.
* **Investigation Steps:**
  1. Check `scripts/setup_generalized_admins.js` and verify `ADMIN_ACCOUNT_EMAIL` matches the login email.
  2. Inspect the `admin_users` table in Supabase SQL editor:
     ```sql
     SELECT * FROM admin_users WHERE email = 'admin@manthan.in';
     ```
  3. Ensure the `role` column contains `'admin'` or `'staff'` and that the `id` corresponds to `auth.users.id`.

---

## PART 22 — CODE TRACING EXERCISES

### Trace 1: Tracing `handlePayment()` to Database Insertion
1. **User Action:** Clicks "Proceed to Registration" on `/register`.
2. **`register/page.tsx:L384`:** `handlePayment()` opens popup window -> sends POST `/api/payment/create-order`.
3. **`create-order/route.ts:L179`:** Invokes `checkRateLimit(ip, 'create-order')` -> reads/updates `rate_limits` table.
4. **`create-order/route.ts:L196`:** Runs `registrationSchema.safeParse(body)` -> validates phone regex & array lengths.
5. **`create-order/route.ts:L247`:** Iterates selected event IDs -> fetches catalog records -> calculates exact paise total.
6. **`create-order/route.ts:L321`:** Calls `QRCode.toDataURL(qrContent)` -> generates 400x400 Base64 PNG string.
7. **`create-order/route.ts:L350`:** Invokes `supabaseAdmin.from('registrations').insert(insertPayload)` -> persists row in PostgreSQL.
8. **`create-order/route.ts:L417`:** Fires non-blocking `sendTicketEmail()` -> generates PDF pass & calls Brevo SMTP API.
9. **`create-order/route.ts:L438`:** Returns JSON `{ ticket_id, whatsapp_url, ... }` -> frontend redirects to `/payment-pending/[ticketId]`.

---

## PART 23 — RAPID-FIRE TECHNICAL INTERVIEW QUESTIONS

### Easy
* **Q: What unit of currency is used for fees in the database and why?**
  * *A: Indian Paise (integer, e.g. ₹50 = 5000 paise). Storing currency as integers prevents floating-point rounding errors during financial aggregations.*
* **Q: How does the system generate ticket IDs?**
  * *A: `generateTicketId()` concatenates `'MNT'`, the event category prefix, a Base36 timestamp, and random Base36 characters (e.g. `MNT-TECH-M1X8K2A`).*

### Medium
* **Q: How does the admin authentication system verify tokens on API routes?**
  * *A: Route handlers extract the `Bearer <token>` string from the `Authorization` header and invoke `supabaseAdmin.auth.getUser(token)`. If valid, they query the `admin_users` table to verify the user's role.*
* **Q: What is the purpose of GIN indexing in this application?**
  * *A: Generalized Inverted Indexes (`idx_registrations_event_ids` and `idx_registrations_team_data`) allow PostgreSQL to index array elements and nested JSON keys, enabling sub-millisecond queries on multi-event and team-member records.*

### Hard / Very Hard
* **Q: How does the CSV export query flatten registrations without causing N+1 database queries?**
  * *A: The `organized_event_registrations_export` PostgreSQL view uses `CROSS JOIN LATERAL unnest(r.event_ids)` to unroll the event array into separate rows and a `LEFT JOIN LATERAL` over `jsonb_array_elements(r.team_registrations)` to extract the matching team members directly in PostgreSQL.*

---

## PART 24 — PRE-INTERVIEW SELF-TEST CHECKLIST

- [x] Can explain the end-to-end data flow from registration to ticket email in under 60 seconds.
- [x] Can explain why team data is stored as JSONB and how the lateral export view flattens it.
- [x] Can point to the exact file where server-side fee calculation is enforced (`create-order/route.ts`).
- [x] Can explain the role hierarchy (`admin` vs `staff` vs `viewer`) and where it is enforced (`verifyAdmin`).
- [x] Can describe how popup blockers are bypassed during WhatsApp handoff.
- [x] Can explain the error-handling retry mechanism for Supabase schema cache mismatches.
- [x] Can explain the cryptographic verification process for Razorpay webhook signatures (HMAC-SHA256).
- [x] Can explain how database-backed rate limiting works without Redis.

---

## PART 25 — TOP 20 CONCEPTS & CODE LOCATIONS TO REMEMBER

1. **`src/app/api/payment/create-order/route.ts`**: The central registration engine (Zod validation, server fee calculation, QR generation, DB insert, email dispatch).
2. **`src/lib/events-catalog.ts`**: In-memory static catalog of 16 events with rules, team bounds, and fees.
3. **`src/lib/supabase/schema.sql`**: Complete PostgreSQL schema, tables, GIN indexes, RLS policies, and triggers.
4. **`update_schema.sql`**: The `organized_event_registrations_export` SQL lateral view.
5. **`src/lib/mail-service.ts`**: `jsPDF` custom black/gold entry pass compilation and Brevo REST API dispatch.
6. **`src/app/admin/dashboard/page.tsx`**: Multi-tab operations dashboard (attendee management, live check-ins, cash ledger).
7. **`src/lib/rate-limit.ts`**: Distributed SQL-backed IP window rate limiter (`checkRateLimit`).
8. **`src/app/register/page.tsx`**: Dynamic multi-step wizard with bounded team roster builder.
9. **`src/lib/constants.ts`**: `generateTicketId()`, `sanitizeInput()`, `formatFee()`, and `scheduleData`.
10. **`src/lib/validations.ts`**: `registrationSchema` enforcing phone regex and array constraints.
11. **`src/app/api/admin/login/route.ts`**: Supabase Auth login handler with email-matching self-healing fallback.
12. **`src/app/api/admin/check-in/[id]/route.ts`**: Gate QR scanner check-in & check-in undo handler.
13. **`src/app/api/admin/cash-payment/route.ts`**: Physical cash reconciliation and pending-to-paid tagging handler.
14. **`src/app/api/admin/export/route.ts`**: Dynamic per-event CSV export stream generator.
15. **`src/middleware.ts`**: Edge security headers injector (`X-Frame-Options: DENY`, `HSTS`, `CSP`).
16. **`src/lib/supabase/server.ts`**: Service-role Supabase client with environment variable cleaning.
17. **`src/components/ClientLayout.tsx`**: Intro video orchestrator, lazy background video loader, and theme provider.
18. **`src/components/Chatbot.tsx`**: "The Scribe" rule-based festival guide chatbot.
19. **`src/app/confirmation/[ticketId]/page.tsx`**: Digital pass renderer and print view.
20. **`scripts/reconcile_all.js`**: Background payment reconciliation worker querying Razorpay API.

---

## PART 26 — 60-SECOND NATURAL INTERVIEW PITCH

> *"For BVIMIT's Manthan 2026 festival, I developed a production-ready, full-stack event registration and operations platform using Next.js 14 App Router, TypeScript, and Supabase. The platform manages registrations for 16 technical, cultural, and sports events. To solve the complexity of variable team sizes, I designed a hybrid database architecture combining relational integrity with JSONB team structures, optimized using PostgreSQL GIN indexes and lateral export views. For payments, we built a WhatsApp-first coordination flow alongside an on-ground cash ledger and Razorpay webhook compatibility. The platform automatically generates branded PDF tickets with signed QR codes, dispatches them via Brevo's email API, and provides organizers with an RBAC-secured dashboard for sub-second gate check-ins and financial tracking."*

---

## PART 27 — 3-MINUTE DEEP TECHNICAL EXPLANATION

> *"The Manthan 2026 platform is engineered around three core principles: data flexibility, operational reliability, and sub-second performance.*
>
> *On the frontend, we used Next.js 14 App Router, Tailwind CSS, and Framer Motion to create a responsive, ancient-themed interface. To ensure rapid catalog discovery, event definitions are maintained in static TypeScript memory, providing sub-millisecond page loads with zero database overhead.*
>
> *When a participant registers, our multi-step wizard dynamically adapts based on event constraints—handling solo participants, duo quiz teams, fixed 7-person sports squads, and flexible dance troupes. When submitted, the backend executes strict Zod schema validation, enforces IP-based rate limiting directly in PostgreSQL, and recalculates all fees server-side in paise to prevent tampering.*
>
> *Once the pending record is stored, the system builds an encrypted 2D QR matrix and hands the user off to our coordinator desk via WhatsApp with a pre-filled registration summary. Simultaneously, a background task uses jsPDF to compile a branded A4 digital pass with embedded QR verification seals and dispatches it via Brevo's transactional email API.*
>
> *On the operations side, organizers log into an RBAC-protected dashboard supporting Admin, Staff, and Viewer roles. Staff can verify physical cash payments, log receipt numbers into an immutable ledger, and scan QR codes at venue gates for instant check-in. To solve the challenge of reporting nested team structures, we engineered a PostgreSQL view using `CROSS JOIN LATERAL` and `jsonb_array_elements`, allowing organizers to export clean, one-row-per-participation CSV spreadsheets in a single database pass.*
>
> *The entire system is secured with Supabase Row Level Security, OWASP edge middleware headers, and database compatibility fallbacks to ensure uninterrupted operation during peak festival traffic."*

---

## PART 28 — HONEST AI-ASSISTED DEVELOPMENT DISCUSSION

* **Did you use AI tools during development?**
  * *"Yes, I utilized AI coding assistants (like Google Antigravity / Claude) to accelerate component scaffolding, boilerplate generation, and schema typing."*
* **What was your personal architectural contribution?**
  * *"I owned the core system architecture, business logic, and security design. Specifically, I designed the hybrid JSONB database schema, engineered the PostgreSQL lateral export views, structured the multi-step server-side fee validation engine, and implemented the WhatsApp payment handoff and admin RBAC system. While AI helped generate initial UI boilerplate, every line of business logic, database policy, and error handler was reviewed, debugged, and validated by me."*
* **How did you validate and debug AI-generated code?**
  * *"AI models often generate naive database queries or make assumptions about client-side fee calculations. I caught and resolved several critical edge cases: ensuring fees are recalculated exclusively on the server, adding compatibility fallbacks for Supabase schema cache mismatches, preventing browser popup blockers during WhatsApp redirects, and implementing GIN indexing on PostgreSQL arrays to prevent query bottlenecks."*

---

## PART 29 — INTERVIEWER'S ATTACK PATHS (GRILLING CHAINS)

### Chain 1: Database Architecture & JSONB Querying
1. **Interviewer:** *"I see you stored team member names in a JSONB column. Why didn't you create a separate `team_members` relational table?"*
   * **Answer:** Explain that team structures vary widely across 16 events. JSONB allows flexible document storage without complex multi-table transactional locks during registration spikes.
2. **Interviewer:** *"Doesn't querying JSONB cause full table scans and slow down reporting?"*
   * **Answer:** Point to the GIN index `idx_registrations_team_data` on `team_registrations` and the `organized_event_registrations_export` view, which uses lateral unnesting directly inside PostgreSQL.
3. **Interviewer:** *"Open that view. Explain what `CROSS JOIN LATERAL unnest(r.event_ids)` actually does."*
   * **Answer:** Explain that `unnest()` takes the PostgreSQL UUID array of event IDs and transforms each array element into an individual relational row, which is then joined with the `events` table and the matching team JSON block.

### Chain 2: Payment Security & Webhook Tampering
1. **Interviewer:** *"How do you prevent a malicious user from modifying the registration fee in their browser?"*
   * **Answer:** The client-side total is strictly a visual preview. In `src/app/api/payment/create-order/route.ts`, the server retrieves event IDs from `EVENT_CATALOG`, computes `totalAmountPaise` on the server, and inserts that value into the database.
2. **Interviewer:** *"If someone calls your verify or webhook endpoint directly with Postman, how do you prevent fake payments?"*
   * **Answer:** Show `src/app/api/payment/verify/route.ts` and `webhook/route.ts`. The backend computes `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)` over `order_id + '|' + payment_id` and verifies that it exactly matches `razorpay_signature`. If mismatched, it rejects the request and marks the record as `FAILED`.

---

## PART 30 — FINAL INTERVIEW CHEAT SHEET

* **Project in One Sentence:** A high-performance festival registration and ticketing platform with dynamic solo/team registrations, WhatsApp payment coordination, branded PDF/QR passes, and an RBAC admin dashboard.
* **Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), Zod, jsPDF, QRCode, Brevo API, Framer Motion.
* **Database Tables:** `events`, `registrations` (with JSONB `team_registrations`), `admin_users`, `rate_limits`, `manual_cash_entries`.
* **Export View:** `organized_event_registrations_export` (`CROSS JOIN LATERAL unnest(event_ids)`).
* **Payment Architecture:** WhatsApp-first direct coordination + on-ground Cash audit ledger + legacy Razorpay HMAC verification.
* **Security Essentials:** Supabase RLS, JWT Bearer verification, edge security middleware (`X-Frame-Options: DENY`, `HSTS`), and database rate limiting.
* **Top 3 Architecture Highlights:**
  1. Server-side fee calculation & team boundary enforcement.
  2. Sub-second in-memory static event catalog (`events-catalog.ts`).
  3. Lateral PostgreSQL export view for zero-overhead spreadsheet generation.
* **Best Fallback If Asked About Unknown Code:** *"I don't recall the exact line off the top of my head, but based on our architecture, it is implemented in the server route handler to ensure strict data validation and security."*
