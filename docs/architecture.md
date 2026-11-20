# Origo: System Architecture

Origo is a pharmaceutical traceability and anti-counterfeit platform. Every medicine pack gets a signed digital identity. Supply-chain participants record each handover, and anyone can scan a pack to verify it.

This document covers the architecture for the MVP (Phases 1 to 5 in [phases.md](../phases.md)).

---

## 1. Goals and non-goals

**Goals**

- Production-grade MVP: real auth, real database constraints, monitoring, deployed and publicly usable.
- A codebase structured to scale: clear module boundaries, typed end to end, no shortcuts that would need a rewrite later.
- A production-grade UI that looks designed, not generated (see section 10).
- Tamper-evident history without a blockchain.
- QR codes that can't be guessed or forged, plus detection of cloned codes.

**Out of scope by choice:** CI/CD pipelines and automated test suites. Deployment is scripted instead (see section 11).

**Non-goals (for the MVP)**

- Blockchain, ZKP, NFC, IoT and AI anomaly detection. These are later phases.
- ERP/WMS integrations and multi-country regulatory compliance.
- A native mobile app. The patient verification page is a mobile-first web page.

---

## 2. High-level architecture

```
                         ┌───────────────────────────────┐
   Manufacturer ─┐       │        apps/web (Next.js)     │
   Distributor  ─┼──────▶│  /dashboard/*  (authenticated)│
   Wholesaler   ─┤ HTTPS │  /v/[packId]   (public verify)│
   Pharmacy     ─┘       └───────────────┬───────────────┘
                                         │ REST + JSON (typed client
   Patient ──── scans QR ──▶ /v/[packId] │  generated from OpenAPI)
                                         ▼
                         ┌───────────────────────────────┐
                         │        apps/api (NestJS)      │
                         │  auth · orgs · products       │
                         │  packs · transfers · verify   │
                         │  ledger · audit · health      │
                         └──────┬─────────────────┬──────┘
                                │                 │
                     Prisma ORM │                 │ BullMQ
                                ▼                 ▼
                    ┌──────────────────┐  ┌────────────────┐
                    │   PostgreSQL     │  │     Redis      │
                    │ (source of truth)│  │ queues · cache │
                    │ append-only      │  │ rate limits    │
                    │ ledger table     │  └───────┬────────┘
                    └──────────────────┘          │
                                                  ▼
                                       ┌────────────────────┐
                                       │ apps/api worker    │
                                       │ QR batch export    │
                                       │ emails · expiry    │
                                       └────────────────────┘
```

The API and worker run from the same NestJS codebase with two entry points (`main.ts` and `worker.ts`), so they share modules but scale on their own.

---

## 3. Tech stack

| Layer            | Choice                                                                                                                    | Why                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Monorepo         | pnpm workspaces                                                                                                           | One repo, shared types, cached builds                          |
| Frontend         | Next.js 15 (App Router), TypeScript                                                                                       | Server-rendered verify page loads fast on cheap phones         |
| UI               | Tailwind CSS v4 + shadcn/ui (restyled, not default), lucide icons                                                         | Accessible primitives we fully own and theme                   |
| Tables / forms   | TanStack Table, React Hook Form + Zod                                                                                     | Server-side sorting/filtering/pagination, inline validation    |
| Data fetching    | TanStack Query + generated API client                                                                                     | Typed end to end, caching, retries                             |
| Backend          | NestJS 11, TypeScript                                                                                                     | Modules, guards and DI fit a role-heavy domain                 |
| ORM              | Prisma                                                                                                                    | Typed queries, migrations, good NestJS support                 |
| Database         | PostgreSQL 16                                                                                                             | Relational data, constraints, triggers, transactions           |
| Queue / cache    | Redis + BullMQ                                                                                                            | Background jobs, rate limiting, short-lived cache              |
| Validation       | Zod (shared package)                                                                                                      | One schema for frontend forms and backend DTOs                 |
| Auth             | Own JWT auth (access + refresh tokens), argon2                                                                            | Roles and org approval are core to the domain                  |
| API docs         | OpenAPI via `@nestjs/swagger`                                                                                             | Live docs and the generated frontend client                    |
| Logging / errors | pino (JSON logs), Sentry                                                                                                  | Structured logs with request IDs, error tracking               |
| Code quality     | ESLint, Prettier, strict TypeScript, Husky pre-commit (lint + typecheck)                                                  | Catches problems locally without a CI pipeline                 |
| Hosting          | Vercel (web), Oracle Cloud Always Free ARM VM (api + worker + Redis via Docker Compose, Caddy for HTTPS), Neon (Postgres) | Free with no expiry or sleeping, managed Postgres with backups |

