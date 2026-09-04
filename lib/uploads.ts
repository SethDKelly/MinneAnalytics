import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { getUploadDir } from "./config";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const MAX_BYTES = 25 * 1024 * 1024;

export { getUploadDir } from "./config";

export function validateDeckFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Only PDF and PowerPoint files are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return "File must be 25 MB or smaller.";
  }
  return null;
}

export async function saveDeckFile(
  submissionId: string,
  version: number,
  file: File
): Promise<{ storagePath: string; filename: string; mimeType: string; sizeBytes: number }> {
  const dir = path.join(getUploadDir(), submissionId);
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name) || (file.type.includes("pdf") ? ".pdf" : ".pptx");
  const storageName = `deck-v${version}-${randomUUID()}${ext}`;
  const storagePath = path.join(dir, storageName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, buffer);
  return {
    storagePath,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

export async function removeSavedDeckFile(storagePath: string): Promise<void> {
  try {
    await unlink(storagePath);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    if (code !== "ENOENT") throw error;
  }
}
