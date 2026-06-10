#!/bin/sh
set -e

mkdir -p /data/prisma /data/uploads

export DATABASE_URL="${DATABASE_URL:-file:/data/prisma/dev.db}"

echo "Applying database schema..."
/app/node_modules/.bin/prisma db push --skip-generate

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database..."
  /app/node_modules/.bin/tsx prisma/seed.ts
fi

echo "Starting Next.js..."
exec node server.js
