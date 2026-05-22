import Link from "next/link";

const events = [
  {
    name: "Data Tech 2027",
    date: "Fall 2027 · Twin Cities",
    description:
      "Our flagship technical conference—eight tracks, community sessions, and networking.",
    submitHref: "/submit/data-tech-2027",
    archiveHref: "/archive/data-tech-2027",
  },
  {
    name: "MinneMUDAC 2026",
    date: "Fall 2026",
    description: "Student data science challenge—registration opens separately.",
    submitHref: null,
    archiveHref: null,
  },
];

export default function UpcomingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">Upcoming events</h1>
      <p className="mt-2 text-gray-700">
        Call for presentations and post-event slide libraries are managed per conference.
      </p>
      <ul className="mt-8 space-y-6">
        {events.map((ev) => (
          <li key={ev.name} className="card">
            <h2 className="text-xl font-bold text-minne-navy">{ev.name}</h2>
            <p className="text-sm text-gray-600">{ev.date}</p>
            <p className="mt-2 text-sm text-gray-800">{ev.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ev.submitHref && (
                <Link href={ev.submitHref} className="btn-primary text-white no-underline">
                  Submit a talk
                </Link>
              )}
              {ev.archiveHref && (
                <Link href={ev.archiveHref} className="btn-secondary">
                  Slide deck archive
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/" className="text-minne-navy underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
