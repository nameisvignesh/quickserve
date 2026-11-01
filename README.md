# QuickServe

QuickServe is a full-stack home-services marketplace inspired by the booking workflow of modern managed-service platforms. Customers can discover detailed service variants, choose a time and address, pay with a Google Pay/UPI QR or Razorpay test checkout, receive a ticket only after payment confirmation, track bookings, and cancel eligible appointments. It uses original QuickServe branding and assets.

## Run locally

Requirements: Node.js 20+.

```powershell
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:5000`.

The server starts in local SQLite mode when MongoDB is not installed or is unavailable. Customer and employee account records, password hashes, phone verification state and OTP state are stored in the SQL database at `server/data/quickserve.sqlite` by default. Set `SQLITE_PATH` to choose another SQLite file. Bookings and the catalogue still switch to MongoDB automatically when a reachable `MONGODB_URI` is provided.

Routes:

- `/` — customer marketplace, service options, Clerk sign-in/sign-up with email or SMS OTP, UPI QR checkout, reviews, About and dark mode.
- `/admin` — owner-only operations dashboard. The default local owner is `admin2026@gmail.com` / `quickserveadmin2026`; set `OWNER_EMAIL` and `OWNER_PASSWORD` in `server/.env` before deployment.
- `/admin/employees` — owner-only employee directory with profile photos and assigned-ticket status.
- `/employee` — Clerk employee sign-in/sign-up, photo and signature onboarding, ticket queue, customer contact details, map navigation and ticket acceptance.

## Optional persistent setup

Copy `server/.env.example` to `server/.env`, set a long `JWT_SECRET`, and provide a local MongoDB or MongoDB Atlas URI:

```powershell
npm run seed --prefix server
```

If MongoDB is available, the API also seeds the default catalogue automatically on startup. SQLite is created automatically; no database server is required for local development.

## Clerk authentication

Copy `client/.env.example` and `server/.env.example` into the corresponding `.env` files. Set the same Clerk application keys in `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, then enable the email and phone/SMS verification methods in the Clerk Dashboard. The frontend uses Clerk components for the user session and OTP verification; the API verifies Clerk bearer tokens before syncing the local customer or employee record. Without a publishable key, the local fallback authentication remains available with the explicitly labelled development-only OTP mode.

For real SMS, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_FROM_NUMBER`. For local development without an SMS provider, `LOCAL_OTP_MODE=true` uses the configured `LOCAL_OTP_CODE` (default `123456`) and labels it as development-only. Set `LOCAL_OTP_MODE=false` in any shared or production environment; then phone verification is rejected until a real SMS provider is configured.

## Payments

Without Razorpay credentials, checkout generates a Google Pay/UPI URI and QR code using `QUICKSERVE_UPI_ID`. The browser polls payment status; in local demo mode the “Simulate successful scan” action exercises the same confirmation path. For real automatic confirmation, configure a UPI/Razorpay provider to call `/api/payments/upi/webhook` with `UPI_WEBHOOK_SECRET`. The server then creates the ticket and emits the booking update. For Razorpay test checkout, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the server only. The server verifies the Razorpay signature before confirming a booking.

## Admin

Admin endpoints require the exact configured owner email and an `admin` role. Employee endpoints require the `employee` role and a stored photo confirmation. Only paid, confirmed customer bookings become tickets; the admin and employee roadmaps then move them through assigned, arrived, in-progress and completed states.

## Production checklist

Configure a production client API URL, HTTPS, rate limiting, OTP/email verification, refund and payment webhooks, provider onboarding, service-area rules, monitoring, privacy/terms pages, and a security review before taking live bookings.
