# GearUp API Documentation

This document provides a brief overview of the GearUp REST API endpoints. It is designed to be a quick reference for setting up Postman collections.

## Base URL
`http://localhost:5000/api` (or your configured `APP_URL`)

## Authentication

Most protected endpoints require an authentication token. You can authenticate by:
1. Logging in via `/api/auth/login` and using the returned `accessToken` as a Bearer token in the `Authorization` header.
2. The server will also look for an `accessToken` in the `httpOnly` cookies.

**Roles:** `CUSTOMER`, `PROVIDER`, `ADMIN`

---

## 1. Auth Module (`/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new user (`CUSTOMER` or `PROVIDER`). | No |
| **POST** | `/auth/login` | Login, sign tokens and set HTTP-only cookies. | No |
| **POST** | `/auth/refresh-token` | Validate refresh token cookie and issue new access token. | No |
| **POST** | `/auth/logout` | Clear auth cookies. | No |

---

## 2. User Module (`/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/users/me` | Get own profile. | Yes (Any) |
| **PATCH** | `/users/me` | Update own profile. | Yes (Any) |
| **GET** | `/users/:id` | Get public profile by ID. | No |

---

## 3. Provider Module (`/providers`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/providers` | Create provider profile. | Yes (`PROVIDER`) |
| **GET** | `/providers` | List approved providers. | No |
| **GET** | `/providers/:id` | Get provider details. | No |
| **PATCH** | `/providers/:id` | Update provider profile. | Yes (`PROVIDER`, `ADMIN`) |

---

## 4. Category Module (`/categories`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/categories` | Create category. | Yes (`ADMIN`) |
| **GET** | `/categories` | List all categories. | No |
| **PATCH** | `/categories/:id` | Update category. | Yes (`ADMIN`) |
| **DELETE**| `/categories/:id` | Delete category. | Yes (`ADMIN`) |

---

## 5. Gear Module (`/gears`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/gears` | Add equipment listing. | Yes (`PROVIDER`) |
| **GET** | `/gears` | Browse/search equipment with filters (category, price, status).| No |
| **GET** | `/gears/:id` | Get gear details. | No |
| **PATCH** | `/gears/:id` | Update listing. | Yes (`PROVIDER`, `ADMIN`) |
| **DELETE**| `/gears/:id` | Remove listing. | Yes (`PROVIDER`, `ADMIN`) |

---

## 6. Rental Module (`/rentals`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/rentals` | Create rental booking request. | Yes (`CUSTOMER`) |
| **GET** | `/rentals/my-rentals` | View personal rental history. | Yes (`CUSTOMER`) |
| **GET** | `/rentals/provider` | View incoming rental requests for owned gear. | Yes (`PROVIDER`) |
| **GET** | `/rentals/:id` | Get single rental detail. | Yes (Any) |
| **PATCH** | `/rentals/:id/cancel` | Cancel rental booking. | Yes (`CUSTOMER`) |
| **PATCH** | `/rentals/:id/status` | Approve/reject/complete rental. | Yes (`PROVIDER`, `ADMIN`) |

---

## 7. Payment Module (`/payments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/payments/initiate`| Create checkout session for approved rental. | Yes (`CUSTOMER`) |
| **POST** | `/payments/success` | Webhook/callback: Handle successful payment. | No |
| **POST** | `/payments/fail` | Webhook/callback: Handle failed payment. | No |
| **GET** | `/payments/my-payments`| View personal payment history. | Yes (`CUSTOMER`) |
| **GET** | `/payments/:rentalId`| View payment details for a rental. | Yes (Any) |

---

## 8. Review Module (`/reviews`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/reviews` | Leave review for a completed rental. | Yes (`CUSTOMER`) |
| **GET** | `/reviews/gear/:gearId`| View reviews for specific equipment. | No |
| **DELETE**| `/reviews/:id` | Remove review. | Yes (`CUSTOMER`, `ADMIN`) |

---

## 9. Admin Module (`/admin`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/admin/users` | List all users. | Yes (`ADMIN`) |
| **PATCH** | `/admin/users/:id/block`| Toggle block/unblock user status. | Yes (`ADMIN`) |
| **GET** | `/admin/providers` | List provider onboarding requests. | Yes (`ADMIN`) |
| **PATCH** | `/admin/providers/:id/approve`| Approve provider status. | Yes (`ADMIN`) |
| **GET** | `/admin/gears` | View platform-wide gear listings. | Yes (`ADMIN`) |
| **GET** | `/admin/rentals` | Platform-wide rental oversight. | Yes (`ADMIN`) |
| **GET** | `/admin/payments` | Platform-wide payment log. | Yes (`ADMIN`) |

---

## 10. Upload Module (`/upload`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/upload` | Upload an image. | Yes |

---

## 11. Settings Module (`/settings`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/settings` | Get application settings. | No/Yes |
| **PATCH** | `/settings` | Update application settings. | Yes (`ADMIN`) |

---

## How to use in Postman:

1. **Create a Collection:** Create a new collection named "GearUp API".
2. **Set Collection Variable:** Add a variable `baseUrl` with the value `http://localhost:5000/api`.
3. **Set Collection Variable for Auth:** Add a variable `accessToken` to store your JWT token.
4. **Create Requests:** Add requests for each of the endpoints above. Use `{{baseUrl}}/auth/login` format for the URL.
5. **Authorization Setup:** 
   - For protected routes, go to the "Authorization" tab in Postman.
   - Select "Bearer Token".
   - Set the Token value to `{{accessToken}}`.
6. **Body setup:** Set the request body type to `raw` -> `JSON` for POST/PATCH requests.
7. **Login Script (Optional):** You can automate token setting by adding this to the "Tests" tab of your Login request:
   ```javascript
   var jsonData = pm.response.json();
   pm.collectionVariables.set("accessToken", jsonData.data.accessToken);
   ```
