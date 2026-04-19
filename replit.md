# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### paws-and-claws (web, port 23672, preview path /)
Full landing page + booking system for "Paws and Claws Grooming and Boarding of Jacksonville, INC."
- Landing page with hero, services, reviews (real verified), contact/map, footer
- `/book` — 3-step booking wizard (date/time → service → contact info)
- `/admin` — Admin PIN login (default PIN: `admin1234`)
- `/admin/dashboard` — Admin dashboard: view/manage bookings, settings

### api-server (port 8080)
Express REST API serving all booking and admin functionality.
- `GET /api/healthz` — health check
- `GET /api/bookings/availability?date=YYYY-MM-DD` — available time slots
- `POST /api/bookings` — create booking (public)
- `GET /api/bookings` — list bookings (admin)
- `PATCH /api/bookings/:id` — update status (admin)
- `DELETE /api/bookings/:id` — delete booking (admin)
- `GET /api/bookings/:id/ics` — download .ics calendar file (admin)
- `POST /api/admin/login` — authenticate with PIN, returns JWT
- `GET /api/admin/settings` — get booking settings (admin)
- `PUT /api/admin/settings` — update settings (admin)

## Database Tables

- `admin_settings`: maxConcurrentBookings (default 2), bufferMinutes (default 30), slotDurationMinutes (default 60), adminPinHash (bcrypt)
- `bookings`: customer info, pet info, service, date, time, status, notes

## Admin Settings

- **Default PIN**: `admin1234` (change in Settings tab after login)
- **Max concurrent bookings**: 2 (multiple bookings at same time slot allowed up to this limit)
- **Buffer time**: 30 minutes between different time slots
- **Slot duration**: 60 minutes per appointment
- JWT tokens expire after 8 hours

## Codegen Note

After running orval codegen, the `lib/api-zod/src/index.ts` file gets an incorrect auto-generated export for `./generated/api.schemas`. Always overwrite it with:
```
export * from "./generated/api";
```

See `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
