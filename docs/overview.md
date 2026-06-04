# FOMO - Project Overview

## Overview

FOMO is an academic ticket marketplace platform developed for **Laboratório de Engenharia de Software**. The system allows event promoters to publish events, buyers to reserve tickets, and administrators to supervise the platform.

The application is divided into a frontend, a backend API and a relational database. The current version uses a simulated checkout instead of real payment processing, which makes it possible to test the complete ticket purchase flow without external payment providers.

## Main Objectives

- Build a functional ticket marketplace platform.
- Support three roles: administrator, vendor and buyer.
- Allow buyers to discover events and reserve tickets.
- Allow vendors to create and manage events.
- Allow administrators to approve vendors and events.
- Generate orders and tickets through a simulated checkout.
- Generate unique QR codes for tickets.
- Maintain a clear separation between frontend, backend and database.
- Use JWT authentication and role-based access control.
- Store platform data in PostgreSQL through Drizzle ORM.

## Architecture

```text
Angular Frontend
      |
      | HTTP/REST
      v
NestJS Backend API
      |
      | Drizzle ORM
      v
PostgreSQL Database
```

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | Angular |
| Backend | NestJS |
| Runtime | Node.js |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | JWT + Passport |
| Validation | DTOs with class-validator |
| Security | Helmet, rate limiting and guards |
| Emails | Nodemailer/Gmail integration |
| QR Codes | qrcode package |
| Tests | Jest and Supertest |

## User Roles

### Buyer

Buyers can browse events, register, log in, complete a simulated checkout and view their tickets.

### Vendor

Vendors can register, wait for administrator approval, create events, view their own events, request event edits and consult basic statistics.

### Administrator

Administrators can view platform metrics, manage users, approve or reject vendors, approve or reject events and process event edit requests.

## Main Backend Modules

- `auth`: registration, login, JWT and authenticated profile.
- `users`: user profile and administrator user management.
- `vendors`: vendor profile management and vendor approval flow.
- `events`: public event listing, event creation, vendor events and event updates.
- `orders`: simulated checkout, order creation and ticket generation.
- `tickets`: authenticated ticket listing.
- `admin`: administrative overview and approval actions.
- `event-edits`: vendor edit requests and administrator review.
- `admin-logs`: audit logs for administrative actions.
- `services/emails`: order confirmation email support.
- `services/images`: event banner upload support.

## Database Entities

- `users`
- `vendor_profiles`
- `events`
- `orders`
- `order_items`
- `tickets`
- `event_edits`
- `audit_logs`

## Checkout Flow

The checkout is simulated in the backend. During checkout, the system:

1. Validates that the buyer exists and is active.
2. Validates that the cart has at least one item.
3. Aggregates repeated event items.
4. Confirms that each event exists.
5. Confirms that each event is approved.
6. Blocks duplicate purchases for the same buyer and event.
7. Checks event capacity.
8. Creates an order.
9. Creates order items.
10. Generates tickets with unique QR codes.
11. Updates the number of tickets sold.
12. Calculates service fees and the final total.
13. Attempts to send a confirmation email.

## Security Measures

- Password hashing with bcrypt.
- JWT authentication.
- Role-based guards.
- Vendor approval guard.
- Event owner guard.
- DTO validation.
- Helmet middleware.
- Rate limiting.
- Mandatory `JWT_SECRET` validation on backend startup.

## Testing Strategy

The project includes backend unit tests and backend e2e tests.

The e2e tests validate the HTTP API layer and cover:

- Health endpoints
- Authentication
- Users
- Vendors
- Events
- Orders and checkout
- Tickets
- Administrator routes

The e2e tests use mocked service dependencies. This approach keeps the tests deterministic, fast and independent from a local PostgreSQL instance while still validating routing, controllers, guards and request/response behavior.

## Current Limitations

- Real payment integration is not included.
- Checkout is simulated.
- Email delivery requires external Gmail credentials.
- Image upload requires an ImgBB API key.
- JWT storage in the frontend is acceptable for academic/development use, but HttpOnly cookies would be preferable in production.

## Future Improvements

- Stripe or another real payment provider.
- QR code validation at event entry.
- Password recovery.
- More advanced event search and filtering.
- Email notification templates.
- Cloud deployment.
- Full integration tests against a dedicated test database.
- Frontend e2e tests with Playwright or Cypress.
