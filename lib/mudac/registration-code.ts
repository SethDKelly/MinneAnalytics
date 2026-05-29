import { createHash } from "crypto";

export function hashRegistrationCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function verifyRegistrationCode(code: string, hash: string | null): boolean {
  if (!hash) return true;
  if (!code.trim()) return false;
  return hashRegistrationCode(code) === hash;
}
