# FOMO Frontend

Angular frontend for the FOMO ticket marketplace platform.

## Main Responsibilities

- Display approved events
- Show event details
- Register buyers and vendors
- Authenticate users
- Protect routes based on authentication and role
- Provide buyer cart and checkout screens
- Display generated tickets
- Provide vendor dashboard
- Provide administrator dashboard

## Tech Stack

- Angular
- TypeScript
- Angular Router
- Angular Forms
- RxJS
- Vitest / Angular test runner

## Installation

```bash
npm install
```

## Development Server

```bash
npm run start
```

Open:

```text
http://localhost:4200
```

The frontend expects the backend API to be running at:

```text
http://localhost:3000
```

## Main Routes

| Route | Description | Access |
| --- | --- | --- |
| `/home` | Public home page and event listing | Public |
| `/event/:id` | Event details | Public |
| `/login` | User login | Public |
| `/register-users` | Buyer registration | Public |
| `/register-vendors` | Vendor registration | Public |
| `/cart` | Cart page | Authenticated buyer |
| `/payment` | Simulated checkout page | Authenticated buyer |
| `/user/profile` | Buyer profile | Authenticated buyer |
| `/user/my-tickets` | Buyer tickets | Authenticated buyer |
| `/vendor-dashboard` | Vendor dashboard | Authenticated vendor |
| `/admin-dashboard` | Admin dashboard | Authenticated admin |

## Frontend Structure

```text
src/app/
├── admin-dashboard/      # Admin platform management UI
├── cart/                 # Buyer cart UI
├── event-details/        # Event detail page
├── home/                 # Public event listing
├── login/                # Login screen
├── navbar/               # Navigation component
├── payment/              # Simulated checkout UI
├── profile/              # User profile screen
├── register-users/       # Buyer registration
├── register-vendors/     # Vendor registration
├── services/             # Auth, guards, cart and toast services
├── tickets/              # Buyer tickets page
└── vendors-dashboard/    # Vendor dashboard
```

## Authentication and Authorization

The frontend uses route guards to restrict access by role:

- `AuthGuard`: requires an authenticated user.
- `RoleGuard`: checks allowed roles for protected routes.

The main supported roles are:

- `user`
- `vendor`
- `admin`

## Build

```bash
npm run build
```

## Tests

```bash
npm run test
```

## Notes

- Checkout is simulated by the backend and does not integrate real payments.
- QR codes are generated on the backend when tickets are created.
- The frontend should be used together with the seeded backend data for a complete demo.
- If backend endpoints are changed, update the relevant frontend services and route flows.


## Testing

Run the frontend tests in CI mode with:

```bash
npm run test:ci
```

Validated result: 12 spec files passed, 13 tests passed.
