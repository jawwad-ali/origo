# Deploying Origo

Two production setups, same code:

| Setup                         | Web    | API                                                 | Needs                          | Use when                                      |
| ----------------------------- | ------ | --------------------------------------------------- | ------------------------------ | --------------------------------------------- |
| **A. VM** (sections 1–6)      | Vercel | Oracle Cloud VM: API, worker, Redis, Caddy          | A card-verified Oracle account | You want a long-running API with a real queue |
| **B. Serverless** (section 7) | Vercel | A second Vercel project (Vercel Function in `sin1`) | Only a Vercel Hobby account    | No card, or you don't want to run a server    |

Both use **Neon** for Postgres. The live portfolio demo runs setup B. The difference is only in how label PDFs are built and stored; see "Label exports run anywhere" in [architecture.md](architecture.md#label-exports-run-anywhere-runners-and-storage).

Setup A takes a fresh setup to a live demo in about an hour the first time.

```
Browser ──HTTPS──▶ Vercel (Next.js) ──/api/v1/* rewrite──▶ Caddy ─▶ api ─┐
                                                          (Oracle VM)     ├─▶ Neon Postgres (main branch)
                                                                  worker ─┘   Redis (on the VM)
```

## 1. Database: Neon `main` branch

The `dev` branch is for local work; production uses `main`.

```bash
# Connection strings for main (pooled and direct)
neonctl connection-string main --project-id <project-id> --database-name origo --role-name origo_app --pooled
neonctl connection-string main --project-id <project-id> --database-name origo --role-name origo_app
```

Add `&connect_timeout=30` to both and remove `channel_binding=require`. The deploy script runs migrations on every deploy, so nothing else is needed here. For the portfolio demo, seed once after the first deploy (step 5).

## 2. API host: Oracle Cloud VM

1. **Create the VM.** Compute → Instances → Create. Image: Ubuntu 24.04. Shape: `VM.Standard.A1.Flex` (Ampere, Always Free), 2 OCPU / 12 GB is plenty. Pick the Singapore region if you can (next to the Neon database). Add your SSH public key. If you get "Out of host capacity", try again later or pick another availability domain.
2. **Open ports 80 and 443.** In the instance's VCN → Security List, add ingress rules for TCP 80 and 443 from `0.0.0.0/0`. Oracle's Ubuntu image also blocks them in iptables:
   ```bash
   sudo iptables -I INPUT 6 -p tcp -m multiport --dports 80,443 -j ACCEPT
   sudo netfilter-persistent save
   ```
3. **Install Docker and harden SSH.**
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker ubuntu        # log out and back in
   sudo apt-get install -y unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades
   # In /etc/ssh/sshd_config: PasswordAuthentication no   then: sudo systemctl restart ssh
   ```
4. **A domain for the API.** Any DNS name pointing at the VM's public IP works. Without a domain, use `sslip.io`: `api.<your-ip-with-dashes>.sslip.io` (for example `api.203-0-113-10.sslip.io`) resolves to that IP, and Caddy can get a real certificate for it.
5. **Clone and configure.**

   ```bash
   sudo mkdir -p /opt/origo && sudo chown ubuntu /opt/origo
   git clone https://github.com/<you>/origo.git /opt/origo
   cp /opt/origo/infra/.env.production.example /opt/origo/infra/.env.production
   nano /opt/origo/infra/.env.production
   ```

   Fill in every value. Generate secrets with `openssl rand -base64 48`. Generate the QR key once on your machine with `pnpm --filter @origo/api qr:keygen` and keep a copy somewhere safe: **labels printed with a key stop verifying if that key is lost.**

   | Variable                                                    | Value                                      |
   | ----------------------------------------------------------- | ------------------------------------------ |
   | `API_DOMAIN`                                                | the domain from step 4                     |
   | `ACME_EMAIL`                                                | your email, for certificate expiry notices |
   | `WEB_ORIGIN`                                                | `https://<your-app>.vercel.app`            |
   | `DATABASE_URL` / `DIRECT_URL`                               | Neon `main`, pooled / direct               |
   | `JWT_ACCESS_SECRET`, `SCAN_HASH_SECRET`, `WEB_PROXY_SECRET` | random, 32+ characters each                |
   | `VERIFY_BASE_URL`                                           | `https://<your-app>.vercel.app/v`          |
   | `QR_SIGNING_PRIVATE_KEY`, `QR_SIGNING_KEY_ID`               | from `qr:keygen`; key ID `k1`              |
   | `DEMO_MODE`                                                 | `true` only for the portfolio demo         |

## 3. First deploy

From your machine (SSH key access to the VM):

```bash
DEPLOY_HOST=ubuntu@<vm-ip> ./infra/deploy.sh
```

It pulls `main`, builds the ARM64 image on the VM, runs migrations, starts `api`, `worker`, `redis` and `caddy`, and waits for `/api/v1/health/ready`. Check it:

```bash
curl https://<API_DOMAIN>/api/v1/health/ready     # {"status":"ok","checks":{"database":"up"}}
```

Roll back to the previous image with `./infra/deploy.sh rollback` (migrations aren't reverted).

## 4. Web: Vercel

1. Import the GitHub repository. **Root directory:** `apps/web`. Vercel picks up `apps/web/vercel.json`, which builds the shared package first.
2. Environment variables (Production):

   | Variable           | Value                                             |
   | ------------------ | ------------------------------------------------- |
   | `API_URL`          | `https://<API_DOMAIN>`                            |
   | `WEB_PROXY_SECRET` | same value as on the API                          |
   | `DEMO_PASSWORD`    | demo deployment only: the demo accounts' password |

3. Deploy. Every push to `main` redeploys the web app; the API is deployed with `deploy.sh`.

## 5. Demo data (portfolio deployment only)

Run the seeds from your machine against Neon `main`. Make a copy of `apps/api/.env` (for example `.env.main`), point `DATABASE_URL` and `DIRECT_URL` at `main`, set the same `QR_SIGNING_*` values as production and pick real passwords for `SEED_ADMIN_PASSWORD` and `SEED_DEMO_PASSWORD`. Then:

```bash
cd apps/api
npx tsx --env-file=.env.main prisma/seed.ts          # admin + one organization per role
pnpm build && node --env-file=.env.main dist/seed/demo-seed.js   # the demo world
rm .env.main
```

Set `DEMO_PASSWORD` in Vercel to the same demo password, then open `https://<your-app>.vercel.app/demo`.

Demo visitors change the data as they click around (that's the point). To reset it, create a fresh Neon branch from `main` at its post-seed state, or drop and re-seed the demo organizations.

## 6. After launch

- **Smoke test:** sign in as each demo role; send and accept a transfer; export labels and download the PDF (exercises Redis and the worker); scan a sample from `/demo` on a phone.
- **Uptime:** point a free monitor (for example UptimeRobot) at `https://<API_DOMAIN>/api/v1/health/ready`.
- **Errors:** create a Sentry project and set `SENTRY_DSN` on the API.
- **Backups:** Neon keeps point-in-time history for the plan's retention window; restore by branching from a past time. Redis only holds queue state, and label PDFs expire after 24 hours, so neither needs backups.
- **Logs:** `docker compose -f infra/docker-compose.prod.yml logs -f api worker` on the VM. Each line carries the request ID shown in API error responses.

## 7. Setup B: the API on Vercel (no server, no card)

The API runs as one Vercel Function (`apps/api/api/index.js` → `dist/serverless.js`), configured by `apps/api/vercel.json`: built with `nest build`, region `sin1` (next to Neon Singapore), 300 s max duration, every path rewritten to the function, and a daily cron that removes expired PDFs.

1. **Database:** as in section 1, then apply migrations from your machine (the function doesn't run them):
   ```bash
   cd apps/api
   node --env-file=.env.main node_modules/prisma/build/index.js migrate deploy
   ```
2. **API project:** import the repo in Vercel again, **Root directory** `apps/api`, framework **Other** (`vercel.json` sets the rest). Environment variables (Production):

   | Variable                                                                                                               | Value                                         |
   | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
   | `LABEL_EXPORT_RUNNER` / `LABEL_EXPORT_STORAGE`                                                                         | `inline` / `database`                         |
   | `CRON_SECRET`                                                                                                          | random, 32+ characters (Vercel Cron sends it) |
   | `TRUST_PROXY_HOPS`                                                                                                     | `1`                                           |
   | `COOKIE_SECURE`                                                                                                        | `true`                                        |
   | `WEB_ORIGIN`, `VERIFY_BASE_URL`                                                                                        | the web app's URL, and that URL + `/v`        |
   | `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `SCAN_HASH_SECRET`, `WEB_PROXY_SECRET`, `QR_SIGNING_*`, `DEMO_MODE` | as in the table in section 2                  |

   No `REDIS_URL`: the inline runner never connects to Redis.

3. **Web project:** as in section 4, with `API_URL` set to the API project's production domain (for example `https://origo-api-xxxx.vercel.app`). Use the production domain, not a per-deployment URL, which Vercel protects with a login.
4. **Demo data:** as in section 5.

Trade-offs against setup A: no automatic retries for a failed PDF (the user exports again), the first request after a quiet period takes a second or two longer (cold start), the rate limiter counts per function instance, and expired PDFs are removed daily instead of hourly (downloads past the expiry are refused either way).

## Not done yet

- **QR key rotation** verifies only the current key. Supporting several verification keys is needed before rotating in production.
- **A separate database role** for migrations, so the app's role can't disable the ledger's append-only trigger.
- **Automated demo reset** on a schedule.
