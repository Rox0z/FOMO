# FOMO - Getting Started

This guide explains how to configure, run and test the FOMO project locally.

## Requirements

Install the following tools before running the project:

- Node.js 20 or newer
- npm
- PostgreSQL
- Git

Optional services:

- ImgBB API key, for real banner upload support
- Gmail app password, for email sending through Nodemailer

## Environment Setup

Create a backend environment file:

```bash
cd backend
cp .env.example .env
```

Example `.env` values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fomo"
JWT_SECRET="replace_with_a_strong_secret_with_at_least_32_chars"
JWT_EXPIRATION="24h"
PORT=3000
IMGBB_API_KEY="your_imgbb_api_key_here"
GMAIL_USER="your_gmail_address_here"
GMAIL_PASS="your_gmail_app_password_here"
```

Only `DATABASE_URL` and `JWT_SECRET` are required for the main local backend flow. Image upload and email delivery are optional integrations.

## Database Setup

Create a local PostgreSQL database named `fomo`, or update `DATABASE_URL` with the name you prefer.

Apply the Drizzle schema:

```bash
cd backend
npx drizzle-kit push
```

Seed the database with demo data:

```bash
npx tsx src/db/seed.ts
```

The seed creates:

- One administrator
- Multiple buyers
- Approved vendors
- A pending vendor
- Approved, pending and rejected events
- Historical orders
- Tickets
- Audit logs

All seeded accounts use this password:

```text
fomo2026
```

## Running the Project

### Option 1 - Startup scripts

Linux/macOS:

```bash
./start.sh
```

Windows:

```bat
start.bat
```

### Option 2 - Manual startup

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Backend URL:

```text
http://localhost:3000
```

Swagger API documentation:

```text
http://localhost:3000/api
```

Frontend:

```bash
cd frontend
npm install
npm run start
```

Frontend URL:

```text
http://localhost:4200
```

### Option 3 - Docker (full stack with one command)

This option runs PostgreSQL, the NestJS backend and the Angular frontend in isolated containers. No local Node.js or PostgreSQL installation is required.

**Prerequisites:**

- [Docker](https://docs.docker.com/get-docker/) 20 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) v2 (included with Docker Desktop)

**1. Configure the backend environment file**

The backend container reads from `backend/.env`. Create it from the example and update `DATABASE_URL` to point to the Postgres container:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set the following values (the credentials must match what is defined in `docker-compose.yml`):

```env
DATABASE_URL="postgresql://fomo:1234@postgres-db:5432/fomo"
JWT_SECRET="replace_with_a_strong_secret_with_at_least_32_chars"
JWT_EXPIRATION="24h"
PORT=3000
```

> **Why `postgres-db` as the host?** Inside Docker's network the backend reaches the database through the service name defined in `docker-compose.yml`, not `localhost`.

**2. Start all services**

From the project root (where `docker-compose.yml` lives):

```bash
docker-compose up --build
```

On first startup the backend container automatically:

1. Waits for PostgreSQL to be ready (health check).
2. Runs `npx drizzle-kit push` to apply the schema.
3. Runs `npx tsx src/db/seed.ts` to seed demo data.
4. Starts the NestJS server in development mode.

**3. Access the running services**

| Service | URL |
| --- | --- |
| Frontend (Angular) | http://localhost:4200 |
| Backend API (NestJS) | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api |
| PostgreSQL (external) | localhost:5433 |

**Stopping the stack**

```bash
docker-compose down
```

To also remove the database volume (deletes all data):

```bash
docker-compose down -v
```

**Rebuilding after code changes**

```bash
docker-compose up --build
```

**Troubleshooting Docker**

If the backend starts before PostgreSQL is ready, Docker Compose retries automatically thanks to the `depends_on` health check. If you still see connection errors, wait a few seconds and check the logs:

```bash
docker-compose logs backend
docker-compose logs postgres-db
```

## Demo Accounts

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Admin | admin@fomo.pt | fomo2026 | Platform administrator |
| Buyer | john@fomo.pt | fomo2026 | Active buyer |
| Buyer | maria@fomo.pt | fomo2026 | Active buyer |
| Buyer | blocked@fomo.pt | fomo2026 | Blocked account |
| Vendor | lx@fomo.pt | fomo2026 | Approved vendor |
| Vendor | algarve@fomo.pt | fomo2026 | Approved vendor |
| Vendor | coimbra@fomo.pt | fomo2026 | Pending vendor |

## Main User Flows

### Buyer flow

1. Open the frontend at `http://localhost:4200`.
2. Browse approved events.
3. Register or log in as a buyer.
4. Add an event to the cart.
5. Complete the simulated checkout.
6. Open the tickets page to view generated tickets.

### Vendor flow

1. Register as a vendor.
2. Wait for administrator approval.
3. Log in after approval.
4. Open the vendor dashboard.
5. Create events.
6. Request edits to existing events when needed.
7. Check event statistics.

### Admin flow

1. Log in as `admin@fomo.pt`.
2. Open the admin dashboard.
3. Approve or reject vendors.
4. Approve or reject events.
5. Manage users and review platform metrics.
6. Review event edit requests.

## Test Commands

### Backend unit tests

```bash
cd backend
npm run test
```

Expected result in the current project version:

```text
15 test suites passed, 54 tests passed
```

### Backend e2e tests

```bash
cd backend
npm run test:e2e
```

The e2e suite is located in `backend/test/` and covers:

- Health endpoints
- Authentication
- User routes
- Vendor routes
- Event routes
- Checkout
- Tickets
- Admin approvals and moderation routes

The e2e tests use mocked service dependencies so they can run quickly and consistently without requiring a live PostgreSQL database.

### Backend build

```bash
cd backend
npm run build
```

### Frontend build

```bash
cd frontend
npm run build
```

### Frontend tests

```bash
cd frontend
npm run test
```

## Troubleshooting

### Backend fails because `JWT_SECRET` is missing

Make sure `backend/.env` exists and includes:

```env
JWT_SECRET="replace_with_a_strong_secret_with_at_least_32_chars"
```

### Database connection fails

Check that PostgreSQL is running and that `DATABASE_URL` points to the correct database.

### Seed fails

Run the schema push first:

```bash
cd backend
npx drizzle-kit push
npx tsx src/db/seed.ts
```

### Emails are not sent

Email sending is optional. Configure `GMAIL_USER` and `GMAIL_PASS` with valid credentials if email delivery is required.

### Image upload fails

Image upload is optional. Configure `IMGBB_API_KEY` if real upload support is required.
