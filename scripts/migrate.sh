#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."; set -a; . ./.env; set +a; : "${DATABASE_URL:?DATABASE_URL required}"; psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/db/schema.sql; for migration in backend/db/migrations/*.sql; do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"; done
