# QuickServe — On-Demand Home Services Platform

A high-performance React + TypeScript web application built with Vite, styled with modern responsive UI matching the QuickServe design language.

## Key Features

### 1. Customer Experience & Sub-Services Explorer
- **Main Services Catalog**: Comprehensive coverage for Home Cleaning, AC Service, TV & Home Theater Installation, Appliance Repair, Electrician Visits, Plumbing, and Carpentry.
- **Nested Sub-Services Explorer**: Clicking any main service opens the full sub-services viewer (referencing the demo workflow), detailing pricing in ₹, duration, inclusions, and multi-selection carting.
- **Interactive Booking Drawer**: Select dates (Today, Tomorrow, Custom), time slots (8:00 AM – 8:00 PM), Indian address, area, and 6-digit pincode with GPS geolocator.
- **Live Ticket Generation**: Generates unique alphanumeric tickets (e.g. `clnh***********88`) with one-click copy.
- **My Bookings Page**: Real-time status tracking (`confirmed`, `assigned`, `in_progress`, `completed`, `cancelled`).

### 2. Service Professional / Employee Portal (`/employee`)
- **Employee Registration**: Register with Name, Email, Indian Mobile Number (`+91` 10 digits validation), and Trade Skills.
- **Admin Verification Gate**: Newly registered employees are assigned `pending_verification` status. Service requests by users remain locked until approved by the administrator in the Admin Portal.
- **Verified Pro Dashboard**:
  - View all user requested services with customer address, area, slot, and items.
  - "Accept Service Request / Self-Assign".
  - Change status from `assigned` to `in_progress` and `completed`.
  - Earnings, ratings, and job history.

### 3. Administrator Console (`/admin`)
- Accessible at `/admin` (or `http://localhost:5173/admin`).
- **Employee Verification Queue**: Review registered professionals, their Indian contact details and trade skills, with 1-click **Verify & Approve** or **Reject**.
- **Bookings & Dispatch Board**: Full view of all tickets, status updates, and assignment to verified experts.
- **Services Management**: View all services and nested sub-services.
- **SQL Database Console**: Interactive query executor and log showing relational SQL operations (No MongoDB).

### 4. Architecture & Data Storage
- **Relational SQL Database Engine**: Pure relational SQL schema with tables (`users`, `employees`, `services`, `sub_services`, `bookings`, `booking_items`).
- **Authentication**: Clerk authentication integration with role-based sessions for Customers, Verified Employees, and Administrators.
- **Zero MongoDB Dependency**: All relational data is managed via SQL queries with local storage persistence and SQL query history.

## Development

```bash
# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

## Contributors

Thanks to the contributors who have helped build and improve QuickServe:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/nameisvignesh">
        <img src="https://github.com/nameisvignesh.png?size=100" width="100px;" alt="Vignesh Kumaran"/><br />
        <sub><b>Vignesh Kumaran</b></sub>
      </a><br />
      <sub>Project Creator & Maintainer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/claude">
        <img src="https://avatars.githubusercontent.com/u/153406246?s=200&v=4" width="100px;" alt="Claude"/><br />
        <sub><b>Claude</b></sub>
      </a><br />
      <sub>Code Architecture & React Engineering</sub>
    </td>
  </tr>
</table>

### Contribution Details
- **Vignesh Kumaran** ([@nameisvignesh](https://github.com/nameisvignesh)) — Original concept, product requirements, and maintainer.
- **Claude** ([@claude](https://github.com/claude)) — Full-stack React + TypeScript rewrite, nested sub-services catalog, Employee verification portal, Admin control board, and Relational SQL data engine.

