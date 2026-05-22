import Link from "next/link";
import { getPublicConferences } from "@/lib/conference-queries";
import { getSubmissionWindowState } from "@/lib/submission-window";

export default async function UpcomingPage() {
  const conferences = await getPublicConferences();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">Events</h1>
      <p className="mt-2 text-gray-700">
        Call for presentations and post-event slide libraries are managed per conference.
      </p>
      <ul className="mt-8 space-y-6">
        {conferences.map((ev) => {
          const window = getSubmissionWindowState(ev);
          return (
            <li key={ev.slug} className="card">
              <h2 className="text-xl font-bold text-minne-navy">{ev.name}</h2>
              <p className="text-sm text-gray-600">
                {ev.status === "ARCHIVED" ? "Archived" : "Active"}
                {!window.open && ev.status === "ACTIVE" && (
                  <span className="ml-2 text-amber-800">· Submissions closed</span>
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {ev.status === "ACTIVE" && window.open && (
                  <Link
                    href={`/submit/${ev.slug}`}
                    className="btn-primary text-white no-underline"
                  >
                    Submit a talk
                  </Link>
                )}
                {ev.decksPublished && (
                  <Link href={`/archive/${ev.slug}`} className="btn-secondary">
                    Slide deck archive
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {conferences.length === 0 && (
        <p className="mt-6 text-gray-600 italic">No conferences configured yet.</p>
      )}
      <p className="mt-8">
        <Link href="/" className="text-minne-navy underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