---

## 4. Repository layout

```
origo/
├── apps/
│   ├── web/                    # Next.js
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/          login, signup, org onboarding
│   │       │   ├── (dashboard)/     role-based dashboards
│   │       │   └── v/[packId]/      public verification page
│   │       ├── components/
│   │       ├── features/            feature folders (products, transfers, ...)
│   │       └── lib/                 api client, auth helpers
│   └── api/                    # NestJS
│       ├── src/
│       │   ├── main.ts              HTTP entry point
│       │   ├── worker.ts            background job entry point
│       │   ├── common/              guards, filters, interceptors, decorators
│       │   ├── config/              typed env config (validated at boot)
│       │   └── modules/
│       │       ├── auth/
│       │       ├── organizations/
│       │       ├── users/
│       │       ├── products/
│       │       ├── batches/
│       │       ├── packs/
│       │       ├── transfers/
│       │       ├── verification/
│       │       ├── ledger/          hash-chained event log
│       │       ├── audit/
│       │       └── health/
│       └── prisma/
│           ├── schema.prisma
│           ├── migrations/
│           └── seed.ts              demo data
├── packages/
│   ├── shared/                 # Zod schemas, enums, DTO types (used by API and web)
│   └── config/                 # shared eslint and tsconfig presets
├── infra/
│   ├── docker-compose.dev.yml  # local Postgres (Redis joins in Phase 2)
│   ├── docker-compose.prod.yml # api + caddy on the Oracle VM (worker + redis join in Phase 2)
│   ├── Caddyfile
│   └── deploy.sh               # one-command production deploy and rollback
├── docs/
│   ├── architecture.md
│   └── adr/                    # architecture decision records
└── phases.md
```

### Code conventions that keep it scalable

**Backend (NestJS)**

- Each module has the same shape: `*.controller.ts` → `*.service.ts` → `*.repository.ts`, plus `dto/` and `*.module.ts`.
- Controllers only parse input and shape output. Business rules live in services. Only repositories talk to Prisma.
- Modules never reach into another module's repository. They call the other module's exported service, so any module can later be split into its own service.
- Multi-step writes (transfer accept, pack registration) run inside one database transaction passed down from the service.
- Side effects (emails, scan recording, QR export) go through the queue, never inline in a request.
- Config is read through one typed `ConfigService`; no `process.env` anywhere else.
- Errors are thrown as typed domain exceptions and turned into RFC 9457 responses by one global filter.

**Frontend (Next.js)**

- Server Components by default; `"use client"` only for interactive pieces.
- Code is grouped by feature (`features/transfers/{components,hooks,api}`), not by file type.
- API calls go through two small typed helpers: `serverApi` (Server Components, forwards cookies) and `clientApi` (browser, retries once after a token refresh). Request and response types come from `@origo/shared`.
- The browser reaches the API through a same-origin rewrite (`/api/v1/*` on the web domain), so auth cookies are first-party.
- shadcn/ui components live in `apps/web/src/components/ui` and are themed only through the tokens in `globals.css`. They move to a `packages/ui` package if a second frontend appears.

---

## 5. Domain model

```
Organization 1───* Membership *───1 User
     │                  (role)
     │ 1
     ├───* Product 1───* Batch 1───* Pack
     │                                 │
     │                                 ├───* LedgerEvent   (append-only, hash chained)
     │                                 └───* Scan          (public verification hits)
     │
     └───* Transfer (from_org → to_org) 1───* TransferItem ───1 Pack
```

