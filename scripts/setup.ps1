# One-time / fresh setup for MinneAnalytics conference demo
$ErrorActionPreference = "Stop"

$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = "$nodeDir;$env:Path"
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
}

Write-Host "Installing dependencies..."
npm install

Write-Host "Applying database schema..."
npm run db:push

Write-Host "Seeding demo data (prints reviewer/presenter URLs)..."
npm run db:seed

Write-Host ""
Write-Host "Done. Start the app with: npm run dev"
Write-Host "Then open http://localhost:3000"
