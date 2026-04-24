# Get Plot Application Functional Guide

## Purpose

This document explains the application at a practical level: what it does, how it works end-to-end, and which features/functions power the core user experience.

It complements the deeper architecture documents by focusing on implementation flow and operational behavior.

---

## 1) What the application does

Get Plot is a land sales and reservation platform where users can:

- View land plots on map-driven pages
- Check plot details and status (available, reserved, sold, on-hold)
- Reserve or buy a plot
- Express interest in a plot
- Receive notifications (email/SMS) for key events
- Manage user account/profile and related activity

The system has:
- A Next.js application layer (`app/`) including client routes and API routes
- A microservices API layer (`API/services/`) routed through `API/gateway/`

---

## 2) High-level architecture

### Frontend/Application Layer
- Built with Next.js App Router
- Uses client-side map rendering (Google Maps + polygon overlays)
- Uses Supabase for several data operations in route-level features
- Uses Clerk for authentication state in UI components
- Uses local state/store for cart and interaction features

### Backend/API Layer
- Express microservices in `API/services/`:
  - `auth-service`
  - `properties-service`
  - `plots-service`
  - `transactions-service`
  - `users-service`
  - `notifications-service`
- API gateway in `API/gateway/` for request routing, auth middleware, and protection layers
- Shared utilities in `API/shared/` for common response, error, crypto, and DB logic

---

## 3) Key user journeys and how they work

### A. Browse and inspect plots
1. User opens a location route (example: `app/(routes)/new-trabuom/page.jsx`).
2. Map bounds are tracked in component state.
3. `fetchPolygons()` loads candidate plot records (Supabase), then filters visible polygons to current map bounds.
4. Polygons are rendered and color-coded by status.
5. Clicking a polygon opens an info card with context-aware actions.

### B. Express interest
1. User clicks "Express Interest" from plot info.
2. `ExpressInterestDialog` opens with selected plot id.
3. API route `app/api/properties/notify-interest/route.js` can dispatch email notifications for follow-up.

### C. Reserve / buy flow
1. User selects "Reserve Plot" or "Buy Plot" from plot UI action.
2. Route-based pages under `app/(routes)/new-trabuom/reserve-plot/[id]/` and `buy-plot/[id]/` handle UX and loading states.
3. Next.js API routes (`app/api/reserve-plot/route.js`, `app/api/buy-plot/route.js`, `app/api/checkout-plot/route.js`) coordinate backend operations.
4. Transactions service routes (`API/services/transactions-service/src/routes/transactions.routes.js`) handle reserve/buy/verify/get operations.

### D. Admin operations
- Price and status changes are available to authorized users in plot actions.
- Supporting routes include:
  - `app/api/admin/update-user/route.js`
  - `app/api/edit-user-role/route.js`
  - `app/api/admin/send-email/route.js`
  - `app/api/admin/send-bulk-emails/route.js`

---

## 4) Feature inventory

### Core platform features
- Authentication and token flows
- Property listing and geospatial search
- Plot detail and status lifecycle
- Transaction creation and payment verification
- Notifications (email + SMS)
- User profile/preferences/saved-properties/activity

### Map and interaction features
- Polygon rendering with bounded filtering
- Fullscreen and map type switching
- Fit-to-parcels action
- Plot action panel (buy/reserve/edit/interest/add-to-cart)
- Local countdown UX for launch/availability messaging

### Operational features
- Health and readiness checks
- Centralized error/response helpers
- Rate-limiting and auth middleware
- Test coverage across unit/integration/e2e directories

---

## 5) Main API routes (application side)

The Next.js app exposes application-oriented route handlers under `app/api/`:

- `POST /api/get-user`
- `POST /api/interested-clients`
- `POST /api/buy-plot`
- `POST /api/reserve-plot`
- `POST /api/checkout-plot`
- `POST /api/properties/notify-interest`
- `POST /api/send-email`
- `POST /api/send-sms`
- `POST /api/receive-email`
- `GET /api/users`
- `GET /api/approval-status`
- Admin endpoints under `/api/admin/*`

Use these when documenting frontend-to-backend interactions in this repository.

