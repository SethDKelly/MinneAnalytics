"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  ConferenceStatus,
  DeliverableAssessmentDisposition,
  ReviewerRole,
  SelectionDisposition,
} from "@prisma/client";
import { CapacityWidget } from "./CapacityWidget";
import { SponsorSessionBadge } from "./StatusBadge";
import { TechnicalityBalance } from "./TechnicalityBalance";
import { TechnicalityHeatmap } from "./TechnicalityHeatmap";
import { ThemeCoverageHeatmap } from "./ThemeCoverageHeatmap";
import { ThemeGapPanel } from "./ThemeGapPanel";
import type { HeatmapMatrix } from "@/lib/chair-heatmaps";
import type { CapacitySnapshot } from "@/lib/capacity";
import type { DeckQueueItem } from "@/lib/decks";
import type { ChairProgramItem } from "@/lib/review-blind";
import { ScoreVersionSummaryLine } from "./ScoreVersionSummary";
import { RescoreIndicator } from "./RescoreIndicator";
import { RevisionBadge } from "./RevisionBadge";
import { EMPTY_AGGREGATE } from "@/lib/scoring";
import { formatScore } from "@/lib/scoring-scale";
import { TECHNICAL_LABELS } from "@/lib/constants";
import type { TechnicalityRow } from "@/lib/program-balance";
import type { ThemeCountRow } from "@/lib/theme-stats";
import { ChairCommunicationsTab } from "./ChairCommunicationsTab";
import {
  canExportCsv,
  canPublishDeckArchive,
  canSetDeckShareable,
  canSetVipRegistered,
  canViewHistoricalCommittee,
  isBoard,
  roleDisplayName,
} from "@/lib/roles";

type Tab = "program" | "decks" | "balance" | "communications" | "history";

type Props = {
  token: string;
  role: ReviewerRole;
  label: string;
  dashboardTitle: string;
  programNeedsScore: ChairProgramItem[];
  programScoredByMe: ChairProgramItem[];
  blindReviewEnabled: boolean;
  capacity: CapacitySnapshot;
  allScores: Record<string, { reviewer: string; value: number; notes: string | null }[]>;
  deckQueue: DeckQueueItem[];
  conferenceSlug: string;
  conferenceName: string;
  conferenceStatus: ConferenceStatus;
  decksPublished: boolean;
  decksPublishedAt: string | null;
  themeStats: ThemeCountRow[];
  themeStatusHeatmap: HeatmapMatrix;
  technicalityThemeHeatmap: HeatmapMatrix;
  technicalityRows: TechnicalityRow[];
  approvedCount: number;
  readOnly: boolean;
  archivedConferences: { slug: string; name: string; submissionCount: number }[];
  viewingArchiveSlug: string | null;
  themes: { id: string; name: string }[];
};

function SemanticPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "good" | "warn" }) {
  const classes =
    tone === "good"
      ? "bg-green-100 text-green-900"
      : tone === "warn"
        ? "bg-amber-100 text-amber-900"
        : "bg-gray-100 text-gray-800";
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
}