| Entity         | Key fields                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Organization` | `type` (MANUFACTURER, DISTRIBUTOR, WHOLESALER, PHARMACY), `status` (PENDING, APPROVED, SUSPENDED), license number    |
| `User`         | email, password hash, `isPlatformAdmin`                                                                              |
| `Membership`   | user, organization, `role` (OWNER, ADMIN, STAFF)                                                                     |
| `Product`      | manufacturer org, name, strength, dosage form, storage instructions                                                  |
| `Batch`        | product, batch number, manufacture date, expiry date, `status` (ACTIVE, RECALLED)                                    |
| `Pack`         | public ID (e.g. `MED-2026-000123`), batch, `currentOwnerOrgId`, `status` (IN_STOCK, IN_TRANSIT, DISPENSED, RECALLED) |
| `Transfer`     | from org, to org, `status` (PENDING, ACCEPTED, REJECTED, CANCELLED)                                                  |
| `LedgerEvent`  | pack, type (REGISTERED, TRANSFER_SENT, TRANSFER_RECEIVED, DISPENSED, RECALLED), actor, payload, `prevHash`, `hash`   |
| `Scan`         | pack, timestamp, coarse location (country/city from IP), user agent hash                                             |
| `AuditLog`     | actor, action, entity, before/after, IP, request ID                                                                  |

Notes:

- **Pack ownership** lives on `Pack.currentOwnerOrgId` for fast lookups. The ledger is the history; the column is a cache of the latest state. Both change inside one database transaction.
- `AuditLog` covers admin and account actions (who approved an org, who changed a role). `LedgerEvent` covers what happened to a pack. They are kept apart on purpose.

---

## 6. Key design decisions

### 6.1 Tamper-evident ledger without a blockchain

Every `LedgerEvent` stores the hash of the event before it:

```
hash = SHA-256( prevHash | packId | seq | type | actorOrgId | counterpartyOrgId | transferId | createdAt )
```

- The chain is per pack (`seq` starts at 1, the first `prevHash` is 64 zeros), so writes to different packs don't block each other. Writers lock the packs (`SELECT … FOR UPDATE`) before reading the chain's tail, so two appends can't race; `UNIQUE (pack_id, seq)` is the backstop.
- A Postgres trigger rejects `UPDATE`, `DELETE` and `TRUNCATE` on `ledger_events`. Tested: both statements fail with "ledger_events is append-only".
- `GET /packs/:publicId/history` recomputes the whole chain on every read and reports the first broken link. Tested: rewriting one event, or deleting one, is reported at the right `seq`.
- Not yet done: a separate migration role, so the app's own role can't disable the trigger (today the app role owns the table); a nightly root hash over the day's events, optionally published outside Origo.

This gives most of what a blockchain gives in this context (proof that history wasn't quietly edited) at a fraction of the cost. The trade-off is that it trusts the platform operator, which is fine for an MVP. The design is recorded in `docs/adr/0001-hash-chain-over-blockchain.md`.

### 6.2 Signed QR codes

A QR code encodes a URL:

```
https://<web-domain>/v/MED-2026-000123?k=k1&s=<signature>
```

- `s` is an Ed25519 signature of `"<k>.<packId>"`, made with a private key held only by the API and worker. Including the key ID in the signed message stops a signature being replayed under another key.
- `k` is the key ID, so keys can be rotated. Old keys must stay available for verification, or labels already printed stop verifying.
- A guessed or edited pack ID fails the check right away, without a database call.
- Ed25519 is deterministic: the same pack always gets the same QR, so nothing per pack is stored. Unlike HMAC, the public key can be published for offline checks.
- Pack IDs come from one Postgres sequence (`pack_serial_seq`) shared by all manufacturers, so they are unique platform-wide and never reused. Gaps are expected when a registration rolls back.
- The URL is about 135 characters, which encodes as a version 7 QR code (45 × 45 modules): about 27 mm on the label, comfortably scannable by phone cameras.

### 6.3 Clone detection

A real signature on a copied label still looks valid, so the scan history is used too:

- Each genuine scan is recorded with time, city and country (from Vercel's geo headers, trusted only with the web app's shared secret) and a keyed hash of the IP. The IP itself is never stored.
- The rules live in one pure function (`verification-rules.ts`), ordered by severity. A scan is a **Warning** when:
  - the ID was typed instead of scanned (`CODE_NOT_SCANNED`): only the signed QR proves the label,
  - the batch is recalled or expired,
  - the pack's hash chain fails verification,
  - the pack hasn't reached a pharmacy and wasn't dispensed (`NOT_AT_PHARMACY`): a patient shouldn't have it yet,
  - it has more than 25 genuine scans (`MANY_SCANS`),
  - it was scanned in two or more cities within 24 hours (`SCANNED_IN_MANY_PLACES`).
- A forged signature is `NOT_RECOGNIZED`, logged against the pack if the ID exists, and reveals nothing about it. Forged attempts don't count towards the scan total.
- The planned "scanned after dispensing" rule was dropped: patients scan after buying, so it would flag the normal case. Dispensing instead shows as the last step of the journey.
- These are simple rules for now. The AI phase can replace them later.

### 6.4 Transfers are two-step

1. The sender picks batches and quantities. The API locks that many in-stock packs per batch (lowest serial first, `FOR UPDATE SKIP LOCKED` so two concurrent sends take different packs), marks them `IN_TRANSIT` and writes a `TRANSFER_SENT` event for each.
2. The receiver accepts or rejects (with a reason); the sender can cancel while it's pending.
3. Accept moves ownership to the receiver; reject and cancel return the packs to the sender. Each writes a ledger event per pack. Every step is one transaction, with the transfer row locked so two people can't close it at once.

Rules enforced in the service layer and backed by database constraints:

- Only the current owner can send a pack, and only from batches that are active and not expired.
- A pack can be in at most one open transfer: `transfer_items.is_open` plus a partial unique index on `pack_id WHERE is_open`.
- Allowed recipients come from one table (`ALLOWED_TRANSFER_TARGETS` in `@origo/shared`): manufacturer → distributor; distributor → wholesaler or pharmacy; wholesaler → pharmacy. Pharmacies don't send.
- A party to a transfer can see it; anyone else gets 404. A pack's history is visible to its current owner and to every organization in its ledger.

`POST /transfers` takes an `Idempotency-Key` header (unique per sender), so a retried request returns the original transfer instead of creating a second one. Transfer references (`TRF-2026-000001`) come from their own sequence.

### 6.5 Auth and authorization

- **Tokens:** short-lived access token (15 min) and rotating refresh token (7 days), both in `httpOnly`, `Secure`, `SameSite=Lax` cookies. Refresh tokens are stored hashed, and reusing an old one revokes the whole session family. A just-rotated token stays valid for 10 seconds so two tabs refreshing at once don't log the user out.
- **Refresh before render:** the web app's middleware swaps an expired access token for a new one before a page renders, so Server Components always see a valid session. This is why the refresh cookie uses path `/`.
- **Client IP:** the API trusts `X-Forwarded-For` from a fixed number of proxies (`TRUST_PROXY_HOPS`: 2 in production, Vercel then Caddy), so rate limits and audit logs see the visitor's IP, not Vercel's.
- **Passwords:** argon2id. Login is rate-limited per IP (5 per minute), and a failed login takes the same time whether or not the email exists.
- **Authorization:** three layers, all global, so a new route is protected by default.
  1. `AuthenticationGuard`: is the user logged in? Skipped only for routes marked `@Public()`. Loads the user and membership fresh on every request, so a suspension applies immediately.
  2. `AccessGuard`: reads `@PlatformAdminOnly()`, `@RequireApprovedOrg()` and `@Roles(...)` on the route.
  3. **Org scoping:** every query filters by the caller's organization, done in the service layer, so a pharmacy can never read a distributor's stock by changing an ID in the URL.
- An organization can't do anything until a platform admin approves it.

### 6.6 Public verification endpoint

`GET /verify/:packId?k=…&s=…` is the only public data endpoint (plus `GET /verify/keys`, the public signing keys).

- Rate-limited per IP: 30 requests a minute. Responses are `Cache-Control: no-store`.
- Returns a minimal view: verdict with plain-language reasons, product, manufacturer, batch, expiry, recall status, storage instructions, and the journey as counts and dates (registered, handovers, reached a pharmacy, dispensed). It never names distributors or pharmacies, and never returns internal IDs.
- The web page (`/v/[packId]`) renders on the server and forwards the visitor's IP and Vercel's geo headers, so the scan log and rate limit see the patient, not the web server.
- Scans are written inline (one insert). The queue isn't worth the extra hop for this; it can move to a job if verification traffic grows.
- Pharmacies mark packs `DISPENSED` (`POST /packs/:publicId/dispense`), which adds a `DISPENSED` ledger event.

---

## 7. API overview

REST, versioned under `/api/v1`, documented at `/api/docs`.

| Area                 | Endpoints (examples)                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Auth                 | `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`                                        |
| Organizations        | `POST /organizations`, `GET /organizations/:id`, `POST /admin/organizations/:id/approve`                                                  |
| Members              | `POST /organizations/:id/invites`, `PATCH /memberships/:id`                                                                               |
| Products and batches | `POST /products`, `GET /products`, `POST /products/:id/batches` (creates the batch and all its packs), `GET /batches`, `GET /batches/:id` |
| Packs                | `GET /batches/:id/packs`, `GET /batches/:id/label-preview`; Phase 3 adds `GET /packs/:id/ledger` and `GET /packs/:id/ledger/verify`       |
| Label export         | `POST /batches/:id/label-exports` (queued, 202) → `GET /label-exports/:id` → `GET /label-exports/:id/file`                                |
| Transfers            | `POST /transfers` (Idempotency-Key), `GET /transfers?direction=`, `GET /transfers/:id`, `POST /transfers/:id/accept                       | reject | cancel`, `GET /transfers/recipients`, `GET /inventory`, `GET /packs/:publicId/history` |
| Pharmacy             | `POST /packs/:id/dispense`                                                                                                                |
| Verification         | `GET /verify/:packId` (public)                                                                                                            |
| Health               | `GET /health/live`, `GET /health/ready`                                                                                                   |

Errors follow RFC 9457 (Problem Details) so every error response has the same shape.

---

## 8. Background jobs (BullMQ)

| Job                             | Trigger                              | What it does                                                                                                                                    |
| ------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `label-exports:build`           | Manufacturer requests labels         | Streams the batch's pack IDs, signs each, draws vector QR labels onto A4 21-up sheets (Avery L7160 layout), writes the PDF to the shared volume |
| `label-exports:cleanup-expired` | Hourly scheduler                     | Deletes PDFs older than `LABEL_EXPORT_TTL_HOURS` (24 h)                                                                                         |
| `record-scan`                   | Every public verify call             | Saves the scan, runs clone-detection rules                                                                                                      |
| `send-email`                    | Invites, approvals, transfer notices | Sends transactional email                                                                                                                       |
| `ledger-daily-root`             | Nightly cron                         | Computes and stores the daily root hash                                                                                                         |

Jobs retry three times with exponential backoff; after the last failure the export is marked `FAILED` with a message the user sees. If Redis doesn't answer within 5 seconds when a job is queued, the request returns 503 instead of hanging. A 5,000-label PDF takes about 10 seconds and 14 MB.

---

## 9. Security checklist

- All input validated with Zod/class-validator at the API edge. Unknown fields are rejected.
- Helmet security headers, strict CORS (web origin only), CSRF protection for cookie-based auth.
- Secrets only in environment variables, validated at boot. The app refuses to start if one is missing.
- Least-privilege database role. Ledger table is insert-only.
- Rate limiting on auth and public verify routes.
- Dependabot alerts on the GitHub repo.
- No personal data on the public verify response.

---

## 10. UI and design system

The UI has to look like a real product a pharma company would pay for. That means calm, dense and precise, closer to Stripe Dashboard or Linear than to a template.

**Things we never ship**

- Purple/blue gradients, glassmorphism, glowing blobs, or decorative 3D shapes.
- Emoji as icons, or a different icon style on every screen.
- Centered "hero card" layouts inside the app, or every screen built from identical rounded cards with big shadows.
- Default shadcn look left untouched, or placeholder copy like "Welcome back! 👋".
- Spinners as the only loading state, or blank screens when there is no data.

**Visual language**

- **Type:** one sans-serif family (Geist Sans) for UI and Geist Mono for pack IDs, batch numbers and hashes. Numbers use tabular figures so columns line up.
- **Color:** a neutral grey base (slightly cool) with one brand accent, **Deep Petrol**. Green, amber and red are reserved for status only: Verified, Warning, Not recognized / Recalled. Petrol sits between blue and teal, far enough from the Verified green that a primary button never reads as a status. Status is always shown with an icon and text too, never color alone.

  | Token                                | Light     | Dark      |
  | ------------------------------------ | --------- | --------- |
  | `accent`                             | `#155E75` | `#5EC4DA` |
  | `accent-soft` (active nav, tags)     | `#E2F0F4` | `#12303A` |
  | `on-accent` (text on accent)         | `#FFFFFF` | `#062028` |
  | `background`                         | `#F5F7F8` | `#0A1216` |
  | `surface`                            | `#FFFFFF` | `#101B20` |
  | `border`                             | `#DDE3E6` | `#23343B` |
  | `foreground`                         | `#0F1D24` | `#E5EDF0` |
  | `muted-foreground`                   | `#5A6A72` | `#8DA0A8` |
  | `success` (Verified)                 | `#15803D` | `#4ADE80` |
  | `warning`                            | `#B45309` | `#FBBF24` |
  | `danger` (Recalled / Not recognized) | `#B91C1C` | `#F87171` |