---

## 6) Main API routes (microservice side)

### Auth service
From `API/services/auth-service/src/routes/auth.routes.js`:
- `POST /register`
- `POST /login`
- `POST /social/login`
- `POST /refresh`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /verify-email`
- `POST /logout`
- `GET /me`

### Properties service
From `API/services/properties-service/src/routes/properties.routes.js`:
- `GET /`
- `GET /stats`
- `GET /location/:location`
- `POST /search`
- `GET /:id`
- `PUT /:id/status`

### Plots service
From `API/services/plots-service/src/routes/plots.routes.js`:
- `GET /plots`
- `GET /plots/stats`
- `GET /plots/location/:location`
- `GET /plots/:id`

### Transactions service
From `API/services/transactions-service/src/routes/transactions.routes.js`:
- `POST /reserve`
- `POST /buy`
- `POST /:id/verify`
- `GET /user/:userId`
- `GET /:id`

### Users service
From `API/services/users-service/src/routes/users.routes.js`:
- `GET /profile`
- `PUT /profile`
- `GET /preferences`
- `PUT /preferences`
- `GET /saved-properties`
- `POST /saved-properties/:propertyId`
- `DELETE /saved-properties/:propertyId`
- `GET /activity`

### Notifications service
From `API/services/notifications-service/src/routes/notifications.routes.js`:
- `POST /email`
- `POST /sms`
- `POST /bulk-sms`

---

## 7) Important functions and utilities

### Frontend route functions (`app/(routes)/new-trabuom/page.jsx`)
- `formatCountdown(msLeft)`: derives day/hour/minute/second segments for launch timer UI.
- `toggleFullscreen()`: switches map container in/out of fullscreen.
- `changeMapType(type)`: applies map type and closes map type menu state.
- `fitBoundsToAllParcels()`: computes bounds from polygon coordinates and fits map viewport.
- `handleMapLoad(mapInstance)`: stores map refs and initializes bounds/control behavior.
- `handleBoundsChanged()`: refreshes viewport bounds used for polygon filtering.
- `handleInfo(...)`: builds per-plot action card and wires action buttons/events.
- `handleSaveNewStatus()`: updates selected plot status in Supabase for authorized flows.

### Shared map actions (`app/(routes)/new-trabuom/actions/`)
- `calculateBoundingBox(polygon)`: gets min/max lat/lng for a polygon.
- `isPolygonInBounds(polygonBounds, mapBounds)`: boolean overlap check.
- `fetchPolygons(bounds, setPolygons, setLoading)`: reads records, filters by bounds, updates UI state.

### Shared backend utilities (`API/shared/utils/`)
- `errors.js`: custom error helpers/classes
- `response.js`: standardized API response shaping
- `bcrypt.js`: password hashing support
- `validators.js`: request payload validation helpers
- `loadEnv.js`: service environment loading
- `logger.js`: logging utility

---

## 8) Data and status model (practical)

Typical plot statuses observed in application behavior:
- `Available`
- `Reserved`
- `Sold`
- `On Hold`

Status drives visible actions:
- Available: buy/reserve/add-to-cart/interest
- Reserved/Sold/On Hold: restricted action set
- Admin/system roles can access edit/status actions

---

## 9) How to extend safely

When adding a new feature:
1. Add/adjust route page under `app/(routes)/...`
2. Add API handler under `app/api/...` if app-level integration is needed
3. Add/extend microservice route/controller if backend domain logic is required
4. Reuse shared helpers in `API/shared/` for consistency
5. Add loading and error states for UX parity
6. Add/update unit/integration tests in affected service
7. Update this guide and the API docs index

---

## 10) Recommended reading order

1. `API/README.md`
2. `API/docs/APPLICATION_FUNCTIONAL_GUIDE.md` (this file)
3. `API/docs/ARCHITECTURE.md`
4. `API/docs/Infrastructure.md`
5. Service-specific route/controller files under `API/services/*/src/`

---

**Owner:** Engineering Team  
**Scope:** Application behavior + feature/function reference  
**Last reviewed:** 2026-04-23
