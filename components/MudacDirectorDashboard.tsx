"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  MudacDivision,
  MudacEventStatus,
  MudacIdGenerationMode,
  MudacPanelAggregateMode,
} from "@prisma/client";
import {
  MUDAC_DIVISION_LABELS,
  MUDAC_DIVISIONS,
  MUDAC_EVENT_STATUSES,
  MUDAC_STATUS_LABELS,
} from "@/lib/mudac/constants";
import { directorCapabilitySummary, directorDashboardTitle } from "@/lib/mudac/roles";
import { MudacDirectorPanelsTab } from "@/components/MudacDirectorPanelsTab";
import { MudacDirectorPresentationsTab } from "@/components/MudacDirectorPresentationsTab";
import { MudacDirectorScorecardsTab } from "@/components/MudacDirectorScorecardsTab";
import { MudacDirectorRankingsTab } from "@/components/MudacDirectorRankingsTab";
import type { PresentationAggregate } from "@/lib/mudac/aggregation";
import type { MudacJudgeType } from "@prisma/client";

type CriterionRow = {
  id: string;
  sortOrder: number;
  name: string;
  description: string | null;
  maxPoints: number;
  weight: number;
};

type TeamRow = {
  id: string;
  displayId: string;
  division: MudacDivision;
  name: string | null;
};

type EventSnapshot = {
  id: string;
  slug: string;
  name: string;
  status: MudacEventStatus;
  registrationOpen: boolean;
  hasRegistrationCode: boolean;
  scoringLocked: boolean;
  judgesPerPanel: number;
  panelAggregateMode: MudacPanelAggregateMode;
  idGenerationMode: MudacIdGenerationMode;
  teamIdStart: number;
  teamIdEnd: number;
  teamIdIncrement: number;
  teamIdPadWidth: number;
};

type Tab = "setup" | "criteria" | "teams" | "panels" | "presentations" | "scorecards" | "rankings";

type PresentationRow = {
  id: string;
  panelId: string;
  team: TeamRow;
  panel: { label: string };
  scorecards: Array<{
    id: string;
    submittedAt: string | null;
    judge: { name: string };
  }>;
};

type PanelRow = {
  id: string;
  label: string;
  sortOrder: number;
  slotRequirements: Array<{ slotIndex: number; judgeType: MudacJudgeType }>;
  assignments: Array<{
    slotIndex: number;
    judge: {
      id: string;
      name: string;
      email: string;
      judgeType: MudacJudgeType;
      revokedAt: string | null;
    };
  }>;
};

type JudgeRow = {
  id: string;
  name: string;
  email: string;
  judgeType: MudacJudgeType;
  revokedAt: string | null;
  assignments: Array<{ panel: { id: string; label: string } }>;
};

type Props = {
  token: string;
  label: string;
  event: EventSnapshot;
  criteria: CriterionRow[];
  teams: TeamRow[];
  panels: PanelRow[];
  judges: JudgeRow[];
  presentations: PresentationRow[];
  aggregates: PresentationAggregate[];
  scorecardPanels: Array<{ panelId: string; panelLabel: string; rows: PresentationAggregate[] }>;
};

