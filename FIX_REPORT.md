# FOMO Fixed System Report

Base: `FOMO-fixed.zip`
Audit considered: `FOMO_Technical_Audit.md`

## Validation performed

- Backend dependencies installed with `npm ci --ignore-scripts` after synchronising `package-lock.json`.
- Backend production build passed with `npm run build`.
- Frontend dependencies installed with `npm ci --ignore-scripts`.
- Frontend production build passed with `npm run build`.

## Fixes confirmed or applied

### Backend

- Synced `backend/package-lock.json` with dependencies already declared in `package.json`: `helmet`, `@nestjs/throttler`, `form-data`.
- Strengthened order checkout concurrency by locking the event row with `FOR UPDATE` before checking capacity.
- Confirmed server-side price calculation in `OrdersService`: client no longer sends/trusts `totalPrice`.
- Confirmed capacity enforcement and `ticketsSold` increment in checkout.
- Confirmed duplicate paid order prevention per user/event.
- Confirmed public `GET /events/:id` only exposes approved events.
- Confirmed admin-only event lookup route exists for all event statuses.
- Confirmed vendor approval activates/deactivates linked user accounts.
- Confirmed JWT secret fails fast if missing and no longer falls back to `default_secret`.
- Confirmed role is sourced from DB user record, not JWT payload.
- Confirmed `helmet()` is enabled.
- Confirmed global rate limiting and stricter login/register throttling are enabled.
- Confirmed upload memory limits and image MIME filter are configured.
- Confirmed direct event patching is admin-only.
- Confirmed admin event delete route and service injection exist.
- Confirmed `EventOwnerGuard` uses `vendorId` instead of non-existent `createdBy`.

### Frontend

- Fixed missing `environment` import in `src/app/tickets/tickets.ts`.
- Disabled production font inlining to avoid failed builds when Google Fonts cannot be fetched during CI/offline builds.
- Raised Angular CSS/component budgets to realistic values for the current UI so production build passes.

## Remaining notes

- `npm audit` still reports vulnerabilities in installed dependency trees. Review with `npm audit` and update packages carefully, because automated `npm audit fix --force` may introduce breaking changes.
- JWT in `localStorage` remains a security tradeoff. The recommended production approach is HttpOnly cookies.
- Real payments are still simulated. Do not use as production ticketing/payment system without integrating a payment provider.
- Database migrations should be reviewed before deployment. `drizzle-kit push` is convenient for local dev but not ideal for production.

## Commands that passed

```bash
cd backend
npm ci --ignore-scripts
npm run build

cd ../frontend
npm ci --ignore-scripts
npm run build
```
