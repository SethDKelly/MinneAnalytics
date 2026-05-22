#!/usr/bin/env bash
# One-time / fresh setup for MinneAnalytics conference demo (macOS / Linux)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. See README for OS-specific install steps."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Installing dependencies..."
npm install

echo "Applying database schema..."
npm run db:push

echo "Seeding demo data (prints reviewer/presenter URLs)..."
npm run db:seed

echo ""
echo "Done. Start the app with: npm run dev"
echo "Then open http://localhost:3000"