- **Tokens:** colors, spacing, radius and shadows are CSS variables in `packages/ui`, with light and dark themes from day one.
- **Density:** 14px base text in dashboards, compact tables, consistent 4px spacing grid.

**App shell (dashboards)**

- Left sidebar with role-specific navigation, top bar with org switcher, global search (pack ID / batch number) and user menu. `Cmd/Ctrl + K` opens a command palette.
- Data tables with server-side sorting, filters, pagination, column visibility and row actions. Bulk actions for multi-pack transfers.
- Every screen has designed loading (skeletons matching the layout), empty (explains what to do next, with the action button) and error (what went wrong and how to retry) states.

**Signature screens**

- **Pack timeline:** a vertical timeline of every ledger event (registered → sent → received → dispensed), each with org, time and actor, plus a "Chain intact" badge from the hash-chain check.
- **Transfer flow:** select packs (scan or search) → choose receiver → review → confirm, with the incoming side showing a clear accept/reject inbox.
- **Patient verify page (`/v/[packId]`):** mobile-first. The verdict is the first and largest thing on screen, written in plain language, followed by product, batch, expiry, recall notice and storage instructions. Server-rendered, minimal JavaScript, fast on a cheap phone over a slow connection.
- **Manufacturer overview:** batches, packs registered, packs in the chain by stage, recent warnings.

