"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CapacityWidget } from "./CapacityWidget";
import {
  DeckStatusBadge,
  ProgramStatusBadge,
  SponsorSessionBadge,
} from "./StatusBadge";
import { TechnicalityBalance } from "./TechnicalityBalance";
import { ThemeGapPanel } from "./ThemeGapPanel";
import type { CapacitySnapshot } from "@/lib/capacity";
import type { DeckQueueItem } from "@/lib/decks";
import type { ChairProgramItem } from "@/lib/review-blind";
import { ScoreVersionSummaryLine } from "./ScoreVersionSummary";
import { RescoreIndicator } from "./RescoreIndicator";
import { RevisionBadge } from "./RevisionBadge";
import { AbstractReviewStatusBadge } from "./StatusBadge";
import { EMPTY_AGGREGATE } from "@/lib/scoring";
import { formatScore } from "@/lib/scoring-scale";
import { TECHNICAL_LABELS } from "@/lib/constants";
import type { ConferenceStatus, ReviewerRole } from "@prisma/client";
import type { TechnicalityRow } from "@/lib/program-balance";
import type { ThemeCountRow } from "@/lib/theme-stats";
import { ChairCommunicationsTab } from "./ChairCommunicationsTab";
import {
  canExportCsv,
  canPublishDeckArchive,
  canSetDeckShareable,
  canSetProgramStatus,
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
  technicalityRows: TechnicalityRow[];
  approvedCount: number;
  readOnly: boolean;
  archivedConferences: { slug: string; name: string; submissionCount: number }[];
  viewingArchiveSlug: string | null;
  themes: { id: string; name: string }[];
};

