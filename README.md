# Origo

Pharmaceutical end-to-end traceability and anti-counterfeit platform.

Every medicine pack gets a unique digital identity (QR code). Manufacturers, distributors, wholesalers and pharmacies record each handover, and patients can scan a pack to verify it.

- Roadmap: [phases.md](phases.md)
- Architecture: [docs/architecture.md](docs/architecture.md)

## Stack

| Part                       | Tech                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| Web (`apps/web`)           | Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui                      |
| API (`apps/api`)           | NestJS 11, Prisma 6, PostgreSQL 16, BullMQ + Redis (worker process)      |
| Shared (`packages/shared`) | Zod schemas and DTO types used by both apps                              |
| Hosting                    | Vercel (web), Oracle Cloud VM with Docker + Caddy (API), Neon (Postgres) |

## Running locally

Requirements: Node 22+, pnpm 10, Docker (for Redis), and PostgreSQL 16 (Docker or a Neon dev branch).

```bash
pnpm install

# 1. Redis (job queue). Add --profile postgres to also run a local Postgres instead of Neon.
docker compose -f infra/docker-compose.dev.yml up -d

# 2. Environment
cp apps/api/.env.example apps/api/.env        # set JWT_ACCESS_SECRET and the database URLs
pnpm --filter @origo/api qr:keygen            # paste QR_SIGNING_PRIVATE_KEY into apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Schema and demo data
pnpm db:migrate
pnpm db:seed

# 4. Start web (http://localhost:3000), API (http://localhost:4000) and the worker
pnpm dev
```

### Demo data

`pnpm db:seed` creates the platform admin and one organization per role. `pnpm --filter @origo/api db:seed:demo` then builds a demo world through the real services: four products, transfers that were accepted, rejected, cancelled and left pending, dispensed packs, a recalled batch and a copied label. With `DEMO_MODE=true` (API) and `DEMO_PASSWORD` (web), `/demo` shows scannable sample packs and one-click sign-in for each role.

### Demo logins

Passwords come from `SEED_ADMIN_PASSWORD` and `SEED_DEMO_PASSWORD` in `apps/api/.env`.

| Role                               | Email                                                     |
| ---------------------------------- | --------------------------------------------------------- |
| Platform admin                     | value of `SEED_ADMIN_EMAIL` (default `admin@origo.local`) |
| Manufacturer                       | `manufacturer@demo.origo.dev`                             |
| Distributor                        | `distributor@demo.origo.dev`                              |
| Wholesaler                         | `wholesaler@demo.origo.dev`                               |
| Pharmacy                           | `pharmacy@demo.origo.dev`                                 |
| Pending pharmacy (awaiting review) | `pending@demo.origo.dev`                                  |

## Scripts

| Command                                 | What it does                                           |
| --------------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                              | Web and API in watch mode                              |
| `pnpm build`                            | Production build of every package                      |
| `pnpm typecheck` / `pnpm lint`          | Type and lint checks (also run by the pre-commit hook) |
| `pnpm db:migrate`                       | Create/apply a migration in development                |
| `pnpm db:seed`                          | Load the admin and demo organizations                  |
| `pnpm --filter @origo/api db:seed:demo` | Build the demo world (products, transfers, scans)      |
| `pnpm --filter @origo/api qr:keygen`    | Generate a QR signing key pair                         |
| `pnpm db:studio`                        | Browse the database                                    |

## Deploying

See [docs/deployment.md](docs/deployment.md) for the full guide: Neon `main` branch, the Oracle Cloud VM (API, worker, Redis, Caddy with automatic HTTPS), Vercel, demo data and post-launch checks.

```bash
DEPLOY_HOST=ubuntu@<vm-ip> ./infra/deploy.sh            # build on the VM, migrate, restart, health check
DEPLOY_HOST=ubuntu@<vm-ip> ./infra/deploy.sh rollback   # back to the previous image
```

## Design decisions

- [ADR 0001: a hash-chained ledger in Postgres instead of a blockchain](docs/adr/0001-hash-chain-over-blockchain.md)
