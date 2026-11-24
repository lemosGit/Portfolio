#!/usr/bin/env bash
# Testa as migrações num Postgres 17 local (Docker), com o auth/storage do Supabase simulados.
# Uso: bash scripts/db-test.sh
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=gf-db-test
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -e POSTGRES_PASSWORD=test -p 54329:5432 postgres:17-alpine >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
for i in $(seq 1 30); do docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
sleep 1
run() { docker exec -i "$NAME" psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres "$@"; }
run < supabase/tests/_supabase_stub.sql
for f in supabase/migrations/*.sql; do echo "→ $f"; run < "$f"; done
for t in supabase/tests/[0-9]*.sql; do echo "→ $t"; run < "$t"; done
echo "✔ migrações e testes OK"
