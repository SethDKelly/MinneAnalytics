import path from "path";

/** local = laptop SQLite demo; aws = container with persistent /data volume */
export type DeploymentMode = "local" | "aws";

export function getDeploymentMode(): DeploymentMode {
  return process.env.DEPLOYMENT_MODE === "aws" ? "aws" : "local";
}

export function getDataDir(): string {
  if (getDeploymentMode() === "aws") {
    return process.env.DATA_DIR ?? "/data";
  }
  return process.cwd();
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (getDeploymentMode() === "aws") {
    return `file:${path.join(getDataDir(), "prisma", "dev.db")}`;
  }
  return "file:./prisma/dev.db";
}

export function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  if (getDeploymentMode() === "aws") {
    return path.join(getDataDir(), "uploads");
  }
  return path.join(process.cwd(), "uploads");
}

export function getPublicAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}