export function ChairDashboard({
  token,
  role,
  label,
  dashboardTitle,
  programNeedsScore: initialNeedsScore,
  programScoredByMe: initialScoredByMe,
  blindReviewEnabled,
  capacity,
  allScores,
  deckQueue,
  conferenceSlug,
  conferenceName,
  conferenceStatus,
  decksPublished: initialDecksPublished,
  decksPublishedAt,
  themeStats,
  themeStatusHeatmap,
  technicalityThemeHeatmap,
  technicalityRows,
  approvedCount,
  readOnly,
  archivedConferences,
  viewingArchiveSlug,
  themes,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("program");
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [sponsorFilter, setSponsorFilter] = useState<"all" | "sponsor" | "community">("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [decksPublished, setDecksPublished] = useState(initialDecksPublished);
  const board = isBoard(role);

  const applyFilters = (items: ChairProgramItem[]) =>
    items.filter((item) => {
      if (themeFilter && !item.themeIds.includes(themeFilter)) return false;
      if (sponsorFilter === "sponsor" && !item.isSponsorSession) return false;
      if (sponsorFilter === "community" && item.isSponsorSession) return false;
      return true;
    });
  const needsScore = applyFilters(initialNeedsScore);
  const scoredByMe = applyFilters(initialScoredByMe);
  const programItems = [...needsScore, ...scoredByMe];

  async function setSelection(
    submissionId: string,
    disposition: SelectionDisposition | null,
    force = false
  ) {
    setLoading(`${submissionId}:selection`);
    const res = await fetch("/api/chair/selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, disposition, force }),
    });
    setLoading(null);
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 && data.requiresConfirm) {
      if (confirm(`${data.warning}\n\nSelect anyway?`)) {
        await setSelection(submissionId, disposition, true);
      }
      return;
    }
    if (res.ok) router.refresh();
    else alert(data.error ?? "Selection action failed");
  }

  async function assessDeck(
    submissionId: string,
    disposition: DeliverableAssessmentDisposition
  ) {
    setLoading(`${submissionId}:assessment`);
    const res = await fetch("/api/chair/deliverable-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, disposition }),
    });
    setLoading(null);
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.refresh();
    else alert(data.error ?? "Deliverable assessment failed");
  }

  async function setVipRegistered(submissionId: string, registered: boolean) {
    setLoading(`${submissionId}:vip`);
    const res = await fetch("/api/chair/vip-registered", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, registered }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? "Could not update VIP registration");
  }

  async function setSponsorSession(submissionId: string, isSponsorSession: boolean) {
    setLoading(`${submissionId}:sponsor`);
    const res = await fetch("/api/chair/sponsor-session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, isSponsorSession }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? "Could not update sponsor classification");
  }

  async function setShareable(submissionId: string, shareable: boolean) {
    setLoading(`${submissionId}:share`);
    const res = await fetch("/api/chair/deck-shareable", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, shareable }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? "Could not update sharing policy");
  }

  async function toggleArchivePublish(publish: boolean) {
    if (publish && !confirm("Publish all currently eligible exact deck ArtifactVersions?")) return;
    setLoading("publish");
    const res = await fetch("/api/chair/publish-archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, publish }),
    });
    setLoading(null);
    if (res.ok) {
      setDecksPublished(publish);
      router.refresh();
    } else alert((await res.json()).error ?? "Publication action failed");
  }

  const participatingItems = programItems.filter((item) => item.semantic.participation.effective);
  const vipRegisteredCount = participatingItems.filter((item) => item.vipRegistered).length;
  const deckFiles = deckQueue.filter((item) => item.deckFileId);
  const decksPendingReview = deckQueue.filter((item) => item.readiness === "awaiting-review");
  const deckDownloadUrl = (fileId: string) =>
    `/api/decks/download?token=${encodeURIComponent(token)}&fileId=${encodeURIComponent(fileId)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-minne-navy">{dashboardTitle}</h1>
      <p className="mt-1 text-gray-700">
        {label} · {roleDisplayName(role)} — {conferenceName}
      </p>

      {readOnly && (
        <p className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Read-only view</strong>
          {viewingArchiveSlug
            ? ` — historical archive for ${conferenceName}.`
            : ` — lifecycle presentation is ${conferenceStatus}.`}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!readOnly && (
          <Link href={`/review/${token}`} className="btn-secondary">
            Evaluate abstracts
          </Link>
        )}
        {board && !readOnly && (
          <Link href={`/schedule/${token}`} className="btn-primary text-white no-underline">
            Schedule builder
          </Link>
        )}
        {canExportCsv(role) && (
          <a href={`/api/chair/export?token=${encodeURIComponent(token)}`} className="btn-secondary no-underline">
            Export CSV
          </a>
        )}
        {decksPublished && (
          <Link href={`/archive/${conferenceSlug}`} className="btn-secondary" target="_blank">
            Public archive ↗
          </Link>
        )}
      </div>

      <div className="mt-6">
        <CapacityWidget cap={capacity} />
      </div>
      {participatingItems.length > 0 && (
        <p className="mt-4 text-sm text-gray-700">
          VIP event registration: <strong>{vipRegisteredCount} / {participatingItems.length}</strong>{" "}
          participating talks registered
        </p>
      )}

      <div className="mt-6 flex flex-wrap border-b border-gray-200">
        {(["program", "decks", "balance"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`px-4 py-2 text-sm font-semibold ${
              tab === key ? "border-b-2 border-minne-navy text-minne-navy" : "text-gray-600"
            }`}
            onClick={() => setTab(key)}
          >
            {key === "program"
              ? `Program (${programItems.length})`
              : key === "decks"
                ? `Decks (${deckQueue.length}${decksPendingReview.length ? ` · ${decksPendingReview.length} to review` : ""})`
                : "Balance"}
          </button>
        ))}
        {board && (
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold ${
              tab === "communications" ? "border-b-2 border-minne-navy text-minne-navy" : "text-gray-600"
            }`}
            onClick={() => setTab("communications")}
          >
            Communications
          </button>
        )}
        {canViewHistoricalCommittee(role) && archivedConferences.length > 0 && (
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold ${
              tab === "history" ? "border-b-2 border-minne-navy text-minne-navy" : "text-gray-600"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        )}
      </div>

      {tab === "balance" && (
        <section className="mt-6 space-y-6">
          <ThemeGapPanel rows={themeStats} />
          <ThemeCoverageHeatmap data={themeStatusHeatmap} />
          <TechnicalityBalance rows={technicalityRows} approvedCount={approvedCount} />
          <TechnicalityHeatmap data={technicalityThemeHeatmap} approvedCount={approvedCount} />
        </section>
      )}

      {tab === "communications" && (
        <ChairCommunicationsTab token={token} readOnly={readOnly} conferenceName={conferenceName} />
      )}

      {tab === "history" && (
        <section className="mt-6 card">
          <h2 className="text-lg font-bold text-minne-navy">Archived conferences</h2>
          <ul className="mt-4 space-y-2">
            {archivedConferences.map((conference) => (
              <li key={conference.slug}>
                <Link
                  href={`/chair/${token}?archive=${conference.slug}`}
                  className={`text-minne-navy underline ${
                    viewingArchiveSlug === conference.slug ? "font-bold" : ""
                  }`}
                >
                  {conference.name}
                </Link>
                <span className="ml-2 text-sm text-gray-500">
                  {conference.submissionCount} Proposals
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "program" && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Session type:</span>
            {(["all", "sponsor", "community"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`rounded px-2 py-1 text-xs ${
                  sponsorFilter === key ? "bg-violet-700 text-white" : "bg-gray-100"
                }`}
                onClick={() => setSponsorFilter(key)}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Theme:</span>
            <button
              type="button"
              className={`rounded px-2 py-1 text-xs ${!themeFilter ? "bg-minne-navy text-white" : "bg-gray-100"}`}
              onClick={() => setThemeFilter(null)}
            >
              All
            </button>
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`rounded px-2 py-1 text-xs ${
                  themeFilter === theme.id ? "bg-minne-navy text-white" : "bg-gray-100"
                }`}
                onClick={() => setThemeFilter(theme.id)}
              >
                {theme.name}
              </button>
            ))}
          </div>
          {blindReviewEnabled && (
            <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Protected committee aggregates are visible here only after your Evaluation for the
              exact current Revision.
            </p>
          )}
          {blindReviewEnabled ? (
            <>
              <ProgramListSection
                title="Awaiting your current Evaluation"
                items={needsScore}
                allScores={allScores}
                board={board}
                readOnly={readOnly}
                loading={loading}
                setSelection={setSelection}
                setVipRegistered={setVipRegistered}
                setSponsorSession={setSponsorSession}
                role={role}
              />
              <ProgramListSection
                title="Current Evaluations"
                items={scoredByMe}
                allScores={allScores}
                board={board}
                readOnly={readOnly}
                loading={loading}
                setSelection={setSelection}
                setVipRegistered={setVipRegistered}
                setSponsorSession={setSponsorSession}
                role={role}
                className="mt-10 border-t border-gray-200 pt-8"
              />
            </>
          ) : (
            <ProgramListSection
              title="Program"
              items={scoredByMe}
              allScores={allScores}
              board={board}
              readOnly={readOnly}
              loading={loading}
              setSelection={setSelection}
              setVipRegistered={setVipRegistered}
              setSponsorSession={setSponsorSession}
              role={role}
            />
          )}
        </>
      )}

      {tab === "decks" && (
        <section className="mt-6 space-y-6">
          {board && (
            <div className="card border-minne-navy/20">
              <h2 className="text-lg font-bold text-minne-navy">Exact deck Publications</h2>
              <p className="mt-1 text-sm text-gray-700">
                The collection gate controls whether the public archive is exposed. Individual
                Publication state remains bound to an exact ArtifactVersion and current eligibility.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SemanticPill label={decksPublished ? "Public surface enabled" : "Public surface disabled"} tone={decksPublished ? "good" : "neutral"} />
                {decksPublishedAt && <span className="text-xs text-gray-500">Since {new Date(decksPublishedAt).toLocaleString()}</span>}
                {canPublishDeckArchive(role) && (
                  <button
                    type="button"
                    className={decksPublished ? "btn-danger" : "btn-primary"}
                    disabled={!!loading || (!decksPublished && deckFiles.length === 0)}
                    onClick={() => toggleArchivePublish(!decksPublished)}
                  >
                    {decksPublished ? "Unpublish eligible material" : "Publish eligible material"}
                  </button>
                )}
              </div>
            </div>
          )}

          {deckQueue.length === 0 ? (
            <p className="text-gray-600 italic">No effectively participating talks.</p>
          ) : (
            <ul className="space-y-4">
              {deckQueue.map((deck) => (
                <li key={deck.submissionId} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-minne-navy">{deck.title}</h2>
                      <p className="text-sm text-gray-600">{deck.presenters} · {deck.organization}</p>
                      {deck.deckFilename && <p className="mt-1 text-xs text-gray-500">ArtifactVersion v{deck.deckVersion} · {deck.deckFilename}</p>}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <SemanticPill label={`Deck: ${deck.readinessLabel}`} tone={deck.readiness === "ready" ? "good" : deck.readiness === "concern" ? "warn" : "neutral"} />
                      <SemanticPill label={`Sharing: ${deck.shareEligible ? "eligible" : "ineligible"}`} tone={deck.shareEligible ? "good" : "warn"} />
                      <SemanticPill label={`Public: ${deck.publicationAvailability}`} tone={deck.publicationAvailability === "published" ? "good" : "neutral"} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {deck.deckFileId ? (
                      <a href={deckDownloadUrl(deck.deckFileId)} className="btn-secondary text-sm no-underline">Download exact deck</a>
                    ) : (
                      <span className="text-sm italic text-gray-500">Awaiting ArtifactVersion</span>
                    )}
                    {board && deck.deckFileId && !readOnly && (
                      <>
                        <button type="button" className="btn-primary text-xs" disabled={!!loading} onClick={() => assessDeck(deck.submissionId, "READY")}>Mark ready</button>
                        <button type="button" className="btn-secondary text-xs" disabled={!!loading} onClick={() => assessDeck(deck.submissionId, "CONCERN")}>Request changes</button>
                      </>
                    )}
                    {canSetDeckShareable(role) && deck.deckFileId && !readOnly && (
                      <button type="button" className="btn-secondary text-xs" disabled={!!loading} onClick={() => setShareable(deck.submissionId, !deck.shareEligible)}>
                        {deck.shareEligible ? "Revoke sharing eligibility" : "Allow sharing"}
                      </button>
                    )}
                    {canSetVipRegistered(role) && !readOnly && (
                      <button type="button" className="btn-secondary text-xs" disabled={!!loading} onClick={() => setVipRegistered(deck.submissionId, !deck.vipRegistered)}>
                        {deck.vipRegistered ? "Clear VIP registration" : "Mark VIP registered"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function ProgramListSection({
  title,
  items,
  allScores,
  board,
  readOnly,
  loading,
  setSelection,
  setVipRegistered,
  setSponsorSession,
  role,
  className = "mt-8",
}: {
  title: string;
  items: ChairProgramItem[];
  allScores: Record<string, { reviewer: string; value: number; notes: string | null }[]>;
  board: boolean;
  readOnly: boolean;
  loading: string | null;
  setSelection: (submissionId: string, disposition: SelectionDisposition | null, force?: boolean) => void;
  setVipRegistered: (submissionId: string, registered: boolean) => void;
  setSponsorSession: (submissionId: string, isSponsorSession: boolean) => void;
  role: ReviewerRole;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className={className}>
      <h2 className="text-xl font-bold text-minne-navy">{title}</h2>
      <ul className="mt-4 space-y-6">
        {items.map((item) => {
          const aggregate = item.aggregate ?? EMPTY_AGGREGATE;
          const withdrawn = item.semantic.withdrawal.withdrawn;
          const disposition = item.semantic.selection.disposition;
          return (
            <li key={item.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-minne-navy">{item.title}</h3>
                    <RevisionBadge version={item.semantic.revision.ordinal} />
                    {item.isSponsorSession && <SponsorSessionBadge />}
                    {item.myEvaluationState !== "current-revision" && item.myScore && <RescoreIndicator version={item.semantic.revision.ordinal} />}
                  </div>
                  <p className="text-sm text-gray-600">{item.presenterSubtitle}</p>
                  <ScoreVersionSummaryLine summary={item.revisionSummary} />
                  {item.themeNames.length > 0 && <p className="mt-1 text-sm text-gray-600">Themes: {item.themeNames.join(", ")}</p>}
                  <p className="mt-1 text-sm">Technical {item.technicalLevel}: {TECHNICAL_LABELS[item.technicalLevel]}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <SemanticPill label={`Selection: ${item.semanticLabels.selection}`} tone={disposition === "SELECTED" ? "good" : "neutral"} />
                  <SemanticPill label={`Participation: ${item.semanticLabels.participation}`} tone={item.semantic.participation.effective ? "good" : withdrawn ? "warn" : "neutral"} />
                  <SemanticPill label={`Deck: ${item.semanticLabels.deliverable}`} tone={item.semantic.deliverable.readiness === "ready" ? "good" : item.semantic.deliverable.readiness === "concern" ? "warn" : "neutral"} />
                  {board && item.semantic.participation.effective && <SemanticPill label={`Sharing: ${item.semantic.sharing.eligible ? "eligible" : "ineligible"}`} />}
                  {item.semantic.participation.effective && <SemanticPill label={`VIP: ${item.vipRegistered ? "registered" : "not registered"}`} />}
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-gray-800">{item.abstract}</p>
              {item.committeeScoresVisible && aggregate.count > 0 && (
                <p className="mt-2 text-sm font-semibold text-minne-navy">Current-Revision average {aggregate.average.toFixed(2)} ({aggregate.count} evaluator{aggregate.count === 1 ? "" : "s"})</p>
              )}
              {item.committeeScoresVisible && allScores[item.id]?.length > 0 && (
                <ul className="mt-3 space-y-1 rounded bg-gray-50 p-3 text-xs">
                  {allScores[item.id].map((score, index) => <li key={index}><strong>{score.reviewer}:</strong> {formatScore(score.value)}{score.notes ? ` — ${score.notes}` : ""}</li>)}
                </ul>
              )}
              {!readOnly && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {board && !withdrawn && (
                    <button type="button" className="btn-secondary text-xs" disabled={!!loading} onClick={() => setSponsorSession(item.id, !item.isSponsorSession)}>
                      {item.isSponsorSession ? "Clear sponsor session" : "Mark sponsor session"}
                    </button>
                  )}
                  {board && !withdrawn && disposition === null && (
                    <>
                      <button type="button" className="btn-primary" disabled={!!loading} onClick={() => setSelection(item.id, "SELECTED")}>Select</button>
                      <button type="button" className="btn-secondary" disabled={!!loading} onClick={() => setSelection(item.id, "RESERVE")}>Reserve</button>
                      <button type="button" className="btn-danger" disabled={!!loading} onClick={() => setSelection(item.id, "NOT_SELECTED")}>Not selected</button>
                    </>
                  )}
                  {board && !withdrawn && disposition === "RESERVE" && <button type="button" className="btn-primary" disabled={!!loading} onClick={() => setSelection(item.id, "SELECTED")}>Select from reserve</button>}
                  {board && !withdrawn && disposition !== null && <button type="button" className="btn-secondary text-xs" disabled={!!loading} onClick={() => setSelection(item.id, null)}>Clear Selection decision</button>}
                  {canSetVipRegistered(role) && item.semantic.participation.effective && <button type="button" className="btn-secondary text-xs" disabled={!!loading} onClick={() => setVipRegistered(item.id, !item.vipRegistered)}>{item.vipRegistered ? "Clear VIP registration" : "Mark VIP registered"}</button>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
