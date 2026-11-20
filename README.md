# Origo

Pharmaceutical end-to-end traceability and anti-counterfeit platform.

Every medicine pack gets a unique digital identity (QR code). Manufacturers, distributors, wholesalers and pharmacies record each handover, and patients can scan a pack to verify it.

- Roadmap: [phases.md](phases.md)
- Architecture: [docs/architecture.md](docs/architecture.md)

## Stack

| Part                       | Tech                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| Web (`apps/web`)           | Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui                      |
| API (`apps/api`)           | NestJS 11, Prisma 6, PostgreSQL 16                                       |
| Shared (`packages/shared`) | Zod schemas and DTO types used by both apps                              |
| Hosting                    | Vercel (web), Oracle Cloud VM with Docker + Caddy (API), Neon (Postgres) |

## Running locally

Requirements: Node 22+, pnpm 10, and PostgreSQL 16 (Docker or a Neon dev branch).

```bash
pnpm install

# 1. Database: Docker below, or a Neon dev branch (put its URLs in apps/api/.env, see .env.example)
docker compose -f infra/docker-compose.dev.yml up -d

# 2. Environment
cp apps/api/.env.example apps/api/.env        # set JWT_ACCESS_SECRET
cp apps/web/.env.example apps/web/.env.local

# 3. Schema and demo data
pnpm db:migrate
pnpm db:seed

# 4. Start web (http://localhost:3000) and API (http://localhost:4000)
pnpm dev
```

### Demo logins (after `pnpm db:seed`)

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

| Command                        | What it does                                           |
| ------------------------------ | ------------------------------------------------------ |
| `pnpm dev`                     | Web and API in watch mode                              |
| `pnpm build`                   | Production build of every package                      |
| `pnpm typecheck` / `pnpm lint` | Type and lint checks (also run by the pre-commit hook) |
| `pnpm db:migrate`              | Create/apply a migration in development                |
| `pnpm db:seed`                 | Load the admin and demo organizations                  |
| `pnpm db:studio`               | Browse the database                                    |

## Deploying

**Web:** import the repo in Vercel with root directory `apps/web` and set `API_URL` to the API's public URL. `apps/web/vercel.json` builds the shared package first.

**API:** on the Oracle VM, clone the repo to `/opt/origo` and create `infra/.env.production` from `infra/.env.production.example`. Then, from your machine:

```bash
DEPLOY_HOST=ubuntu@<vm-ip> ./infra/deploy.sh            # build on the VM, migrate, restart, health check
DEPLOY_HOST=ubuntu@<vm-ip> ./infra/deploy.sh rollback   # back to the previous image
```

Caddy issues the HTTPS certificate for `API_DOMAIN` automatically.
