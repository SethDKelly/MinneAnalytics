"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MudacJudgeType } from "@prisma/client";
import { MUDAC_JUDGE_TYPE_LABELS } from "@/lib/mudac/constants";

type Props = {
  eventSlug: string;
  eventName: string;
  requiresCode: boolean;
};

export function MudacJudgeRegistrationForm({
  eventSlug,
  eventName,
  requiresCode,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/mudac/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventSlug,
        name: form.get("name"),
        email: form.get("email"),
        affiliation: form.get("affiliation") || undefined,
        judgeType: form.get("judgeType"),
        registrationCode: form.get("registrationCode") || undefined,
        website: form.get("website"),
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }

    router.push(
      `/mudac/${eventSlug}/register/thanks?token=${encodeURIComponent(data.token)}`
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4">
      <p className="text-sm text-gray-600">
        Register as a volunteer judge for <strong>{eventName}</strong>. You will receive a
        private link to score presentations assigned to your panel.
      </p>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="form-label">Full name</span>
        <input name="name" required className="form-input" autoComplete="name" />
      </label>

      <label className="block text-sm">
        <span className="form-label">Email</span>
        <input
          name="email"
          type="email"
          required
          className="form-input"
          autoComplete="email"
        />
      </label>

      <label className="block text-sm">
        <span className="form-label">Affiliation (optional)</span>
        <input
          name="affiliation"
          className="form-input"
          placeholder="University or company"
          autoComplete="organization"
        />
      </label>

      <label className="block text-sm">
        <span className="form-label">Judge type</span>
        <select name="judgeType" required className="form-input" defaultValue="GENERAL">
          {(Object.keys(MUDAC_JUDGE_TYPE_LABELS) as MudacJudgeType[]).map((type) => (
            <option key={type} value={type}>
              {MUDAC_JUDGE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <span className="form-hint">
          Choose the category that best describes your background. Directors assign judges to
          panel slots by type.
        </span>
      </label>

      {requiresCode && (
        <label className="block text-sm">
          <span className="form-label">Registration code</span>
          <input
            name="registrationCode"
            required
            className="form-input"
            autoComplete="off"
          />
          <span className="form-hint">Provided by tournament organizers at check-in.</span>
        </label>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Registering…" : "Register as judge"}
      </button>
    </form>
  );
}
