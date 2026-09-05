#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/data/prisma/dev.db}"

printf '%s\n' "Running controlled migration/bootstrap path..."
node scripts/migrations/deploy-bootstrap.mjs

printf '%s\n' "Starting Next.js..."
exec node server.js
