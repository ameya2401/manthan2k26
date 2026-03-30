# Manthan 2026 Platform

Production-ready festival registration platform for BVIMIT Manthan 2026.

It supports event discovery, registration, payment coordination via WhatsApp, QR-enabled pass generation, email delivery, and organizer operations through a secure admin dashboard.

## What This Application Does

- Serves a public event catalog for technical, cultural, and sports events.
- Handles participant registration for single or multiple events.
- Creates a ticket immediately with payment status tracking.
- Coordinates payment flow using WhatsApp-first handoff.
- Supports legacy Razorpay verification and webhook processing.
- Generates branded ticket PDFs and sends transactional emails via Brevo.
- Provides admin workflows for login, registrations, check-in, stats, and exports.

## Tech Stack

- Framework: Next.js 14 (App Router) + React 18 + TypeScript.
- Styling/UI: Tailwind CSS, Framer Motion, Lucide React.
- Data: Supabase (PostgreSQL + Auth).
- Validation and safety: Zod + custom rate limiting.
- Communications: Brevo API (email), WhatsApp handoff, optional Razorpay compatibility endpoints.

## Project Layout

```text
.
├── src/
│   ├── app/                    # App Router pages and API routes
│   ├── components/             # Shared UI components
│   ├── lib/                    # Domain logic, types, constants, integrations
│   │   └── supabase/           # Supabase client/server helpers + SQL schema
│   └── middleware.ts           # Security headers and request guards
├── scripts/                    # Operational and maintenance scripts
├── public/                     # Static assets (fonts, profile, media)
├── update_schema.sql           # Schema updates and optimizations
├── add_viewer_role.sql         # Role extension SQL for viewer account
└── vercel.json                 # Deployment configuration
```

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended).
- npm 9+.
- A Supabase project with SQL editor access.
- Brevo account/API key for email sending.
- Optional Razorpay credentials if using verify/webhook compatibility paths.

## Environment Setup

1. Copy environment template:

```bash
cp .env.example .env.local
```

2. Fill all required values in `.env.local`.

### Environment Variables

Required core variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_PAYMENT_NUMBER`
- `WHATSAPP_COORDINATOR_NAME`
- `NEXT_PUBLIC_BASE_URL`

Required for ticket email delivery:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`

Optional legacy Razorpay compatibility:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Optional UX helper:

- `NEXT_PUBLIC_WHATSAPP_PAYMENT_NUMBER`

## Local Development

Install and run:

```bash
npm install
npm run dev
```

Run quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Database Bootstrapping

Execute SQL in Supabase SQL editor in this order:

1. `src/lib/supabase/schema.sql`
2. `update_schema.sql`
3. `add_viewer_role.sql` (only if using viewer role flow)

## NPM Scripts

- `npm run dev`: start local dev server.
- `npm run build`: create production build.
- `npm run start`: start built app.
- `npm run lint`: run ESLint.
- `npm run typecheck`: run TypeScript checks.
- `npm run check`: lint + typecheck + build.
- `npm run ops:cleanup-db`: delete operational data (use carefully).
- `npm run ops:verify-cleanup`: verify cleanup results.
- `npm run ops:reconcile`: reconcile pending payments with Razorpay.
- `npm run ops:setup-admin`: create/update admin user from env values.
- `npm run ops:setup-viewer`: create/update viewer user from env values.
- `npm run ops:force-viewer-reset`: force reset viewer credentials from env values.
- `npm run ops:simulate-webhook`: send a test webhook to configured server.

## API Surface (High-Level)

Public routes:

- `GET /api/events`
- `POST /api/payment/create-order`
- `POST /api/payment/verify`
- `GET /api/payment/whatsapp-config`
- `GET /api/registration/[ticketId]`

Admin routes:

- `POST /api/admin/login`
- `GET /api/admin/registrations`
- `POST /api/admin/check-in/[id]`
- `GET /api/admin/stats`
- `GET /api/admin/export`
- `POST /api/admin/cash-payment`
- `POST /api/admin/cash-payment/manual`
- `GET /api/admin/cash-payment/export`

## Deployment (Vercel)

This repository is configured for Vercel (`vercel.json`).

Checklist before deploy:

1. Configure all production environment variables in Vercel.
2. Ensure Supabase network and keys are correct for production.
3. Run `npm run check` locally or in CI.
4. Verify `/api/payment/webhook` receives valid `x-razorpay-signature` if webhook mode is enabled.

## Operational Notes

- Do not commit `.env.local` or secrets.
- Service role keys must only be used server-side.
- Keep utility scripts restricted to trusted operators.
- Prefer environment variables over hardcoded credentials for all admin scripts.

---
Official platform for BVIMIT Manthan 2026.
