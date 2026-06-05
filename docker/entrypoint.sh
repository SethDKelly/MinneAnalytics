#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/data/prisma/dev.db}"

echo "Applying database schema..."
npx prisma db push --skip-generate

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "Starting Next.js..."
exec node server.js
