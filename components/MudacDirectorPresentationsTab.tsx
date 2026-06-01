"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MudacDivision } from "@prisma/client";
import { MUDAC_DIVISION_LABELS } from "@/lib/mudac/constants";

type TeamRow = {
  id: string;
  displayId: string;
  division: MudacDivision;
};

type PanelOption = {
  id: string;
  label: string;
};

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

type Props = {
  token: string;
  panels: PanelOption[];
  teams: TeamRow[];
  presentations: PresentationRow[];
  judgesPerPanel: number;
};

export function MudacDirectorPresentationsTab({
  token,
  panels,
  teams,
  presentations: initialPresentations,
  judgesPerPanel,
}: Props) {
  const router = useRouter();
  const [presentations, setPresentations] = useState(initialPresentations);
  const [loading, setLoading] = useState<string | null>(null);
  const [assignTeamId, setAssignTeamId] = useState("");
  const [assignPanelId, setAssignPanelId] = useState(panels[0]?.id ?? "");

  useEffect(() => {
    setPresentations(initialPresentations);
  }, [initialPresentations]);

  const assignedTeamIds = new Set(presentations.map((p) => p.team.id));
  const unassignedTeams = teams.filter((t) => !assignedTeamIds.has(t.id));

  async function assignTeam() {
    if (!assignTeamId || !assignPanelId) return;
    setLoading("assign");
    const res = await fetch("/api/mudac/director/presentations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, teamId: assignTeamId, panelId: assignPanelId }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Assignment failed");
    }
  }

  async function removePresentation(presentationId: string) {
    if (!confirm("Remove this team from the panel schedule?")) return;
    setLoading(`rm-${presentationId}`);
    const res = await fetch("/api/mudac/director/presentations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, presentationId }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Remove failed");
    }
  }

  const byPanel = panels.map((panel) => ({
    panel,
    rows: presentations.filter((p) => p.panelId === panel.id),
  }));

  return (
    <section className="mt-6 space-y-6">
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-minne-navy">Assign team to panel</h2>
        <p className="mt-1 text-sm text-gray-600">
          Each team is scored once by all judges on the assigned panel ({judgesPerPanel}{" "}
          scorecards expected per team).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            Team
            <select
              value={assignTeamId}
              onChange={(e) => setAssignTeamId(e.target.value)}
              className="form-input mt-1 block min-w-[8rem]"
            >
              <option value="">Select…</option>
              {unassignedTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayId} ({MUDAC_DIVISION_LABELS[t.division]})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Panel
            <select
              value={assignPanelId}
              onChange={(e) => setAssignPanelId(e.target.value)}
              className="form-input mt-1 block"
            >
              {panels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-primary"
            disabled={loading === "assign" || !assignTeamId}
            onClick={assignTeam}
          >
            Assign
          </button>
        </div>
        {unassignedTeams.length === 0 && teams.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">All teams are assigned to a panel.</p>
        )}
        {teams.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Create teams on the Teams tab first.
          </p>
        )}
      </div>

      {byPanel.map(({ panel, rows }) => (
        <div key={panel.id} className="card p-4">
          <h3 className="text-lg font-semibold text-minne-navy">{panel.label}</h3>
          {rows.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No teams assigned to this panel.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-2">Team ID</th>
                  <th className="py-2 pr-2">Division</th>
                  <th className="py-2 pr-2">Scorecards</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const submitted = row.scorecards.filter((s) => s.submittedAt).length;
                  return (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-2 pr-2 font-mono font-semibold text-minne-navy">
                        {row.team.displayId}
                      </td>
                      <td className="py-2 pr-2">
                        {MUDAC_DIVISION_LABELS[row.team.division]}
                      </td>
                      <td className="py-2 pr-2">
                        {submitted} / {judgesPerPanel} submitted
                        {row.scorecards.length > 0 && (
                          <ul className="mt-1 text-xs text-gray-500">
                            {row.scorecards.map((sc) => (
                              <li key={sc.id}>
                                {sc.judge.name}
                                {sc.submittedAt ? " ✓" : " (draft)"}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          className="text-red-700 hover:underline"
                          disabled={loading === `rm-${row.id}`}
                          onClick={() => removePresentation(row.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </section>
  );
}
