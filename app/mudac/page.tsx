import Link from "next/link";
import { getMudacEventBySlug } from "@/lib/mudac/queries";

export default async function MudacLandingPage() {
  const event = await getMudacEventBySlug("minnemudac-2026");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <h1 className="text-3xl font-bold text-minne-navy sm:text-4xl">MinneMUDAC judging demo</h1>
      <p className="mt-3 text-gray-700">
        Prototype scoring for the{" "}
        <a
          href="https://minneanalytics.org/minnemudac-2026/"
          className="text-minne-navy underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          MinneMUDAC 2026
        </a>{" "}
        student data challenge. Volunteer judges score team presentations; tournament directors
        configure criteria, panels, and rankings by division.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <h2 className="font-semibold text-minne-navy">Tournament director</h2>
          <p className="mt-2 text-sm text-gray-600">
            Configure rubric, teams, panels, and view rankings.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            URL from <code className="rounded bg-gray-100 px-1">npm run db:seed</code>
          </p>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-minne-navy">Judge</h2>
          <p className="mt-2 text-sm text-gray-600">
            Score assigned teams on a mobile-friendly scorecard.
          </p>
          {event?.registrationOpen && (
            <Link
              href="/mudac/minnemudac-2026/register"
              className="btn-secondary mt-3 inline-block text-sm"
            >
              Register as judge
            </Link>
          )}
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-minne-navy">Student teams</h2>
          <p className="mt-2 text-sm text-gray-600">
            Identified by display ID (e.g. 07) and division only — no student login in this
            demo.
          </p>
        </div>
      </div>

      {event ? (
        <div className="card mt-8 p-6">
          <h2 className="text-xl font-semibold text-minne-navy">{event.name}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Status: {event.status.replace(/_/g, " ").toLowerCase()} · {event.judgesPerPanel}{" "}
            judges per panel
            {event.registrationOpen ? " · registration open" : ""}
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
            <li>Director configures criteria, teams, panels, and presentations.</li>
            <li>Judges register (optional code) and get a private portal link.</li>
            <li>Directors assign judges to panel slots by judge type.</li>
            <li>Judges submit scorecards; directors review rankings and export CSV.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            {event.registrationOpen && (
              <Link href="/mudac/minnemudac-2026/register" className="btn-primary">
                Register as judge
              </Link>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-700">
            Full walkthrough:{" "}
            <code className="rounded bg-gray-100 px-1">docs/exploring-mudac-demo.md</code>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Demo registration code: <code className="rounded bg-gray-100 px-1">volunteer</code>.
            Seed includes Panel A teams 01–03 with preloaded judge scores.
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
