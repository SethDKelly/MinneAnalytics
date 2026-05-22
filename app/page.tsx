import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-minne-navy to-minne-navy-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="mb-4 text-4xl font-bold">Data Tech 2027 — Call for presentations</h1>
          <p className="mb-6 max-w-2xl text-lg text-white/90">
            MinneAnalytics supports the analytics community through accessible, authentic, and
            engaging events. Submit your abstract for consideration by the program committee.
          </p>
          <Link href="/submit/data-tech-2027" className="btn-primary bg-white text-minne-navy hover:bg-gray-100">
            Submit presentation
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
        <article className="card">
          <h2 className="mb-2 text-xl font-bold text-minne-navy">About Us</h2>
          <p className="text-sm text-gray-700">
            We support the analytics community through accessible, authentic, and engaging
            events.
          </p>
        </article>
        <article className="card">
          <h2 className="mb-2 text-xl font-bold text-minne-navy">Become a Member</h2>
          <p className="text-sm text-gray-700">
            Join more than 17,000 peers in the analytics community.
          </p>
        </article>
        <article className="card">
          <h2 className="mb-2 text-xl font-bold text-minne-navy">Conference planning</h2>
          <p className="text-sm text-gray-700">
            Board and chairs use private review links to score abstracts, manage backups, and
            approve final program slots.
          </p>
        </article>
      </section>

      <section className="border-t bg-gray-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-minne-navy">Latest news (demo)</h2>
          <ul className="space-y-3 text-sm">
            <li className="card">
              <strong>MinneMUDAC returns in 2026!</strong>
              <span className="ml-2 text-gray-500">May 14, 2026</span>
            </li>
            <li className="card">
              <strong>Thanks for participating at Data Tech 2026!</strong>
              <span className="ml-2 text-gray-500">May 8, 2026</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
