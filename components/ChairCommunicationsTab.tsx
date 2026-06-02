"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { EmailTemplateKey } from "@prisma/client";
import type { TemplateCommunicationsRow } from "@/lib/conference-email-data";

type Props = {
  token: string;
  readOnly: boolean;
  conferenceName: string;
};

type RecipientRow = {
  kind: string;
  id: string;
  email: string;
  label: string;
};

export function ChairCommunicationsTab({ token, readOnly, conferenceName }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateCommunicationsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<EmailTemplateKey | null>(null);
  const [preview, setPreview] = useState<{
    subject: string;
    body: string;
    recipientLabel: string;
    recipientEmail: string;
  } | null>(null);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [round, setRound] = useState(1);
  const [customIntro, setCustomIntro] = useState("");
  const [includeAlreadyEmailed, setIncludeAlreadyEmailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/chair/email-templates?token=${encodeURIComponent(token)}`
    );
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setTemplates(data.templates ?? []);
  }, [token]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  async function loadRecipients(key: EmailTemplateKey, r: number) {
    const res = await fetch(
      `/api/chair/email-templates/${key}/recipients?token=${encodeURIComponent(token)}&round=${r}&includeAlreadyEmailed=${includeAlreadyEmailed ? "1" : "0"}`
    );
    const data = await res.json();
    if (res.ok) setRecipients(data.recipients ?? []);
    else setRecipients([]);
  }

  async function openTemplate(key: EmailTemplateKey) {
    setActiveKey(activeKey === key ? null : key);
    setPreview(null);
    setError(null);
    const row = templates.find((t) => t.templateKey === key);
    const r = key === "DECLINE" ? row?.nextDeclineRound ?? 1 : 1;
    setRound(r);
    setCustomIntro("");
    if (activeKey !== key) {
      await loadRecipients(key, r);
    }
  }

  useEffect(() => {
    if (activeKey) loadRecipients(activeKey, round);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeAlreadyEmailed, round, activeKey]);

  async function runPreview(key: EmailTemplateKey) {
    setBusy("preview");
    setError(null);
    const params = new URLSearchParams({ token });
    if (customIntro) params.set("customIntro", customIntro);
    const res = await fetch(
      `/api/chair/email-templates/${key}/preview?${params}`
    );
    setBusy(null);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Preview failed");
      return;
    }
    setPreview(data.preview);
  }

  async function runSend(key: EmailTemplateKey) {
    if (
      !confirm(
        `Send "${key}" to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"} for ${conferenceName}?`
      )
    ) {
      return;
    }
    setBusy("send");
    setError(null);
    const res = await fetch(`/api/chair/email-templates/${key}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        round: key === "DECLINE" ? round : 1,
        customIntro: key === "DECLINE" ? customIntro : undefined,
        includeAlreadyEmailed,
      }),
    });
    setBusy(null);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Send failed");
      return;
    }
    alert(
      `Queued ${data.recipientCount} email${data.recipientCount === 1 ? "" : "s"} (stub logged to server console).`
    );
    await loadTemplates();
    router.refresh();
    setActiveKey(null);
  }

  if (loading) {
    return <p className="mt-6 text-sm text-gray-600">Loading communications…</p>;
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-minne-navy">Email templates</h2>
      <p className="mt-1 text-sm text-gray-600">
        Global templates with per-conference send history. Delivery is stubbed to the dev
        server console — check the terminal running <code className="text-xs">npm run dev</code>.
      </p>
      {readOnly && (
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Read-only — cannot send while viewing an archived or inactive conference.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {templates.map((t) => (
          <li key={t.templateKey} className="card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-minne-navy">{t.name}</h3>
                <p className="text-sm text-gray-600">{t.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Last sent:{" "}
                  {t.lastBatch ? (
                    <>
                      {new Date(t.lastBatch.sentAt).toLocaleString()} (Round{" "}
                      {t.lastBatch.round}, {t.lastBatch.recipientCount} recipients, by{" "}
                      {t.lastBatch.sentByLabel})
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => openTemplate(t.templateKey)}
              >
                {activeKey === t.templateKey ? "Close" : "Send / preview"}
              </button>
            </div>

            {t.batches.length > 0 && (
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-minne-navy underline">
                  Batch history ({t.batches.length})
                </summary>
                <ul className="mt-2 space-y-1 text-gray-700">
                  {t.batches.map((b) => (
                    <li key={b.id}>
                      Round {b.round} · {new Date(b.sentAt).toLocaleString()} ·{" "}
                      {b.recipientCount} recipients · {b.sentByLabel}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {activeKey === t.templateKey && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {t.templateKey === "DECLINE" && (
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="form-label" htmlFor={`round-${t.templateKey}`}>
                        Decline round
                      </label>
                      <input
                        id={`round-${t.templateKey}`}
                        type="number"
                        min={1}
                        className="form-input"
                        value={round}
                        onChange={(e) => setRound(Number(e.target.value) || 1)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Suggested next: Round {t.nextDeclineRound}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label" htmlFor={`intro-${t.templateKey}`}>
                        Optional intro (prepended to decline body)
                      </label>
                      <textarea
                        id={`intro-${t.templateKey}`}
                        className="form-input"
                        rows={2}
                        value={customIntro}
                        onChange={(e) => setCustomIntro(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeAlreadyEmailed}
                    onChange={(e) => setIncludeAlreadyEmailed(e.target.checked)}
                  />
                  Include recipients already emailed for this template and round
                </label>

                <p className="mt-3 text-sm text-gray-700">
                  <strong>{recipients.length}</strong> eligible recipient
                  {recipients.length === 1 ? "" : "s"}
                  {recipients.length > 0 && recipients.length <= 8 && (
                    <span className="block text-xs text-gray-500">
                      {recipients.map((r) => r.label).join(" · ")}
                    </span>
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    disabled={!!busy}
                    onClick={() => runPreview(t.templateKey)}
                  >
                    {busy === "preview" ? "Loading…" : "Preview sample"}
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      className="btn-primary text-sm"
                      disabled={!!busy || recipients.length === 0}
                      onClick={() => runSend(t.templateKey)}
                    >
                      {busy === "send" ? "Sending…" : `Send to ${recipients.length}`}
                    </button>
                  )}
                </div>

                {preview && (
                  <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                    <p className="text-xs text-gray-500">
                      Preview for {preview.recipientLabel} ({preview.recipientEmail})
                    </p>
                    <p className="mt-2 font-semibold">Subject: {preview.subject}</p>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-gray-800">
                      {preview.body}
                    </pre>
                  </div>
                )}

                {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
