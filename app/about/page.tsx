import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">About MinneAnalytics</h1>
      <p className="mt-4 text-gray-700 leading-relaxed">
        MinneAnalytics supports the analytics community through accessible, authentic, and
        engaging events across the Twin Cities and the Upper Midwest. We bring together
        data scientists, analysts, engineers, and business leaders to share practical
        knowledge and build lasting professional relationships.
      </p>
      <p className="mt-4 text-gray-700 leading-relaxed">
        Our conferences—including Data Tech—feature community-driven sessions selected by
        a volunteer board and conference co-chairs. After each event, shareable slide decks
        are published for attendees who could not join every room.
      </p>
      <p className="mt-6">
        <Link href="/" className="text-minne-navy underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