export function ChairDashboard({
  token,
  role,
  label,
  dashboardTitle,
  programNeedsScore: initialNeedsScore,
  programScoredByMe: initialScoredByMe,
  blindReviewEnabled,
  capacity: initialCapacity,
  allScores,
  deckQueue: initialDeckQueue,
  conferenceSlug,
  conferenceName,
  conferenceStatus,
  decksPublished: initialDecksPublished,
  decksPublishedAt,
  themeStats,
  technicalityRows,
  approvedCount,
  readOnly,
  archivedConferences,
  viewingArchiveSlug,
  themes,
}: Props) {
  const router = useRouter();
  const capacity = initialCapacity;
  const deckQueue = initialDeckQueue;
  const [tab, setTab] = useState<Tab>("program");
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [sponsorFilter, setSponsorFilter] = useState<"all" | "sponsor" | "community">(
    "all"
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [decksPublished, setDecksPublished] = useState(initialDecksPublished);
  const board = isBoard(role);

  const filterByTheme = (list: ChairProgramItem[]) =>
    themeFilter ? list.filter((i) => i.themeIds.includes(themeFilter)) : list;
  const filterBySponsor = (list: ChairProgramItem[]) => {
    if (sponsorFilter === "sponsor") return list.filter((i) => i.isSponsorSession);
    if (sponsorFilter === "community") return list.filter((i) => !i.isSponsorSession);
    return list;
  };
  const applyFilters = (list: ChairProgramItem[]) =>
    filterBySponsor(filterByTheme(list));
  const needsScore = applyFilters(initialNeedsScore);
  const scoredByMe = applyFilters(initialScoredByMe);
  const programItems = [...needsScore, ...scoredByMe];

  async function setStatus(submissionId: string, status: string, force = false) {
    setLoading(submissionId + status);
    const res = await fetch("/api/chair/program-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, status, force }),
    });
    setLoading(null);
    if (res.status === 409) {
      const data = await res.json();
      if (data.requiresConfirm && confirm(`${data.warning}\n\nApprove anyway?`)) {
        await setStatus(submissionId, status, true);
      }
      return;
    }
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Action failed");
    }
  }

  async function setDeckStatus(submissionId: string, deckStatus: string) {
    setLoading(submissionId + deckStatus);
    const res = await fetch("/api/chair/deck-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, deckStatus }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Deck update failed");
    }
  }

  async function setVipRegistered(submissionId: string, registered: boolean) {
    setLoading(submissionId + "vip");
    const res = await fetch("/api/chair/vip-registered", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, registered }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Could not update VIP registration");
    }
  }

  async function setSponsorSession(submissionId: string, isSponsorSession: boolean) {
    setLoading(submissionId + (isSponsorSession ? "sponsor" : "community"));
    const res = await fetch("/api/chair/sponsor-session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, isSponsorSession }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Could not update sponsor flag");
    }
  }

  async function acknowledgeRevision(submissionId: string) {
    setLoading(submissionId + "ack");
    const res = await fetch("/api/chair/abstract-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, action: "acknowledge" }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Could not update revision status");
    }
  }

  async function setShareable(submissionId: string, shareable: boolean) {
    setLoading(submissionId + "share");
    const res = await fetch("/api/chair/deck-shareable", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, shareable }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Could not update sharing");
    }
  }

  async function toggleArchivePublish(publish: boolean) {
    if (
      publish &&
      !confirm(
        "Publish the post-conference slide archive? Only shareable decks with uploads will appear publicly."
      )
    ) {
      return;
    }
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
    } else {
      const data = await res.json();
      alert(data.error ?? "Publish failed");
    }
  }

  const deckDownloadUrl = (fileId: string) =>
    `/api/decks/download?token=${encodeURIComponent(token)}&fileId=${encodeURIComponent(fileId)}`;

  const decksWithFiles = deckQueue.filter((d) => d.deckFileId);
  const decksPendingReview = deckQueue.filter(
    (d) => d.deckFileId && (d.deckStatus === "SUBMITTED" || d.deckStatus === "REVIEWED")
  );
  const approvedItems = programItems.filter((i) => i.programStatus === "APPROVED");
  const vipRegisteredCount = approvedItems.filter((i) => i.vipRegistered).length;

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
            : ` — conference status is ${conferenceStatus}.`}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!readOnly && (
          <Link href={`/review/${token}`} className="btn-secondary">
            Score abstracts
          </Link>
        )}
        {board && !readOnly && (
          <Link href={`/schedule/${token}`} className="btn-primary text-white no-underline">
            Schedule builder
          </Link>
        )}
        {canExportCsv(role) && (
          <a
            href={`/api/chair/export?token=${encodeURIComponent(token)}`}
            className="btn-secondary no-underline"
          >
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

      {approvedItems.length > 0 && (
        <p className="mt-4 text-sm text-gray-700">
          VIP event registration:{" "}
          <strong>
            {vipRegisteredCount} / {approvedItems.length}
          </strong>{" "}
          approved {approvedItems.length === 1 ? "talk" : "talks"} registered
        </p>
      )}

      {board ? (
        <p className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          As a <strong>board member</strong>, you may approve talks, review decks, mark sessions
          non-shareable for the post-conference archive, and publish that archive when ready.
        </p>
      ) : (
        <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          As a <strong>conference co-chair</strong>, you may score abstracts and review slide decks.
          Program approval and public archive controls are reserved for the board.
        </p>
      )}

      <div className="mt-6 flex flex-wrap border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-semibold ${
            tab === "program"
              ? "border-b-2 border-minne-navy text-minne-navy"
              : "text-gray-600"
          }`}
          onClick={() => setTab("program")}
        >
          Program ({programItems.length})
        </button>
        {!readOnly && (
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold ${
              tab === "decks"
                ? "border-b-2 border-minne-navy text-minne-navy"
                : "text-gray-600"
            }`}
            onClick={() => setTab("decks")}
          >
            Deck queue ({deckQueue.length})
            {decksPendingReview.length > 0 && (
              <span className="ml-1 rounded bg-amber-100 px-1.5 text-xs text-amber-900">
                {decksPendingReview.length} to review
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          className={`px-4 py-2 text-sm font-semibold ${
            tab === "balance"
              ? "border-b-2 border-minne-navy text-minne-navy"
              : "text-gray-600"
          }`}
          onClick={() => setTab("balance")}
        >
          Balance
        </button>
        {canSetProgramStatus(role) && !readOnly && (
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold ${
              tab === "communications"
                ? "border-b-2 border-minne-navy text-minne-navy"
                : "text-gray-600"
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
              tab === "history"
                ? "border-b-2 border-minne-navy text-minne-navy"
                : "text-gray-600"
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
          <TechnicalityBalance rows={technicalityRows} approvedCount={approvedCount} />
        </section>
      )}

      {tab === "communications" && (
        <ChairCommunicationsTab
          token={token}
          readOnly={readOnly}
          conferenceName={conferenceName}
        />
      )}

      {tab === "history" && (
        <section className="mt-6 card">
          <h2 className="text-lg font-bold text-minne-navy">Archived conferences</h2>
          <p className="mt-1 text-sm text-gray-600">
            Open a read-only committee view of past events.
          </p>
          <ul className="mt-4 space-y-2">
            {archivedConferences.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/chair/${token}?archive=${c.slug}`}
                  className={`text-minne-navy underline ${
                    viewingArchiveSlug === c.slug ? "font-bold" : ""
                  }`}
                >
                  {c.name}
                </Link>
                <span className="ml-2 text-sm text-gray-500">
                  {c.submissionCount} submissions
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
            {(
              [
                ["all", "All"],
                ["sponsor", "Sponsor"],
                ["community", "Community"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`rounded px-2 py-1 text-xs ${
                  sponsorFilter === key ? "bg-violet-700 text-white" : "bg-gray-100"
                }`}
                onClick={() => setSponsorFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filter by theme:</span>
            <button
              type="button"
              className={`rounded px-2 py-1 text-xs ${
                !themeFilter ? "bg-minne-navy text-white" : "bg-gray-100"
              }`}
              onClick={() => setThemeFilter(null)}
            >
              All
            </button>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`rounded px-2 py-1 text-xs ${
                  themeFilter === t.id ? "bg-minne-navy text-white" : "bg-gray-100"
                }`}
                onClick={() => setThemeFilter(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <ThemeGapPanel rows={themeStats} />
          </div>
          {blindReviewEnabled && (
            <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Blind review: talks you have not scored yet appear first without presenter email
              or committee scores. Score on the{" "}
              <Link href={`/review/${token}`} className="font-semibold underline">
                review page
              </Link>{" "}
              to unlock aggregates here.
            </p>
          )}
          {blindReviewEnabled ? (
            <>
              <ProgramListSection
                title="Awaiting your score"
                description="Newest submissions first — score on the review page to see committee data"
                items={needsScore}
                allScores={allScores}
                token={token}
                board={board}
                readOnly={readOnly}
                loading={loading}
                setStatus={setStatus}
                setVipRegistered={setVipRegistered}
                acknowledgeRevision={acknowledgeRevision}
                setSponsorSession={setSponsorSession}
                role={role}
                blindReviewEnabled
              />
              <ProgramListSection
                title="Scored by you"
                description="Ranked by committee average among talks you have scored"
                items={scoredByMe}
                allScores={allScores}
                token={token}
                board={board}
                readOnly={readOnly}
                loading={loading}
                setStatus={setStatus}
                setVipRegistered={setVipRegistered}
                acknowledgeRevision={acknowledgeRevision}
                setSponsorSession={setSponsorSession}
                role={role}
                blindReviewEnabled
                className="mt-10 border-t border-gray-200 pt-8"
              />
            </>
          ) : (
            <ProgramListSection
              title="Program"
              description="Sorted by committee average at current abstract version (highest first)"
              items={scoredByMe}
              allScores={allScores}
              token={token}
              board={board}
              readOnly={readOnly}
              loading={loading}
              setStatus={setStatus}
              setVipRegistered={setVipRegistered}
              acknowledgeRevision={acknowledgeRevision}
              setSponsorSession={setSponsorSession}
              role={role}
              blindReviewEnabled={false}
            />
          )}
        </>
      )}

      {tab === "decks" && !readOnly && (
        <section className="mt-6 space-y-6">
          {board && (
            <div className="card border-minne-navy/20">
              <h2 className="text-lg font-bold text-minne-navy">Post-conference slide archive</h2>
              <p className="mt-1 text-sm text-gray-700">
                When published, shareable approved sessions with uploaded decks appear at{" "}
                <code className="text-xs">/archive/{conferenceSlug}</code>. Mark individual decks
                as <strong>non-shareable</strong> to exclude them even after publishing.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    decksPublished
                      ? "bg-green-100 text-green-900"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {decksPublished ? "Published" : "Not published"}
                </span>
                {decksPublishedAt && (
                  <span className="text-xs text-gray-500">
                    Since {new Date(decksPublishedAt).toLocaleString()}
                  </span>
                )}
                {canPublishDeckArchive(role) && (
                  <>
                    {!decksPublished ? (
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={!!loading || decksWithFiles.length === 0}
                        title={
                          decksWithFiles.length === 0
                            ? "No uploaded decks yet"
                            : undefined
                        }
                        onClick={() => toggleArchivePublish(true)}
                      >
                        Publish archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={!!loading}
                        onClick={() => toggleArchivePublish(false)}
                      >
                        Unpublish archive
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {deckQueue.length === 0 ? (
            <p className="text-gray-600 italic">No approved sessions yet.</p>
          ) : (
            <ul className="space-y-4">
              {deckQueue.map((deck) => (
                <li key={deck.submissionId} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-minne-navy">{deck.title}</h2>
                      <p className="text-sm text-gray-600">
                        {deck.presenters} · {deck.organization}
                      </p>
                      {deck.deckFilename && (
                        <p className="mt-1 text-xs text-gray-500">
                          v{deck.deckVersion} · {deck.deckFilename}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <DeckStatusBadge status={deck.deckStatus} />
                      {board && (
                        <span
                          className={`text-xs font-semibold ${
                            deck.deckShareable ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {deck.deckShareable ? "Shareable" : "Non-shareable"}
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          deck.vipRegistered ? "text-purple-800" : "text-gray-500"
                        }`}
                      >
                        VIP: {deck.vipRegistered ? "Registered" : "Not registered"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {deck.deckFileId ? (
                      <a
                        href={deckDownloadUrl(deck.deckFileId)}
                        className="btn-secondary text-sm no-underline"
                      >
                        Download deck
                      </a>
                    ) : (
                      <span className="text-sm italic text-gray-500">Awaiting upload</span>
                    )}

                    {deck.deckFileId &&
                      (["REVIEWED", "APPROVED", "CONCERN"] as const).map((ds) => (
                        <button
                          key={ds}
                          type="button"
                          className="btn-secondary text-xs"
                          disabled={!!loading}
                          onClick={() => setDeckStatus(deck.submissionId, ds)}
                        >
                          Mark {ds.toLowerCase()}
                        </button>
                      ))}

                    {canSetDeckShareable(role) && deck.deckFileId && (
                      <button
                        type="button"
                        className="btn-secondary text-xs"
                        disabled={!!loading}
                        onClick={() =>
                          setShareable(deck.submissionId, !deck.deckShareable)
                        }
                      >
                        {deck.deckShareable
                          ? "Mark non-shareable"
                          : "Allow sharing"}
                      </button>
                    )}

                    {canSetVipRegistered(role) && (
                      <button
                        type="button"
                        className="btn-secondary text-xs"
                        disabled={!!loading}
                        onClick={() =>
                          setVipRegistered(deck.submissionId, !deck.vipRegistered)
                        }
                      >
                        {deck.vipRegistered
                          ? "Clear VIP registration"
                          : "Mark VIP registered"}
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
  description,
  items,
  allScores,
  token,
  board,
  readOnly,
  loading,
  setStatus,
  setVipRegistered,
  acknowledgeRevision,
  setSponsorSession,
  role,
  blindReviewEnabled,
  className = "mt-8",
}: {
  title: string;
  description: string;
  items: ChairProgramItem[];
  allScores: Record<string, { reviewer: string; value: number; notes: string | null }[]>;
  token: string;
  board: boolean;
  readOnly: boolean;
  loading: string | null;
  setStatus: (submissionId: string, status: string, force?: boolean) => void;
  setVipRegistered: (submissionId: string, registered: boolean) => void;
  acknowledgeRevision: (submissionId: string) => void;
  setSponsorSession: (submissionId: string, isSponsorSession: boolean) => void;
  role: ReviewerRole;
  blindReviewEnabled: boolean;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-xl font-bold text-minne-navy">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <ul className="mt-4 space-y-6">
        {items.map((item) => {
          const agg = item.aggregate ?? EMPTY_AGGREGATE;
          return (
            <li key={item.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-minne-navy">{item.title}</h3>
                    <RevisionBadge version={item.revisionSummary.abstractVersion} />
                    {item.isSponsorSession && <SponsorSessionBadge />}
                    {item.revisionSummary.staleScoreCount > 0 && (
                      <RescoreIndicator version={item.revisionSummary.abstractVersion} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.presenterSubtitle}</p>
                  <ScoreVersionSummaryLine summary={item.revisionSummary} />
                  {item.themeNames.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Themes: {item.themeNames.join(", ")}
                    </p>
                  )}
                  <p className="mt-1 text-sm">
                    Technical {item.technicalLevel}:{" "}
                    {TECHNICAL_LABELS[item.technicalLevel]}
                  </p>
                  {!item.committeeScoresVisible && blindReviewEnabled && (
                    <p className="mt-2 text-sm">
                      <Link href={`/review/${token}`} className="text-minne-navy underline">
                        Score on review page
                      </Link>{" "}
                      to unlock committee scores and presenter email.
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ProgramStatusBadge status={item.programStatus} />
                  <AbstractReviewStatusBadge status={item.abstractReviewStatus} />
                  <DeckStatusBadge status={item.deckStatus} />
                  {board && item.programStatus === "APPROVED" && (
                    <span
                      className={`text-xs ${
                        item.deckShareable ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      Archive: {item.deckShareable ? "shareable" : "non-shareable"}
                    </span>
                  )}
                  {item.programStatus === "APPROVED" && (
                    <span
                      className={`text-xs font-semibold ${
                        item.vipRegistered ? "text-purple-800" : "text-gray-500"
                      }`}
                    >
                      VIP: {item.vipRegistered ? "Registered" : "Not registered"}
                    </span>
                  )}
                  {item.committeeScoresVisible && (
                    <span className="text-sm font-semibold text-minne-navy">
                      {agg.count > 0 ? (
                        <>
                          Avg {agg.average.toFixed(2)} at v{item.revisionSummary.abstractVersion}{" "}
                          ({agg.count} reviewer{agg.count === 1 ? "" : "s"})
                        </>
                      ) : item.revisionSummary.staleScoreCount > 0 ? (
                        <>No scores at v{item.revisionSummary.abstractVersion} yet</>
                      ) : (
                        <>No committee scores yet</>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-gray-800">{item.abstract}</p>

              {item.committeeScoresVisible && allScores[item.id]?.length > 0 && (
                <ul className="mt-3 space-y-1 rounded bg-gray-50 p-3 text-xs">
                  {allScores[item.id].map((s, i) => (
                    <li key={i}>
                      <strong>{s.reviewer}:</strong> {formatScore(s.value)}
                      {s.notes ? ` — ${s.notes}` : ""}
                    </li>
                  ))}
                </ul>
              )}

              {!readOnly && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {board && item.abstractReviewStatus === "REVISED" && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={!!loading}
                      onClick={() => acknowledgeRevision(item.id)}
                    >
                      Mark revision reviewed
                    </button>
                  )}
                  {board && item.programStatus !== "WITHDRAWN" && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={!!loading}
                      onClick={() =>
                        setSponsorSession(item.id, !item.isSponsorSession)
                      }
                    >
                      {item.isSponsorSession
                        ? "Clear sponsor session"
                        : "Mark sponsor session"}
                    </button>
                  )}
                  {board && item.programStatus === "PENDING" && (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={!!loading}
                        onClick={() => setStatus(item.id, "APPROVED")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={!!loading}
                        onClick={() => setStatus(item.id, "BACKUP")}
                      >
                        Mark backup
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={!!loading}
                        onClick={() => setStatus(item.id, "DECLINED")}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {board && item.programStatus === "BACKUP" && (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!!loading}
                      onClick={() => setStatus(item.id, "APPROVED")}
                    >
                      Promote to approved
                    </button>
                  )}
                  {canSetVipRegistered(role) && item.programStatus === "APPROVED" && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={!!loading}
                      onClick={() => setVipRegistered(item.id, !item.vipRegistered)}
                    >
                      {item.vipRegistered
                        ? "Clear VIP registration"
                        : "Mark VIP registered"}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
