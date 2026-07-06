# 🏕️ GearUp API

A full-featured gear rental platform backend built with Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Stripe.

---

## 📐 Architecture Overview
- **Runtime**: Node.js (ESM)
- **Language**: TypeScript (strict mode)
- **Framework**: Express
- **ORM**: Prisma (multi-file schema)
- **Database**: PostgreSQL
- **Payments**: Stripe Checkout + Webhooks
- **Authentication**: JWT (Cookies + Bearer Token)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration
```bash
npx prisma migrate dev --name init
```

### 3. Start the Server
```bash
npm run dev
```
The server will start on port `5000` (or as configured in `.env`).

---

## 📁 Key Conventions
1. **Module Pattern**: Domain code is separated into self-contained modules (`/auth`, `/user`, `/gear`, `/rental`, etc.).
2. **catchAsync**: Centralized Promise wrapper for Express controllers.
3. **sendResponse**: Strict `{ success, statusCode, message, data }` JSON payload format.
4. **Singletons**: Stripe and Prisma clients are exported from `src/lib/`.
5. **Config Isolation**: `process.env` is only referenced in `src/config/index.ts`.
6. **Multi-file Schema**: Prisma schema is spread across `.prisma` files in `prisma/schema/`.
7. **Webhook Integrity**: `express.raw()` is securely mounted before `express.json()` for Stripe verification.
8. **Hybrid Authentication**: JWT access and refresh tokens via HTTP-only cookies with Bearer fallback.
9. **Role-based Guards**: The `auth(...roles)` middleware enforces privileges (`ADMIN`, `PROVIDER`, `CUSTOMER`).
10. **Action Gating**: Strict service-layer checks (e.g., verifying Provider approval, Rental ownership).

---

## 📊 API Overview

| Module | Base Route | Description |
|---|---|---|
| Auth | `/api/auth` | Registration, login, tokens, logout |
| Users | `/api/users` | User profiles |
| Providers | `/api/providers` | Provider profiles and onboarding |
| Categories | `/api/categories` | Admin category management |
| Gears | `/api/gears` | Gear listings and search |
| Rentals | `/api/rentals` | Booking and rental lifecycle |
| Payments | `/api/payments` | Stripe checkout and webhooks |
| Reviews | `/api/reviews` | Gear ratings and feedback |
| Admin | `/api/admin` | Platform oversight |

---

## 📦 Rental Flow

```
PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED
```
*Note: Cancellations are only allowed from the `PLACED` status.*

---

## 🧪 Postman Examples (JSON Payloads)

Here are examples of the data formats to use in the **Body (raw JSON)** tab in Postman when testing:

### 1. Register a User (`POST /api/auth/register`)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "01712345678",
  "role": "CUSTOMER" 
}
```
*(Valid roles: `CUSTOMER`, `PROVIDER`)*

### 2. Login (`POST /api/auth/login`)
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Add Gear Listing (`POST /api/gears`)
```json
{
  "name": "Mountain Bike - Trek 820",
  "description": "Premium mountain bike for trail riding",
  "image": "https://example.com/bike.jpg",
  "dailyRentalPrice": 25.00,
  "quantity": 3,
  "categoryId": "uuid-category-id-here"
}
```

### 4. Create Rental Booking (`POST /api/rentals`)
```json
{
  "gearId": "uuid-gear-id-here",
  "startDate": "2026-07-10",
  "endDate": "2026-07-15"
}
```

### 5. Update Rental Status (`PATCH /api/rentals/:id/status`)
```json
{
  "status": "CONFIRMED"
}
```
*(Valid statuses: `CONFIRMED`, `CANCELLED`, `PICKED_UP`, `RETURNED`)*

---

## 💳 Stripe Setup (Local)
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login and listen to webhooks:
```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/success
```
3. Use test cards (e.g., `4242 4242 4242 4242`) for checkout.
