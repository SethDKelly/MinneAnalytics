"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ConferenceStatus } from "@prisma/client";
import { roleCapabilitySummary, roleDisplayName } from "@/lib/roles";

type ThemeRow = {
  id: string;
  name: string;
  slug: string;
  source: "ADMIN" | "PRESENTER";
  targetMin: number;
  targetMax: number;
  removedAt: string | null;
  usageCount: number;
};

type ArchivedRow = {
  id: string;
  slug: string;
  name: string;
  archivedAt: string | null;
  submissionCount: number;
};

type Props = {
  token: string;
  label: string;
  conference: {
    id: string;
    slug: string;
    name: string;
    status: ConferenceStatus;
    submissionsOpen: boolean;
    submissionsOpenAt: string | null;
    submissionsCloseAt: string | null;
    timezone: string;
    archivedAt: string | null;
  };
  submissionWindowMessage: string;
  themes: ThemeRow[];
  archivedConferences: ArchivedRow[];
};

export function AdminDashboard({
  token,
  label,
  conference,
  submissionWindowMessage,
  themes: initialThemes,
  archivedConferences,
}: Props) {
  const router = useRouter();
  const [themes, setThemes] = useState(initialThemes);
  const [loading, setLoading] = useState<string | null>(null);
  const [submissionsOpen, setSubmissionsOpen] = useState(conference.submissionsOpen);
  const [openAt, setOpenAt] = useState(
    conference.submissionsOpenAt?.slice(0, 16) ?? ""
  );
  const [closeAt, setCloseAt] = useState(
    conference.submissionsCloseAt?.slice(0, 16) ?? ""
  );
  const [newThemeName, setNewThemeName] = useState("");
  const [newTargetMin, setNewTargetMin] = useState(0);
  const [newTargetMax, setNewTargetMax] = useState(0);

  async function patchConference(payload: Record<string, unknown>) {
    setLoading("conf");
    const res = await fetch("/api/admin/conference", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...payload }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Update failed");
    }
  }

  async function addTheme() {
    if (!newThemeName.trim()) return;
    setLoading("theme-add");
    const res = await fetch("/api/admin/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: newThemeName.trim(),
        targetMin: newTargetMin,
        targetMax: newTargetMax,
      }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      setThemes((t) => [...t, data.theme]);
      setNewThemeName("");
      setNewTargetMin(0);
      setNewTargetMax(0);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not add theme");
    }
  }

  async function patchTheme(
    themeId: string,
    payload: Record<string, unknown>
  ) {
    const res = await fetch("/api/admin/themes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, themeId, ...payload }),
    });
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Update failed");
    }
  }

  async function updateThemeTargets(
    themeId: string,
    targetMin: number,
    targetMax: number
  ) {
    await patchTheme(themeId, { targetMin, targetMax });
  }

  async function updateThemeName(themeId: string, name: string) {
    if (!name.trim()) return;
    await patchTheme(themeId, { name: name.trim() });
  }

  async function softRemoveTheme(themeId: string) {
    if (!confirm("Remove this theme from the picker? Talks already tagged will keep the label."))
      return;
    setLoading(themeId);
    await patchTheme(themeId, { removed: true });
    setLoading(null);
    router.refresh();
  }

  async function restoreTheme(themeId: string) {
    setLoading(themeId);
    await patchTheme(themeId, { removed: false });
    setLoading(null);
    router.refresh();
  }

  async function promoteTheme(themeId: string) {
    setLoading(themeId);
    await patchTheme(themeId, { source: "ADMIN" });
    setLoading(null);
    router.refresh();
  }

  async function deleteTheme(themeId: string) {
    if (!confirm("Permanently delete this theme? Only possible when no submissions use it."))
      return;
    setLoading(themeId);
    const res = await fetch(
      `/api/admin/themes?token=${encodeURIComponent(token)}&themeId=${encodeURIComponent(themeId)}`,
      { method: "DELETE" }
    );
    setLoading(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-minne-navy">Site administration</h1>
      <p className="mt-1 text-gray-700">
        {label} · {roleDisplayName("ADMIN")} · {conference.name}
      </p>
      <p className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        {roleCapabilitySummary("ADMIN")}
      </p>

      <section className="mt-8 card">
        <h2 className="text-lg font-bold text-minne-navy">Conference lifecycle</h2>
        <p className="mt-1 text-sm text-gray-600">
          Status: <strong>{conference.status}</strong>
          {conference.archivedAt && (
            <span className="ml-2 text-gray-500">
              (archived {new Date(conference.archivedAt).toLocaleDateString()})
            </span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {conference.status !== "ACTIVE" && (
            <button
              type="button"
              className="btn-primary"
              disabled={!!loading}
              onClick={() => patchConference({ status: "ACTIVE" })}
            >
              Set active
            </button>
          )}
          {conference.status !== "ARCHIVED" && (
            <button
              type="button"
              className="btn-danger"
              disabled={!!loading}
              onClick={() => {
                if (
                  confirm(
                    "Archive this conference? Committee queues become read-only; public submit closes."
                  )
                ) {
                  patchConference({ status: "ARCHIVED" });
                }
              }}
            >
              Archive conference
            </button>
          )}
          {conference.status === "ARCHIVED" && (
            <p className="mt-2 text-sm text-gray-600">
              Board members can open their chair URL with{" "}
              <code className="text-xs">?archive={conference.slug}</code> for read-only
              history.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 card">
        <h2 className="text-lg font-bold text-minne-navy">Submission window</h2>
        <p className="mt-1 text-sm text-gray-600">
          Current: {submissionWindowMessage || "Accepting submissions"}
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={submissionsOpen}
            onChange={(e) => setSubmissionsOpen(e.target.checked)}
          />
          Submissions open (manual override)
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="openAt">
              Opens at (local, optional)
            </label>
            <input
              id="openAt"
              type="datetime-local"
              className="form-input"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="closeAt">
              Closes at (local, optional)
            </label>
            <input
              id="closeAt"
              type="datetime-local"
              className="form-input"
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Timezone: {conference.timezone}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          disabled={!!loading}
          onClick={() =>
            patchConference({
              submissionsOpen,
              submissionsOpenAt: openAt ? new Date(openAt).toISOString() : null,
              submissionsCloseAt: closeAt ? new Date(closeAt).toISOString() : null,
            })
          }
        >
          Save submission window
        </button>
        <p className="mt-4 text-sm">
          Public form:{" "}
          <Link href={`/submit/${conference.slug}`} className="text-minne-navy underline">
            /submit/{conference.slug}
          </Link>
        </p>
      </section>

      <section className="mt-6 card">
        <h2 className="text-lg font-bold text-minne-navy">Theme taxonomy</h2>
        <p className="mt-1 text-sm text-gray-600">
          Official themes and community proposals from presenters. Soft-remove hides a tag from
          new submissions; existing talks keep the label on chair views.
        </p>
        <ul className="mt-4 space-y-3">
          {themes.map((t) => (
            <li
              key={t.id}
              className={`flex flex-wrap items-center gap-3 rounded border p-3 text-sm ${
                t.removedAt
                  ? "border-gray-300 bg-gray-100 opacity-80"
                  : "border-gray-200 bg-white"
              }`}
            >
              <input
                className="min-w-[10rem] flex-1 rounded border px-2 py-1 font-semibold text-minne-navy"
                defaultValue={t.name}
                disabled={!!t.removedAt}
                onBlur={(e) => updateThemeName(t.id, e.target.value)}
              />
              <span className="text-xs text-gray-500">
                {t.source === "ADMIN" ? "Official" : "Community"} · {t.usageCount} talk
                {t.usageCount === 1 ? "" : "s"}
              </span>
              <label className="flex items-center gap-1">
                Min
                <input
                  type="number"
                  min={0}
                  className="w-14 rounded border px-1"
                  defaultValue={t.targetMin}
                  onBlur={(e) =>
                    updateThemeTargets(
                      t.id,
                      Number(e.target.value),
                      t.targetMax
                    )
                  }
                />
              </label>
              <label className="flex items-center gap-1">
                Max
                <input
                  type="number"
                  min={0}
                  className="w-14 rounded border px-1"
                  defaultValue={t.targetMax}
                  onBlur={(e) =>
                    updateThemeTargets(t.id, t.targetMin, Number(e.target.value))
                  }
                />
              </label>
              {t.source === "PRESENTER" && !t.removedAt && (
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  disabled={loading === t.id}
                  onClick={() => promoteTheme(t.id)}
                >
                  Promote to official
                </button>
              )}
              {t.removedAt ? (
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  disabled={loading === t.id}
                  onClick={() => restoreTheme(t.id)}
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-danger text-xs"
                  disabled={loading === t.id}
                  onClick={() => softRemoveTheme(t.id)}
                >
                  Remove from list
                </button>
              )}
              {t.usageCount === 0 && (
                <button
                  type="button"
                  className="text-xs text-red-700 underline"
                  disabled={loading === t.id}
                  onClick={() => deleteTheme(t.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <input
            className="form-input flex-1"
            placeholder="New theme name"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
          />
          <input
            type="number"
            min={0}
            className="form-input w-20"
            placeholder="Min"
            value={newTargetMin}
            onChange={(e) => setNewTargetMin(Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            className="form-input w-20"
            placeholder="Max"
            value={newTargetMax}
            onChange={(e) => setNewTargetMax(Number(e.target.value))}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={!!loading}
            onClick={addTheme}
          >
            Add theme
          </button>
        </div>
      </section>

      {archivedConferences.length > 0 && (
        <section className="mt-6 card">
          <h2 className="text-lg font-bold text-minne-navy">Archived conferences</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {archivedConferences.map((c) => (
              <li key={c.id} className="flex justify-between gap-2">
                <span>
                  {c.name}{" "}
                  <span className="text-gray-500">
                    ({c.submissionCount} submissions)
                  </span>
                </span>
                <Link
                  href={`/archive/${c.slug}`}
                  className="text-minne-navy underline"
                >
                  Public archive
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
