"use client";

import { Fragment, useState } from "react";
import type { PresentationAggregate } from "@/lib/mudac/aggregation";
import { MUDAC_DIVISION_LABELS } from "@/lib/mudac/constants";
import type { MudacDivision } from "@prisma/client";

type PanelGroup = {
  panelId: string;
  panelLabel: string;
  rows: PresentationAggregate[];
};

type Props = {
  panels: PanelGroup[];
};

export function MudacDirectorScorecardsTab({ panels }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (panels.length === 0) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        Assign teams to panels on the Presentations tab to review scorecards.
      </p>
    );
  }

  return (
    <section className="mt-6 space-y-6">
      <p className="text-sm text-gray-600">
        Review each judge&apos;s criterion scores and subtotals. Panel scores on the Rankings
        tab combine judge subtotals using the event aggregate mode (sum or mean).
      </p>

      {panels.map((panel) => (
        <div key={panel.panelId} className="card p-4">
          <h3 className="text-lg font-semibold text-minne-navy">{panel.panelLabel}</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-2">Team</th>
                  <th className="py-2 pr-2">Division</th>
                  <th className="py-2 pr-2">Panel score</th>
                  <th className="py-2 pr-2">Judges</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {panel.rows.map((row) => (
                  <Fragment key={row.presentationId}>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 pr-2 font-mono font-semibold text-minne-navy">
                        {row.teamDisplayId}
                      </td>
                      <td className="py-2 pr-2">
                        {MUDAC_DIVISION_LABELS[row.division as MudacDivision]}
                      </td>
                      <td className="py-2 pr-2 font-medium">{row.panelScore}</td>
                      <td className="py-2 pr-2">
                        {row.judgesSubmitted}/{row.judgesExpected}
                        {!row.complete && (
                          <span className="ml-1 text-amber-700">partial</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          className="text-minne-navy hover:underline"
                          onClick={() =>
                            setExpandedId(
                              expandedId === row.presentationId
                                ? null
                                : row.presentationId
                            )
                          }
                        >
                          {expandedId === row.presentationId ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === row.presentationId && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-2 py-3">
                          <div className="space-y-4">
                            {row.judgeScorecards.length === 0 ? (
                              <p className="text-sm text-gray-500">No scorecards yet.</p>
                            ) : (
                              row.judgeScorecards.map((sc) => (
                                <div
                                  key={sc.judgeId}
                                  className="rounded border border-gray-200 bg-white p-3"
                                >
                                  <p className="font-medium text-minne-navy">
                                    {sc.judgeName}{" "}
                                    <span className="text-sm font-normal text-gray-600">
                                      — subtotal {sc.subtotal}
                                      {sc.submitted ? " (submitted)" : " (draft)"}
                                    </span>
                                  </p>
                                  <ul className="mt-2 grid gap-1 text-sm text-gray-700 sm:grid-cols-2">
                                    {sc.scores.map((s) => (
                                      <li key={s.criterionId}>
                                        {s.criterionName}: {s.value}/{s.maxPoints}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