**Interaction and accessibility**

- Keyboard accessible throughout, visible focus rings, WCAG AA contrast in both themes.
- Forms validate inline as the user types (same Zod schema as the API) and keep their input on errors.
- Toasts only confirm background results; destructive actions (reject transfer, recall batch) use a confirm dialog that names what will happen.
- Subtle, quick motion (150 to 200ms) for state changes only. Respects `prefers-reduced-motion`.

---

## 11. Environments and deployment

| Environment | Web        | API + worker               | Database        | Redis                     |
| ----------- | ---------- | -------------------------- | --------------- | ------------------------- |
| Local       | `next dev` | `nest start --watch`       | Docker Postgres | Docker Redis              |
| Production  | Vercel     | Oracle VM (Docker Compose) | Neon            | Redis container on the VM |

**Web:** Vercel deploys the `main` branch through its built-in GitHub integration.

**API and worker:** `infra/deploy.sh` does a one-command deploy over SSH:

1. Pull the latest code on the VM.
2. Build the Docker images on the VM itself (it is ARM, so images are built natively).
3. Run Prisma migrations against Neon.
4. Restart `api` and `worker` with `docker compose up -d`, waiting for `/health/ready` before reporting success.
5. Keep the previous image tagged so a rollback is one command.

**Oracle VM setup:** Ubuntu on an Ampere A1 instance, Docker Compose running `api`, `worker`, `redis` (with AOF persistence) and `caddy` (reverse proxy with automatic Let's Encrypt certificates). Only ports 80 and 443 are open; SSH is key-only. Unattended security upgrades are on. Redis is never exposed to the internet.

Database migrations run as a separate deploy step before the new API version starts.

---

## 12. Observability

- pino JSON logs with a request ID that flows from web → API → worker.
- Sentry on web and API for errors and slow transactions.
- `/health/live` and `/health/ready` (ready checks Postgres and Redis).
- A small admin metrics page: registered packs, transfers per day, scans per day, warnings raised.

---

## 13. Demo data

A seed script creates a full demo world so visitors can try the app without signing up:

- One manufacturer, distributor, wholesaler and pharmacy, each with a demo login.
- Products and batches, including one recalled batch and one near-expiry batch.
- Packs at every stage of the chain, plus one "cloned" pack that triggers a warning.
- A public demo page with sample QR codes for each verdict.

---

## 14. Phase 1 deliverables (from this document)

- Monorepo skeleton with `apps/web`, `apps/api`, `packages/shared`, `packages/config` (pnpm workspaces)
- `infra/docker-compose.dev.yml` for local Postgres
- Prisma schema for `User`, `Organization`, `Membership`, `Session`, `AuditLog`
- Auth module (signup, login, refresh with rotation and reuse detection, logout, me) with guards
- Organization onboarding and admin review (approve, reject with reason, suspend)
- Role-based dashboards, review status for pending/rejected/suspended orgs, admin review queue
- Design tokens, light and dark themes, and the app shell
- Health endpoints, pino logging with request IDs, Sentry
- Production deployment: Vercel for web, Oracle VM with `deploy.sh` for the API

Phase 1 rate limiting is in-memory, which is correct while one API container runs.

## 17. Phase 4 deliverables

- `Scan` model (keyed IP hash, city, country, verdict) and `DISPENSED` ledger event
- Public `GET /verify/:packId` with signature check, warning rules, privacy-preserving scan log and per-IP rate limit; `GET /verify/keys`
- Pharmacy dispensing with row lock, state checks, ledger event and audit entry
- Web: public `/v/[packId]` result page (server-rendered, ~108 kB first load), `/verify` landing page with manual lookup, dispense action on the pack page, `DISPENSED` on the timeline
- New secrets: `SCAN_HASH_SECRET` (API) and `WEB_PROXY_SECRET` (API and web)

## 16. Phase 3 deliverables

- `Transfer`, `TransferItem`, `LedgerEvent` models; append-only trigger; one-open-transfer partial index; `transfer_ref_seq`
- `LedgerService`: per-pack hash chains, append under row locks, full-chain verification
- Batch registration now writes each pack's `REGISTERED` event; `ledger:backfill` script for packs created before the ledger
- Transfers: create (with idempotency), accept, reject, cancel; recipient directory; pending-incoming count
- Inventory by batch for every member organization; pack history with chain check
- Web: inventory with pack lookup, transfers (incoming/outgoing), new-transfer form, transfer detail with actions, pack timeline; pending-transfer badge in the sidebar; dashboard steps linked for every role

## 15. Phase 2 deliverables

- `Product`, `Batch`, `Pack`, `LabelExport` models; `pack_serial_seq`; date and count check constraints
- Manufacturer-only routes via `@OrgTypes("MANUFACTURER")` in the access guard
- Batch registration that creates the batch and up to 5,000 packs in one transaction
- Ed25519 QR signing (`QrSigningService`) with key rotation support and a key-generation script
- Redis + BullMQ queue, a separate worker process (`dist/worker.js`) and the label PDF builder
- Web: products list and detail, batches list and detail, live label preview with the real signed QR, label export with progress and download
- Compose: Redis and the worker in development and production, a shared volume for PDFs
