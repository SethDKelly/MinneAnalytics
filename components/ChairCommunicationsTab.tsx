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
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/chair/email-templates?token=${encodeURIComponent(token)}`);
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setTemplates(data.templates ?? []);
  }, [token]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  async function loadRecipients(key: EmailTemplateKey, requestedRound: number) {
    const res = await fetch(
      `/api/chair/email-templates/${key}/recipients?token=${encodeURIComponent(token)}&round=${requestedRound}`
    );
    const data = await res.json();
    if (res.ok) setRecipients(data.semantic?.recipients?.map((recipient: { kind: string; id: string; endpoint: string; label: string }) => ({
      kind: recipient.kind,
      id: recipient.id,
      email: recipient.endpoint,
      label: recipient.label,
    })) ?? data.recipients ?? []);
    else {
      setRecipients([]);
      setError(data.error ?? "Could not resolve Dispatch audience");
    }
  }

  async function openTemplate(key: EmailTemplateKey) {
    const opening = activeKey !== key;
    setActiveKey(opening ? key : null);
    setPreview(null);
    setError(null);
    const row = templates.find((template) => template.templateKey === key);
    const requestedRound = key === "DECLINE" ? row?.nextDeclineRound ?? 1 : 1;
    setRound(requestedRound);
    setCustomIntro("");
    if (opening) await loadRecipients(key, requestedRound);
  }

  useEffect(() => {
    if (activeKey) loadRecipients(activeKey, round);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, activeKey]);

  async function runPreview(key: EmailTemplateKey) {
    setBusy("preview");
    setError(null);
    const params = new URLSearchParams({ token });
    if (customIntro) params.set("customIntro", customIntro);
    const res = await fetch(`/api/chair/email-templates/${key}/preview?${params}`);
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
        `Send "${key}" round ${round} to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"} for ${conferenceName}?`
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
        round,
        customIntro: key === "DECLINE" ? customIntro : undefined,
      }),
    });
    setBusy(null);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Send failed");
      return;
    }
    alert(
      `Performed ${data.recipientCount} Dispatch${data.recipientCount === 1 ? "" : "es"} in round ${round}. Same-round repeats are idempotent.`
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
      <h2 className="text-lg font-bold text-minne-navy">Operational Dispatch</h2>
      <p className="mt-1 text-sm text-gray-600">
        Audiences are resolved from current semantic state. Exact rendered messages and recipient
        endpoints are prepared before provider handoff. Repeating contact intentionally requires a
        new round; the same round never means “send it again anyway.”
      </p>
      {readOnly && (
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Historical view. Post-Archive Dispatch remains limited to purposes explicitly allowed by
          lifecycle policy, such as the feedback request.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {templates.map((template) => (
          <li key={template.templateKey} className="card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-minne-navy">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Last performed:{" "}
                  {template.lastBatch ? (
                    <>
                      {new Date(template.lastBatch.sentAt).toLocaleString()} (Round{" "}
                      {template.lastBatch.round}, {template.lastBatch.recipientCount} recipients,
                      by {template.lastBatch.sentByLabel})
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => openTemplate(template.templateKey)}
              >
                {activeKey === template.templateKey ? "Close" : "Send / preview"}
              </button>
            </div>

            {template.batches.length > 0 && (
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-minne-navy underline">
                  Batch history ({template.batches.length})
                </summary>
                <ul className="mt-2 space-y-1 text-gray-700">
                  {template.batches.map((batch) => (
                    <li key={batch.id}>
                      Round {batch.round} · {new Date(batch.sentAt).toLocaleString()} ·{" "}
                      {batch.recipientCount} recipients · {batch.sentByLabel}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {activeKey === template.templateKey && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="form-label" htmlFor={`round-${template.templateKey}`}>
                      Dispatch round
                    </label>
                    <input
                      id={`round-${template.templateKey}`}
                      type="number"
                      min={1}
                      className="form-input"
                      value={round}
                      onChange={(event) => setRound(Number(event.target.value) || 1)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use the same round for retry/idempotent replay. Increment it only for an
                      intentional repeat contact.
                    </p>
                    {template.templateKey === "DECLINE" && (
                      <p className="mt-1 text-xs text-gray-500">
                        Suggested next decline round: {template.nextDeclineRound}
                      </p>
                    )}
                  </div>
                  {template.templateKey === "DECLINE" && (
                    <div className="sm:col-span-2">
                      <label className="form-label" htmlFor={`intro-${template.templateKey}`}>
                        Optional intro
                      </label>
                      <textarea
                        id={`intro-${template.templateKey}`}
                        className="form-input"
                        rows={2}
                        value={customIntro}
                        onChange={(event) => setCustomIntro(event.target.value)}
                      />
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm text-gray-700">
                  <strong>{recipients.length}</strong> eligible recipient
                  {recipients.length === 1 ? "" : "s"} in semantic round {round}
                  {recipients.length > 0 && recipients.length <= 8 && (
                    <span className="block text-xs text-gray-500">
                      {recipients.map((recipient) => recipient.label).join(" · ")}
                    </span>
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    disabled={!!busy}
                    onClick={() => runPreview(template.templateKey)}
                  >
                    {busy === "preview" ? "Loading…" : "Preview sample"}
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      className="btn-primary text-sm"
                      disabled={!!busy || recipients.length === 0}
                      onClick={() => runSend(template.templateKey)}
                    >
                      {busy === "send" ? "Sending…" : `Send round ${round} to ${recipients.length}`}
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
