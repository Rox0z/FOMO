# FOMO Backend

NestJS REST API for the FOMO ticket marketplace platform.

## Main Responsibilities

- User registration and authentication
- JWT token generation and validation
- Buyer, vendor and administrator role handling
- Vendor approval flow
- Event creation and approval flow
- Event edit requests
- Simulated checkout
- Order and ticket generation
- QR code generation for tickets
- Administrative actions and audit logs
- Optional order confirmation emails
- Optional image upload for event banners

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Drizzle ORM
- Passport JWT
- bcryptjs
- class-validator
- Swagger
- Jest
- Supertest

## Environment Variables

Create a `.env` file in the backend directory. You can start from `.env.example`.

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fomo"
JWT_SECRET="replace_with_a_strong_secret_with_at_least_32_chars"
JWT_EXPIRATION="24h"
PORT=3000
IMGBB_API_KEY="your_imgbb_api_key_here"
GMAIL_USER="your_gmail_address_here"
GMAIL_PASS="your_gmail_app_password_here"
```

Required for local core functionality:

- `DATABASE_URL`
- `JWT_SECRET`

Optional integrations:

- `IMGBB_API_KEY`
- `GMAIL_USER`
- `GMAIL_PASS`

## Installation

```bash
npm install
```

## Database

Apply the current schema to PostgreSQL:

```bash
npx drizzle-kit push
```

Seed the database:

```bash
npx tsx src/db/seed.ts
```

The seed creates demo users, vendors, events, orders, tickets and audit logs.

## Running the API

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

API URL:

```text
http://localhost:3000
```

Swagger documentation:

```text
http://localhost:3000/api
```

## Main Endpoints

### Health

- `GET /api/health`
- `GET /api/db-health`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`

### Users

- `GET /users/me`
- `PATCH /users/me`
- `GET /users`
- `GET /users/:id`
- `DELETE /users/:id`

### Vendors

- `GET /vendors`
- `GET /vendors/me`
- `GET /vendors/:id`
- `PATCH /vendors/me`
- `DELETE /vendors/:id`

### Events

- `GET /events`
- `GET /events/:id`
- `GET /events/my-events`
- `GET /events/my-stats`
- `POST /events`
- `PUT /events/:id/request-edit`
- `PATCH /events/:id`
- `DELETE /events/:id`

### Orders and Tickets

- `POST /orders/checkout`
- `GET /tickets/me`

### Admin

- `GET /admin/overview`
- `GET /admin/requests`
- `PATCH /admin/vendors/:id/approve`
- `PATCH /admin/vendors/:id/reject`
- `PATCH /admin/users/:id/ban`
- `PATCH /admin/users/:id/unban`
- `PATCH /admin/events/:id/approve`
- `PATCH /admin/events/:id/reject`
- `PATCH /admin/events/edits/:editId/approve`
- `PATCH /admin/events/edits/:editId/reject`

## Tests

### Unit tests

```bash
npm run test
```

Current expected result:

```text
15 test suites passed, 54 tests passed
```

### E2E tests

```bash
npm run test:e2e
```

The e2e tests are located in `test/` and cover the HTTP layer for:

- Health endpoints
- Authentication
- Users
- Vendors
- Events
- Orders
- Tickets
- Admin moderation endpoints

The e2e tests use mocked service dependencies to avoid requiring a local PostgreSQL instance during automated API route validation.

### Build validation

```bash
npm run build
```

## Notes

- Real payments are not implemented in this version.
- Checkout is simulated by `OrdersService`.
- Tickets are generated with unique QR codes.
- Email sending is intentionally non-blocking: if email delivery fails, the checkout result is still returned.
- For production, storing JWTs in HttpOnly cookies would be safer than frontend local storage.
