<<<<<<< HEAD
# QuickServe — Multi-Service Booking Platform

A full-stack MCA project starter with original QuickServe branding. It is inspired by the *type of workflow* used by service-booking platforms, but does not copy Urban Company's logo, exact design, or proprietary assets. Spa & Massage is excluded.

## Included
- React + Vite responsive frontend
- Node.js + Express API
- MongoDB persistence (Mongoose)
- JWT customer/admin authentication
- Service catalogue, location/pincode search, booking creation and booking history
- Admin booking/service dashboard endpoints
- Razorpay checkout integration hooks (test mode)
- Socket.IO booking-status event foundation
- Server-side price calculation and payment verification endpoint

## Requirements
Install Node.js 20+ and MongoDB (local MongoDB Community Server or MongoDB Atlas account).

## Setup
1. Extract the ZIP to a folder such as `C:\\QuickServe`.
2. Install dependencies from the QuickServe folder:
   ```bash
   npm install
   npm run install:all
   ```
3. Copy `server/.env.example` to `server/.env` and fill in your MongoDB URI and JWT secret.
4. Optional payment setup: create a Razorpay account, use **test keys** first, and add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `server/.env`. Never put the secret key in the React client.
5. Seed demo services:
   ```bash
   npm run seed --prefix server
   ```
6. Start both apps:
   ```bash
   npm run dev
   ```
7. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

API runs on `http://localhost:5000`.

## Demo admin
Create a normal account in the UI. To grant admin access for local development, register a user and set that user's `role` to `admin` in MongoDB. Do not expose this method in a production deployment.

## Payments
- Without Razorpay credentials, the app stays in demo checkout mode and clearly labels payment as a demo; it does **not** collect real money.
- With Razorpay test credentials, the checkout flow uses Razorpay test mode and the server verifies the signature.
- Real payments require an approved Razorpay account, live keys, and production deployment over HTTPS. Never commit `.env`.
- A payment success page alone is not proof of payment; the server verification endpoint is required.

## Notes
- Browser geolocation requires user permission and generally works on localhost or HTTPS. Manual city/pincode entry is also available.
- This is a project starter/MVP, not a production-audited marketplace. Before public launch, add rate limiting, email/SMS OTP, stronger admin provisioning, refunds/webhooks, privacy/terms pages, monitoring, and security review.
=======
# QuickServe

QuickServe is a responsive, dependency-light front-end prototype for a real-time home services marketplace.

Included service flows:

- Home cleaning
- AC service
- TV installation
- Appliance repair

## Run locally

From this folder, serve the files with any static server. For example:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

The booking drawer, full-page booking workspace, search, service filters, fresh device-GPS/manual location flow, custom date/time pickers, local sign-in/sign-up, persisted bookings, and copyable ticket confirmation are implemented in plain JavaScript. GPS is requested only after the user clicks the location action, uses a fresh high-accuracy reading, and does not silently restore an old GPS fix. The visual illustrations are CSS-built, so there are no image assets or build step required.
>>>>>>> 1f1af8b10216ae37f3a3cf0d30695c739b4fdc84
