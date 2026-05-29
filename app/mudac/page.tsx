import Link from "next/link";
import { getMudacEventBySlug } from "@/lib/mudac/queries";

export default async function MudacLandingPage() {
  const event = await getMudacEventBySlug("minnemudac-2026");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">MinneMUDAC judging demo</h1>
      <p className="mt-3 text-gray-700">
        Prototype scoring system for the{" "}
        <a
          href="https://minneanalytics.org/minnemudac-2026/"
          className="text-minne-navy underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          MinneMUDAC 2026
        </a>{" "}
        student data challenge. Volunteer judges score team presentations; tournament
        directors configure criteria, teams, and panels, then rank results by division.
      </p>

      {event ? (
        <div className="card mt-8 p-6">
          <h2 className="text-xl font-semibold text-minne-navy">{event.name}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Status: {event.status.replace(/_/g, " ").toLowerCase()} ·{" "}
            {event.judgesPerPanel} judges per panel
          </p>
          <p className="mt-4 text-sm text-gray-700">
            Tournament directors: open the URL printed by{" "}
            <code className="rounded bg-gray-100 px-1">npm run db:seed</code> (starts with{" "}
            <code className="rounded bg-gray-100 px-1">/mudac/director/…</code>).
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Judge registration and scoring arrive in Phase 2–3. See{" "}
            <code className="rounded bg-gray-100 px-1">docs/mudac-implementation-plan.md</code>{" "}
            in the repository.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-amber-800">
          Run <code className="rounded bg-amber-50 px-1">npm run db:seed</code> to create the
          MinneMUDAC 2026 demo event.
        </p>
      )}

      <p className="mt-8 text-sm">
        <Link href="/" className="text-minne-navy underline">
          ← Conference planning demo
        </Link>
      </p>
    </div>
  );
}