export function MudacDirectorDashboard({
  token,
  label,
  event: initialEvent,
  criteria: initialCriteria,
  teams: initialTeams,
  panels,
  judges,
  presentations,
  aggregates,
  scorecardPanels,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("setup");
  const [event, setEvent] = useState(initialEvent);
  const [criteria, setCriteria] = useState(initialCriteria);
  const [teams, setTeams] = useState(initialTeams);
  const [loading, setLoading] = useState<string | null>(null);

  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionMax, setNewCriterionMax] = useState(10);
  const [registrationCode, setRegistrationCode] = useState("");

  const [genDivision, setGenDivision] = useState<MudacDivision>("UNDERGRADUATE");
  const [genCount, setGenCount] = useState(8);
  const [genStart, setGenStart] = useState(initialEvent.teamIdStart);
  const [genEnd, setGenEnd] = useState(initialEvent.teamIdEnd);
  const [genIncrement, setGenIncrement] = useState(initialEvent.teamIdIncrement);
  const [genPadWidth, setGenPadWidth] = useState(initialEvent.teamIdPadWidth);
  const [genMode, setGenMode] = useState<MudacIdGenerationMode>(
    initialEvent.idGenerationMode
  );

  const [manualId, setManualId] = useState("");
  const [manualDivision, setManualDivision] = useState<MudacDivision>("UNDERGRADUATE");
  const [manualName, setManualName] = useState("");

  async function patchEvent(payload: Record<string, unknown>) {
    setLoading("event");
    const res = await fetch("/api/mudac/director/event", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...payload }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      setEvent((e) => ({
        ...e,
        status: data.event.status,
        registrationOpen: data.event.registrationOpen,
        hasRegistrationCode: Boolean(data.event.registrationCodeHash),
        scoringLocked: data.event.scoringLocked,
        judgesPerPanel: data.event.judgesPerPanel,
        panelAggregateMode: data.event.panelAggregateMode,
        idGenerationMode: data.event.idGenerationMode,
        teamIdStart: data.event.teamIdStart,
        teamIdEnd: data.event.teamIdEnd,
        teamIdIncrement: data.event.teamIdIncrement,
        teamIdPadWidth: data.event.teamIdPadWidth,
      }));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Update failed");
    }
  }

  async function addCriterion() {
    if (!newCriterionName.trim()) return;
    setLoading("criterion-add");
    const res = await fetch("/api/mudac/director/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: newCriterionName.trim(),
        maxPoints: newCriterionMax,
      }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      setCriteria((c) => [...c, data.criterion]);
      setNewCriterionName("");
      setNewCriterionMax(10);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not add criterion");
    }
  }

  async function updateCriterion(
    criterionId: string,
    patch: { name?: string; maxPoints?: number; weight?: number }
  ) {
    const res = await fetch("/api/mudac/director/criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, criterionId, ...patch }),
    });
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Update failed");
    }
  }

  async function deleteCriterion(criterionId: string) {
    if (!confirm("Remove this scoring criterion?")) return;
    setLoading(`del-${criterionId}`);
    const res = await fetch("/api/mudac/director/criteria", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, criterionId }),
    });
    setLoading(null);
    if (res.ok) {
      setCriteria((c) => c.filter((row) => row.id !== criterionId));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
  }

  async function generateTeams() {
    setLoading("gen-teams");
    const res = await fetch("/api/mudac/director/teams/generate-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        division: genDivision,
        count: genCount,
        start: genStart,
        end: genEnd,
        increment: genIncrement,
        padWidth: genPadWidth,
        mode: genMode,
      }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      setTeams((t) =>
        [...t, ...data.teams].sort((a, b) =>
          a.division === b.division
            ? a.displayId.localeCompare(b.displayId)
            : a.division.localeCompare(b.division)
        )
      );
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Generation failed");
    }
  }

  async function addTeamManual() {
    if (!manualId.trim()) return;
    setLoading("team-add");
    const res = await fetch("/api/mudac/director/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        displayId: manualId.trim(),
        division: manualDivision,
        name: manualName.trim() || undefined,
      }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      setTeams((t) => [...t, data.team]);
      setManualId("");
      setManualName("");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not add team");
    }
  }

  async function deleteTeam(teamId: string) {
    if (!confirm("Remove this team?")) return;
    setLoading(`team-${teamId}`);
    const res = await fetch("/api/mudac/director/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, teamId }),
    });
    setLoading(null);
    if (res.ok) {
      setTeams((t) => t.filter((row) => row.id !== teamId));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
  }

  const teamsByDivision = MUDAC_DIVISIONS.map((d) => ({
    division: d,
    label: MUDAC_DIVISION_LABELS[d],
    rows: teams.filter((t) => t.division === d),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm text-gray-600">
        <Link href="/mudac" className="text-minne-navy underline">
          MinneMUDAC demo
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-minne-navy">{directorDashboardTitle()}</h1>
      <p className="mt-1 text-gray-700">
        {label} · {event.name} ({event.slug})
      </p>
      <p className="mt-2 text-sm text-gray-600">{directorCapabilitySummary()}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {(
          [
            ["setup", "Setup"],
            ["criteria", "Criteria"],
            ["teams", "Teams"],
            ["panels", "Panels"],
            ["presentations", "Presentations"],
            ["scorecards", "Scorecards"],
            ["rankings", "Rankings"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              tab === id
                ? "bg-minne-navy text-white"
                : "bg-gray-100 text-minne-navy hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "setup" && (
        <section className="mt-6 space-y-6">
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Event status</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <select
                value={event.status}
                onChange={(e) => patchEvent({ status: e.target.value })}
                className="form-input"
                disabled={loading === "event"}
              >
                {MUDAC_EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {MUDAC_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={event.registrationOpen}
                  onChange={(e) => patchEvent({ registrationOpen: e.target.checked })}
                  disabled={loading === "event"}
                />
                Judge registration open
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={event.scoringLocked}
                  onChange={(e) => patchEvent({ scoringLocked: e.target.checked })}
                  disabled={loading === "event"}
                />
                Scoring locked
              </label>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Judge registration</h2>
            <p className="mt-1 text-sm text-gray-600">
              Volunteers self-register at the public link below. Toggle registration open above
              and optionally set a registration code.
            </p>
            <p className="mt-3 break-all rounded bg-gray-100 p-3 font-mono text-xs">
              /mudac/{event.slug}/register
            </p>
            <a
              href={`/mudac/${event.slug}/register`}
              className="btn-secondary mt-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open registration page
            </a>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Registration code</h2>
            <p className="mt-1 text-sm text-gray-600">
              Optional shared secret for judge self-registration. Leave blank to clear.
              {event.hasRegistrationCode && " A code is currently set."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                type="text"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                placeholder="New registration code"
                className="form-input max-w-xs"
              />
              <button
                type="button"
                className="btn-primary"
                disabled={loading === "event"}
                onClick={() =>
                  patchEvent({ registrationCode }).then(() => setRegistrationCode(""))
                }
              >
                Save code
              </button>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Panel defaults</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Judges per panel
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={event.judgesPerPanel}
                  onChange={(e) =>
                    patchEvent({ judgesPerPanel: Number(e.target.value) })
                  }
                  className="form-input mt-1 w-full"
                  disabled={loading === "event"}
                />
              </label>
              <label className="text-sm">
                Panel aggregate mode
                <select
                  value={event.panelAggregateMode}
                  onChange={(e) =>
                    patchEvent({ panelAggregateMode: e.target.value })
                  }
                  className="form-input mt-1 w-full"
                  disabled={loading === "event"}
                >
                  <option value="MEAN">Mean of judge totals</option>
                  <option value="SUM">Sum of judge totals</option>
                </select>
              </label>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Default team ID settings</h2>
            <p className="mt-1 text-sm text-gray-600">
              Used by the Teams tab generator. Display IDs are padded strings (e.g. 07).
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">
                Generation mode
                <select
                  value={event.idGenerationMode}
                  onChange={(e) =>
                    patchEvent({ idGenerationMode: e.target.value })
                  }
                  className="form-input mt-1 w-full"
                >
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="RANDOM">Random</option>
                </select>
              </label>
              <label className="text-sm">
                Start
                <input
                  type="number"
                  value={event.teamIdStart}
                  onChange={(e) => patchEvent({ teamIdStart: Number(e.target.value) })}
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                End
                <input
                  type="number"
                  value={event.teamIdEnd}
                  onChange={(e) => patchEvent({ teamIdEnd: Number(e.target.value) })}
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                Increment
                <input
                  type="number"
                  min={1}
                  value={event.teamIdIncrement}
                  onChange={(e) =>
                    patchEvent({ teamIdIncrement: Number(e.target.value) })
                  }
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                Pad width
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={event.teamIdPadWidth}
                  onChange={(e) =>
                    patchEvent({ teamIdPadWidth: Number(e.target.value) })
                  }
                  className="form-input mt-1 w-full"
                />
              </label>
            </div>
          </div>
        </section>
      )}

      {tab === "criteria" && (
        <section className="mt-6 space-y-6">
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Scoring criteria</h2>
            <p className="mt-1 text-sm text-gray-600">
              Judges score each team on every criterion (typically 5). Order matches the
              scorecard layout.
            </p>
            {criteria.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No criteria yet.</p>
            ) : (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Max pts</th>
                    <th className="py-2 pr-2">Weight</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((row) => (
                    <CriterionRowEditor
                      key={row.id}
                      row={row}
                      loading={loading === `del-${row.id}`}
                      onUpdate={updateCriterion}
                      onDelete={() => deleteCriterion(row.id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-4 flex flex-wrap items-end gap-2 border-t pt-4">
              <label className="text-sm">
                New criterion
                <input
                  type="text"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  className="form-input mt-1 block w-64"
                  placeholder="e.g. Analytical approach"
                />
              </label>
              <label className="text-sm">
                Max points
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newCriterionMax}
                  onChange={(e) => setNewCriterionMax(Number(e.target.value))}
                  className="form-input mt-1 block w-24"
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                disabled={loading === "criterion-add"}
                onClick={addCriterion}
              >
                Add criterion
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === "teams" && (
        <section className="mt-6 space-y-6">
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Generate team IDs</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">
                Division
                <select
                  value={genDivision}
                  onChange={(e) => setGenDivision(e.target.value as MudacDivision)}
                  className="form-input mt-1 w-full"
                >
                  {MUDAC_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {MUDAC_DIVISION_LABELS[d]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Count
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                Mode
                <select
                  value={genMode}
                  onChange={(e) => setGenMode(e.target.value as MudacIdGenerationMode)}
                  className="form-input mt-1 w-full"
                >
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="RANDOM">Random</option>
                </select>
              </label>
              <label className="text-sm">
                Start
                <input
                  type="number"
                  value={genStart}
                  onChange={(e) => setGenStart(Number(e.target.value))}
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                End
                <input
                  type="number"
                  value={genEnd}
                  onChange={(e) => setGenEnd(Number(e.target.value))}
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                Increment
                <input
                  type="number"
                  min={1}
                  value={genIncrement}
                  onChange={(e) => setGenIncrement(Number(e.target.value))}
                  className="form-input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                Pad width
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={genPadWidth}
                  onChange={(e) => setGenPadWidth(Number(e.target.value))}
                  className="form-input mt-1 w-full"
                />
              </label>
            </div>
            <button
              type="button"
              className="btn-primary mt-4"
              disabled={loading === "gen-teams"}
              onClick={generateTeams}
            >
              Generate teams
            </button>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-minne-navy">Add team manually</h2>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="text-sm">
                Display ID
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="form-input mt-1 block w-24"
                  placeholder="07"
                />
              </label>
              <label className="text-sm">
                Division
                <select
                  value={manualDivision}
                  onChange={(e) => setManualDivision(e.target.value as MudacDivision)}
                  className="form-input mt-1 block"
                >
                  {MUDAC_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {MUDAC_DIVISION_LABELS[d]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Label (directors only)
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="form-input mt-1 block w-48"
                  placeholder="Optional school name"
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                disabled={loading === "team-add"}
                onClick={addTeamManual}
              >
                Add team
              </button>
            </div>
          </div>

          {teamsByDivision.map(({ division, label: divLabel, rows }) => (
            <div key={division} className="card p-4">
              <h2 className="text-lg font-semibold text-minne-navy">
                {divLabel}{" "}
                <span className="text-sm font-normal text-gray-600">({rows.length})</span>
              </h2>
              {rows.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No teams in this division.</p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
                    >
                      <span className="font-mono font-semibold text-minne-navy">
                        {row.displayId}
                      </span>
                      {row.name && (
                        <span className="text-gray-600">{row.name}</span>
                      )}
                      <button
                        type="button"
                        className="text-red-700 hover:underline"
                        disabled={loading === `team-${row.id}`}
                        onClick={() => deleteTeam(row.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === "panels" && (
        <MudacDirectorPanelsTab
          token={token}
          judgesPerPanel={event.judgesPerPanel}
          panels={panels}
          judges={judges}
        />
      )}

      {tab === "presentations" && (
        <MudacDirectorPresentationsTab
          token={token}
          panels={panels.map((p) => ({ id: p.id, label: p.label }))}
          teams={teams}
          presentations={presentations}
          judgesPerPanel={event.judgesPerPanel}
        />
      )}

      {tab === "scorecards" && <MudacDirectorScorecardsTab panels={scorecardPanels} />}

      {tab === "rankings" && (
        <MudacDirectorRankingsTab
          token={token}
          panelAggregateMode={event.panelAggregateMode}
          aggregates={aggregates}
        />
      )}
    </div>
  );
}

function CriterionRowEditor({
  row,
  loading,
  onUpdate,
  onDelete,
}: {
  row: CriterionRow;
  loading: boolean;
  onUpdate: (
    id: string,
    patch: { name?: string; maxPoints?: number; weight?: number }
  ) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(row.name);
  const [maxPoints, setMaxPoints] = useState(row.maxPoints);
  const [weight, setWeight] = useState(row.weight);

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-2 text-gray-500">{row.sortOrder}</td>
      <td className="py-2 pr-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== row.name && onUpdate(row.id, { name })}
          className="form-input w-full max-w-xs"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="number"
          min={1}
          max={100}
          value={maxPoints}
          onChange={(e) => setMaxPoints(Number(e.target.value))}
          onBlur={() =>
            maxPoints !== row.maxPoints && onUpdate(row.id, { maxPoints })
          }
          className="form-input w-20"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="number"
          min={0.1}
          max={10}
          step={0.1}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          onBlur={() => weight !== row.weight && onUpdate(row.id, { weight })}
          className="form-input w-20"
        />
      </td>
      <td className="py-2 text-right">
        <button
          type="button"
          className="text-sm text-red-700 hover:underline"
          disabled={loading}
          onClick={onDelete}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
