"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MudacJudgeType } from "@prisma/client";
import { MUDAC_JUDGE_TYPE_LABELS } from "@/lib/mudac/constants";

type JudgeRow = {
  id: string;
  name: string;
  email: string;
  judgeType: MudacJudgeType;
  revokedAt: string | null;
  assignments: Array<{ panel: { id: string; label: string } }>;
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

type Props = {
  token: string;
  judgesPerPanel: number;
  panels: PanelRow[];
  judges: JudgeRow[];
};

export function MudacDirectorPanelsTab({
  token,
  judgesPerPanel,
  panels: initialPanels,
  judges: initialJudges,
}: Props) {
  const router = useRouter();
  const [panels, setPanels] = useState(initialPanels);
  const [judges, setJudges] = useState(initialJudges);
  const [loading, setLoading] = useState<string | null>(null);
  const [newPanelLabel, setNewPanelLabel] = useState("");

  useEffect(() => {
    setPanels(initialPanels);
    setJudges(initialJudges);
  }, [initialPanels, initialJudges]);

  const activeJudges = judges.filter((j) => !j.revokedAt);
  const unassignedJudges = activeJudges.filter((j) => j.assignments.length === 0);

  async function addPanel() {
    if (!newPanelLabel.trim()) return;
    setLoading("add-panel");
    const res = await fetch("/api/mudac/director/panels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, label: newPanelLabel.trim() }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      setPanels((p) => [...p, data.panel]);
      setNewPanelLabel("");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not create panel");
    }
  }

  async function deletePanel(panelId: string) {
    if (!confirm("Remove this panel and its assignments?")) return;
    setLoading(`del-panel-${panelId}`);
    const res = await fetch("/api/mudac/director/panels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, panelId }),
    });
    setLoading(null);
    if (res.ok) {
      setPanels((p) => p.filter((row) => row.id !== panelId));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
  }

  async function updateSlotType(
    panelId: string,
    slotIndex: number,
    judgeType: MudacJudgeType
  ) {
    const res = await fetch("/api/mudac/director/panel-slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, panelId, slotIndex, judgeType }),
    });
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Update failed");
    }
  }

  async function assignJudge(panelId: string, slotIndex: number, judgeId: string) {
    if (!judgeId) return;
    setLoading(`assign-${panelId}-${slotIndex}`);
    const res = await fetch("/api/mudac/director/panel-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, panelId, slotIndex, judgeId }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Assignment failed");
    }
  }

  async function unassignSlot(panelId: string, slotIndex: number) {
    setLoading(`unassign-${panelId}-${slotIndex}`);
    const res = await fetch("/api/mudac/director/panel-assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, panelId, slotIndex }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Could not remove assignment");
    }
  }

  async function revokeJudge(judgeId: string) {
    if (!confirm("Revoke this judge? They will lose access and be removed from panels."))
      return;
    setLoading(`revoke-${judgeId}`);
    const res = await fetch("/api/mudac/director/judges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, judgeId, revoke: true }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Revoke failed");
    }
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-minne-navy">Judge panels</h2>
        <p className="mt-1 text-sm text-gray-600">
          Each panel has {judgesPerPanel} slots with required judge types. Assign registered
          volunteers to matching slots.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            New panel label
            <input
              type="text"
              value={newPanelLabel}
              onChange={(e) => setNewPanelLabel(e.target.value)}
              className="form-input mt-1 block w-48"
              placeholder="Panel A"
            />
          </label>
          <button
            type="button"
            className="btn-primary"
            disabled={loading === "add-panel"}
            onClick={addPanel}
          >
            Add panel
          </button>
        </div>
      </div>

      {panels.length === 0 ? (
        <p className="text-sm text-gray-500">No panels yet. Add one to begin assignments.</p>
      ) : (
        panels.map((panel) => (
          <div key={panel.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-minne-navy">{panel.label}</h3>
              <button
                type="button"
                className="text-sm text-red-700 hover:underline"
                disabled={loading === `del-panel-${panel.id}`}
                onClick={() => deletePanel(panel.id)}
              >
                Remove panel
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: judgesPerPanel }, (_, slotIndex) => {
                const slotReq = panel.slotRequirements.find(
                  (s) => s.slotIndex === slotIndex
                );
                const assignment = panel.assignments.find(
                  (a) => a.slotIndex === slotIndex
                );
                const requiredType = slotReq?.judgeType ?? "GENERAL";
                const matchingJudges = unassignedJudges.filter(
                  (j) => j.judgeType === requiredType
                );

                return (
                  <div
                    key={slotIndex}
                    className="flex flex-wrap items-center gap-3 rounded border border-gray-100 bg-gray-50 p-3 text-sm"
                  >
                    <span className="font-medium text-minne-navy">Slot {slotIndex + 1}</span>
                    <select
                      value={requiredType}
                      onChange={(e) =>
                        updateSlotType(
                          panel.id,
                          slotIndex,
                          e.target.value as MudacJudgeType
                        )
                      }
                      className="form-input w-auto py-1"
                      disabled={Boolean(assignment)}
                    >
                      {(Object.keys(MUDAC_JUDGE_TYPE_LABELS) as MudacJudgeType[]).map(
                        (type) => (
                          <option key={type} value={type}>
                            {MUDAC_JUDGE_TYPE_LABELS[type]}
                          </option>
                        )
                      )}
                    </select>
                    {assignment ? (
                      <>
                        <span>
                          {assignment.judge.name}{" "}
                          <span className="text-gray-500">({assignment.judge.email})</span>
                        </span>
                        <button
                          type="button"
                          className="text-red-700 hover:underline"
                          disabled={loading === `unassign-${panel.id}-${slotIndex}`}
                          onClick={() => unassignSlot(panel.id, slotIndex)}
                        >
                          Unassign
                        </button>
                      </>
                    ) : (
                      <>
                        <select
                          defaultValue=""
                          className="form-input w-auto min-w-[12rem] py-1"
                          disabled={loading === `assign-${panel.id}-${slotIndex}`}
                          onChange={(e) => {
                            assignJudge(panel.id, slotIndex, e.target.value);
                            e.target.value = "";
                          }}
                        >
                          <option value="">Assign judge…</option>
                          {matchingJudges.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.name} ({MUDAC_JUDGE_TYPE_LABELS[j.judgeType]})
                            </option>
                          ))}
                        </select>
                        {matchingJudges.length === 0 && (
                          <span className="text-gray-500">
                            No unassigned {MUDAC_JUDGE_TYPE_LABELS[requiredType]} judges
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="card p-4">
        <h2 className="text-lg font-semibold text-minne-navy">
          Registered judges{" "}
          <span className="text-sm font-normal text-gray-600">
            ({activeJudges.length} active)
          </span>
        </h2>
        {judges.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No judges registered yet. Share the registration link from the Setup tab.
          </p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Type</th>
                <th className="py-2 pr-2">Panel</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {judges.map((j) => (
                <tr key={j.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2">{j.name}</td>
                  <td className="py-2 pr-2 text-gray-600">{j.email}</td>
                  <td className="py-2 pr-2">{MUDAC_JUDGE_TYPE_LABELS[j.judgeType]}</td>
                  <td className="py-2 pr-2">
                    {j.revokedAt ? (
                      <span className="text-red-700">Revoked</span>
                    ) : j.assignments.length > 0 ? (
                      j.assignments.map((a) => a.panel.label).join(", ")
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {!j.revokedAt && (
                      <button
                        type="button"
                        className="text-red-700 hover:underline"
                        disabled={loading === `revoke-${j.id}`}
                        onClick={() => revokeJudge(j.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
