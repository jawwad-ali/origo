#!/usr/bin/env bash
# One-command production deploy of the API to the Oracle Cloud VM.
#
#   DEPLOY_HOST=ubuntu@1.2.3.4 ./infra/deploy.sh            # deploy origin/main
#   DEPLOY_HOST=ubuntu@1.2.3.4 ./infra/deploy.sh rollback   # back to the previous image
#
# On the VM the repo lives at $APP_DIR, with infra/.env.production in place.
# The image is built on the VM itself, so it is natively ARM64.
set -euo pipefail

: "${DEPLOY_HOST:?Set DEPLOY_HOST, e.g. ubuntu@203.0.113.10}"
APP_DIR="${APP_DIR:-/opt/origo}"
BRANCH="${BRANCH:-main}"
ACTION="${1:-deploy}"

remote() {
  # shellcheck disable=SC2029  # variables are meant to expand locally
  ssh -o BatchMode=yes "$DEPLOY_HOST" "set -euo pipefail; cd '$APP_DIR'; $1"
}

COMPOSE="docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.production"

wait_for_ready() {
  remote "for i in \$(seq 1 30); do
      if $COMPOSE exec -T api node -e \"fetch('http://127.0.0.1:4000/api/v1/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"; then
        echo 'API is ready.'; exit 0
      fi
      sleep 2
    done
    echo 'API did not become ready in 60s. Recent logs:' >&2
    $COMPOSE logs --tail=50 api >&2
    exit 1"
}

deploy() {
  echo "→ Updating code on $DEPLOY_HOST ($BRANCH)"
  remote "git fetch --quiet origin '$BRANCH' && git checkout --quiet '$BRANCH' && git reset --hard --quiet 'origin/$BRANCH'"
  local tag
  tag="$(remote "git rev-parse --short HEAD")"

  echo "→ Keeping the running image as origo-api:previous"
  remote "docker image inspect origo-api:latest >/dev/null 2>&1 && docker tag origo-api:latest origo-api:previous || true"

  echo "→ Building origo-api:$tag"
  remote "IMAGE_TAG=$tag $COMPOSE build api && docker tag origo-api:$tag origo-api:latest"

  echo "→ Running database migrations"
  remote "$COMPOSE run --rm --no-deps api node_modules/.bin/prisma migrate deploy"

  echo "→ Restarting"
  remote "$COMPOSE up -d --remove-orphans"
  wait_for_ready

  remote "docker image prune -f >/dev/null"
  echo "✓ Deployed $tag"
}

rollback() {
  echo "→ Rolling back to origo-api:previous"
  remote "docker image inspect origo-api:previous >/dev/null && docker tag origo-api:previous origo-api:latest && $COMPOSE up -d --no-build api worker"
  wait_for_ready
  echo "✓ Rolled back. Database migrations are not reverted; roll forward with a new migration if needed."
}

case "$ACTION" in
  deploy) deploy ;;
  rollback) rollback ;;
  *) echo "Usage: $0 [deploy|rollback]" >&2; exit 2 ;;
esac
