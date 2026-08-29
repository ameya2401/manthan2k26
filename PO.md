# Project Name
Manthan 2026 Platform

# One-line Summary
A production-ready, full-stack festival registration platform featuring event discovery, flexible solo/team registrations, hybrid payment coordination, and comprehensive admin operations.

# Problem it solves
Managing a college festival involves complex logistics around diverse event types, team structures, and payment collections. This application streamlines the entire process by offering a unified portal for participants to discover events and register (solo or as teams). It simplifies fee collection through a WhatsApp-first payment coordination flow (with optional Razorpay integration), instantly generates and emails branded PDF tickets with QR codes, and provides organizers with a secure dashboard to manage check-ins, track financials, and export analytics.

# Target Users
- **Participants/Students:** Users browsing events and registering themselves or their teams.
- **Event Coordinators/Staff:** On-ground volunteers checking in users via QR codes and managing specific event rosters.
- **Administrators:** Core committee members overseeing the festival's financials, managing manual cash entries, and exporting detailed registration data.

# Tech Stack
- **Frontend Framework:** Next.js 14 (App Router), React 18
- **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React
- **Language:** TypeScript
- **Backend/API:** Next.js Serverless API Routes
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Validation:** Zod
- **External Services:** Brevo API (Transactional Emails), Razorpay (Payment Gateway - optional)
- **Utilities:** `jspdf` (PDF Generation), `qrcode` (QR Code Generation)

# Architecture
- **Frontend:** Server and Client components built with Next.js App Router, using Tailwind CSS and Framer Motion for a dynamic, responsive user interface.
- **Backend:** Next.js API Routes serving as the intermediary layer for processing registrations, verifying payments, and generating tickets.
- **Database:** Supabase PostgreSQL handling relational data and unstructured JSONB data for dynamic team sizes. Implements Row Level Security (RLS) to enforce strict access control at the database layer.
- **Authentication:** Supabase Auth is used to secure the admin dashboard and assign role-based access (admin, staff, viewer).

# Core Features
- Public event catalog categorized into Technical, Cultural, and Sports events.
- Dynamic registration system supporting both individual and variable-sized team sign-ups.
- WhatsApp-first payment coordination flow for seamless manual transaction verification.
- Instant, automated branded PDF ticket generation with embedded QR codes.
- Automated transactional email delivery of tickets via the Brevo API.
- Secure admin dashboard for managing registrations, verifying payments, and scanning QR codes for check-ins.
- Role-based access control separating Super Admins, Staff, and Viewers.

# Advanced Features
- Custom, database-backed rate limiting to protect critical API endpoints from abuse.
- Complex PostgreSQL `JSONB` integration allowing flexible storage and querying of dynamic team structures.
- Direct database-level Row Level Security (RLS) policies ensuring unauthorized users cannot read or mutate sensitive participant data.
- Automated generation of flattened spreadsheet exports using advanced PostgreSQL views (`CROSS JOIN LATERAL` and `jsonb_array_elements`).
- Resilient hybrid payment system capable of handling both manual cash entries and automated Razorpay webhooks.

# Project Workflow
1. **Discovery:** A user visits the platform and browses the catalog of technical, cultural, and sports events.
2. **Registration:** The user selects events and fills out a dynamic form (adding team members if required by the event's rules).
3. **Checkout:** A pending registration is created, and the user is redirected to a payment handoff screen (WhatsApp coordination or Razorpay).
4. **Verification:** Once the payment is verified (manually by an admin or automatically via webhook), the system updates the registration status to `PAID`.
5. **Ticket Issuance:** The backend generates a branded PDF ticket with a QR code and emails it to the user via Brevo.
6. **Check-in:** On the day of the event, organizers use the admin dashboard to scan the participant's QR code and securely mark them as checked in.

# Folder Structure
- `src/app`: Contains Next.js routing files, dividing the app into public pages and backend `/api` routes (admin, events, payment, registration).
- `src/components`: Reusable React components (e.g., EventCard, PaymentOverlay, Chatbot, animated layouts).
- `src/lib`: Core domain logic, TypeScript types, validation schemas, and external integrations (Supabase clients, mail-service).
- `scripts`: Operational Node.js scripts for database maintenance, reconciling payments, and setting up admin accounts.
- `public`: Static assets, fonts, and images.

# APIs & Integrations
- **Supabase:** Core database and authentication provider.
- **Brevo API:** Integrated for sending automated transactional emails with PDF attachments.
- **Razorpay API (Optional):** Endpoints and webhooks configured for automated payment processing.
- **WhatsApp API / Intent:** Used for redirecting users to coordinators for manual payment verification.

# Database
- **`events`**: Stores event metadata, rules, fees, and constraints.
- **`registrations`**: Central table storing user details, array of `event_ids`, JSONB `team_registrations`, and payment state.
- **`admin_users`**: Maps Supabase Auth UUIDs to application roles (admin, staff).
- **`rate_limits`**: Tracks IP addresses and endpoints to enforce rate limits.
- **`manual_cash_entries`**: Audit log for physical cash collected by staff.
- **Views**: `organized_event_registrations_export` flattens complex relational and JSONB data for easy CSV exports.

# Engineering Highlights
- **JSONB Optimization:** Overcame the rigidity of relational tables by storing variable-length team data as `JSONB`, while maintaining query performance via GIN indexes.
- **Complex Data Flattening:** Engineered a PostgreSQL View (`organized_event_registrations_export`) using lateral joins to flatten nested JSON structures directly in the database, eliminating heavy data transformation on the Node.js server.
- **Database-Level Rate Limiting:** Implemented a custom rate-limiting table and logic to prevent API abuse without relying on external services like Redis.
- **Strict Data Governance:** Leveraged Supabase Row Level Security (RLS) to enforce business logic directly at the database tier, ensuring API vulnerabilities cannot easily leak participant data.

# Challenges Solved
- **Variable Team Structures:** Solved the complexity of allowing a user to register for a solo event and a 10-person sports team simultaneously by decoupling team member data into a highly flexible JSONB structure.
- **Handling Payment Edge Cases:** Designed a hybrid payment model that gracefully handles webhook failures, manual cash payments, and WhatsApp-coordinated UPI transfers, backed by reconciliation scripts.
- **Admin Export Capabilities:** Solved the difficulty of exporting nested team structures to Excel by offloading the transformation to a highly optimized SQL view.

# Resume Description
Architected a highly scalable festival registration platform using Next.js and Supabase for a 1000+ attendee college event. Implemented a hybrid payment coordination system, automated PDF ticket generation with QR codes, and integrated Brevo for transactional emails. Engineered a secure, role-based admin dashboard featuring database-level rate limiting and advanced PostgreSQL JSONB querying for operational analytics.

# Interview Explanation
"For the Manthan 2026 festival, I developed a full-stack Next.js application to handle end-to-end event registrations. The biggest challenge was managing diverse requirements—from solo technical events to large sports teams—so I designed a flexible PostgreSQL schema utilizing JSONB arrays, optimized with GIN indexes. To handle the financial side, I built a hybrid payment flow that supports both Razorpay webhooks and manual WhatsApp coordination, logging everything into an immutable ledger. I also automated the ticketing process by generating branded PDFs with QR codes and sending them via Brevo. Finally, I secured the entire system using Supabase Row Level Security and custom database-backed rate limiting to protect against unauthorized access and API abuse."

# Complexity
Advanced / Industry level
