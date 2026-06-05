# Deployment

Two supported modes: **local laptop demo** (default) and **AWS dev** (GitHub Actions on the `dev` branch).

## Local laptop demo

No AWS required. SQLite database and filesystem uploads.

```powershell
.\scripts\setup.ps1
npm run dev
```

Open http://localhost:3000. Copy private URLs from the seed output in the terminal.

### Optional: containerized local demo

Same app image as AWS, data in a Docker volume:

```powershell
docker compose up --build
```

## AWS dev deployment

Deploys from the **`dev` branch** using GitHub OIDC → `dev-github-deploy` (managed in [aws-backbone](https://github.com/SethDKelly/aws-backbone)).

```text
push to dev
  → GitHub Actions (deploy-dev.yml)
  → OIDC → dev-github-deploy
  → Terraform (infra/dev): ECR, ECS Fargate, ALB, EFS
  → Docker build → ECR
  → ECS rolling deploy
```

### Prerequisites

| Item | Location |
|------|----------|
| OIDC trust for this repo | aws-backbone `github_repositories` includes `SethDKelly/MinneAnalytics` |
| Remote state bucket | `aws-backbone-terraform-state-521018312783` (shared) |
| `dev` branch pushed | This repository |

### First deploy

1. Create and push the `dev` branch (if not already on GitHub).
2. Merge deployment changes into `dev`.
3. Run **Deploy to dev** workflow (or push to `dev`).
4. For a fresh database with demo data, re-run workflow manually with **seed_on_start: true** (once only).
5. Open the URL from the workflow summary (`terraform output app_url`).

### Subsequent deploys

Push to `dev`. Workflow rebuilds the image, updates Terraform, and rolls ECS.

### Manual workflow dispatch

GitHub → Actions → **Deploy to dev** → Run workflow.

| Input | When |
|-------|------|
| `seed_on_start: true` | First deploy only — loads demo conferences and prints tokens to CloudWatch logs |
| `seed_on_start: false` | Normal deploys (default) |

### Architecture (dev)

| Component | Purpose |
|-----------|---------|
| **ECR** | Container images |
| **ECS Fargate** | Runs Next.js (1 task) |
| **EFS** | Persistent SQLite DB + deck uploads at `/data` |
| **ALB** | Public HTTP entrypoint |

Single-instance by design — suitable for demos, not production scale.

### Environment variables (AWS)

Set in `infra/dev/main.tf` task definition:

| Variable | Value |
|----------|-------|
| `DEPLOYMENT_MODE` | `aws` |
| `DATA_DIR` | `/data` |
| `DATABASE_URL` | `file:/data/prisma/dev.db` |
| `UPLOAD_DIR` | `/data/uploads` |
| `NEXT_PUBLIC_APP_URL` | ALB URL |

### Troubleshooting

| Issue | Fix |
|-------|-----|
| OIDC assume role fails | Confirm repo name `SethDKelly/MinneAnalytics` in aws-backbone; merge backbone PR |
| `iam:PassRole` denied | aws-backbone `dev-github-deploy` needs `minneanalytics-dev-*` PassRole allow |
| Health check failing | Check CloudWatch log group `/ecs/minneanalytics-dev` |
| Empty site after first deploy | Re-run workflow with `seed_on_start: true` |

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable demo code; CI runs lint/build |
| `dev` | AWS dev deployment target |
| `feature/*` | Development; merge to `dev` or `main` via PR |

## Related

- [aws-backbone GitHub Actions deploy](https://github.com/SethDKelly/aws-backbone/blob/main/docs/github-actions.md)
- [Development guide](development.md)
