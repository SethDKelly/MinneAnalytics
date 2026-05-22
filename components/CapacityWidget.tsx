import type { CapacitySnapshot } from "@/lib/capacity";

export function CapacityWidget({ cap }: { cap: CapacitySnapshot }) {
  const targetLabel = `${cap.communityTargetMin}–${cap.communityTargetMax}`;
  const remaining = cap.communityTargetMin - cap.approvedCount;

  return (
    <div className="card bg-minne-navy/5">
      <h2 className="mb-3 text-lg font-bold text-minne-navy">Program capacity</h2>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-600">Raw slots (8×8)</dt>
          <dd className="font-semibold">{cap.rawSlots}</dd>
        </div>
        <div>
          <dt className="text-gray-600">After EOD (−6) & Graeme (−4)</dt>
          <dd className="font-semibold">{cap.afterTrim}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Sponsor sessions (range)</dt>
          <dd className="font-semibold">
            {cap.sponsorMin}–{cap.sponsorMax} ({cap.sponsorSessionCount} flagged)
          </dd>
        </div>
        <div>
          <dt className="text-gray-600">Community target</dt>
          <dd className="font-semibold">{targetLabel}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Approved (community)</dt>
          <dd className="font-semibold text-green-800">{cap.approvedCount}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Backups</dt>
          <dd className="font-semibold text-amber-800">{cap.backupCount}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Pending review</dt>
          <dd className="font-semibold">{cap.pendingCount}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Slots to target (min)</dt>
          <dd
            className={`font-semibold ${remaining < 0 ? "text-red-700" : "text-minne-navy"}`}
          >
            {remaining}
          </dd>
        </div>
      </dl>
    </div>
  );
}
