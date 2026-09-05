import Link from "next/link";
import { getPublicConferences } from "@/lib/conference-queries";
import { observeOfferAvailability } from "@/lib/concept-design/lifecycle-disclosure-policy";

export default async function UpcomingPage() {
  const conferences = await getPublicConferences();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">Events</h1>
      <p className="mt-2 text-gray-700">
        Proposal availability and post-event slide Publications are managed per conference.
      </p>
      <ul className="mt-8 space-y-6">
        {conferences.map((conference) => {
          const archived = Boolean(conference.archiveRecord);
          const availability = observeOfferAvailability(
            conference,
            conference.availabilityWindows[0] ?? null
          );
          return (
            <li key={conference.slug} className="card">
              <h2 className="text-xl font-bold text-minne-navy">{conference.name}</h2>
              <p className="text-sm text-gray-600">
                {archived ? "Archived" : "Active"}
                {!archived && !availability.open && (
                  <span className="ml-2 text-amber-800">· {availability.message}</span>
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {!archived && availability.open && (
                  <Link
                    href={`/submit/${conference.slug}`}
                    className="btn-primary text-white no-underline"
                  >
                    Submit a talk
                  </Link>
                )}
                {conference.decksPublished && (
                  <Link href={`/archive/${conference.slug}`} className="btn-secondary">
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
