# Manthan 2026 - Festival of Ancient Wisdom

Manthan 2026 is a comprehensive tech-fest management platform designed for BVIMIT. It handles event discovery, multi-event registrations, secure payments, and automated entry-pass generation for technical, cultural, and sports events.

## Core Features

- **Event Catalog**: Dynamic listing of Technical (AI Website Building, Typing, Quiz, Canva), Cultural (Dance, Singing), and Sports (Badminton, Cricket, Volleyball, etc.) events.
- **Registration System**: Support for solo and team-based registrations with server-side fee validation.
- **Payment Integration**: Secure Razorpay integration for order creation and signature verification.
- **Automated Ticketing**: Real-time generation of digital entry passes with unique QR codes for venue validation.
- **Email Notifications**: Transactional emails sent via Brevo (formerly Sendinblue) with PDF ticket attachments.
- **Admin Dashboard**: Centralized management for registrations, attendance check-ins, live statistics, and manual cash payment marking.
- **Data Export**: Specialized CSV export functionality for sharing registration data with faculty and committees.
- **PDF Generation**: High-quality, branded PDF entry passes generated server-side using jsPDF.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Backend/Database**: Supabase (PostgreSQL), Next.js API Routes.
- **Payments**: Razorpay Node.js SDK.
- **Email & PDF**: Brevo API, jsPDF, QRCode.js.
- **Validation**: Zod (Schema validation), Rate-limiting for API protection.

## Project Structure

```text
src/
├── app/            # Next.js App Router (Pages and API Routes)
├── components/     # UI Components (Client-side and Server-side)
├── lib/            # Shared logic, Constants, and Database clients
│   ├── supabase/   # Supabase client and database schema
│   ├── mail-service.ts # Brevo integration and PDF generation
│   ├── constants.ts    # Global configurations and schedule
│   └── events-catalog.ts # Source of truth for all festival events
├── scripts/        # Database maintenance and admin setup scripts
└── public/         # Static assets and branding
```

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Brevo (Email) Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME="Manthan 2k26 Team"

# Admin Access
ADMIN_PASSWORD=your_dashboard_password
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Database Setup

The database is hosted on Supabase. To initialize or update the schema:

1. Execute `src/lib/supabase/schema.sql` in the Supabase SQL Editor to create base tables and RLS policies.
2. Execute `update_schema.sql` to apply the latest optimizations, views, and indexes.
3. Relevant views like `organized_event_registrations_export` are used for flat-file CSV exports.

## Core API Endpoints

### Public Endpoints
- `GET /api/events`: Retrieve all active events.
- `POST /api/payment/create-order`: Initialize Razorpay order.
- `POST /api/payment/verify`: Verify payment signature and trigger ticket generation.
- `GET /api/registration/[ticketId]`: Retrieve validated pass details.

### Admin Endpoints
- `POST /api/admin/login`: Secure dashboard access.
- `GET /api/admin/registrations`: List all attendee data.
- `POST /api/admin/check-in/[id]`: Mark attendee presence.
- `GET /api/admin/stats`: Aggregate registration and collection statistics.
- `GET /api/admin/export`: Generate CSV for faculty records.

## Deployment

The project is optimized for deployment on Vercel. Ensure all environment variables are mapped in the Vercel dashboard and that the Supabase instance is accessible.

Build and Lint checks should be performed before every merge:
```bash
npm run lint
npm run build
```

---
Official platform for Manthan 2026. Designed and Developed for BVIMIT Navi Mumbai.
