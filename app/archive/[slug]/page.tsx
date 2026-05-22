import Link from "next/link";
import { getPublicDeckArchive } from "@/lib/decks";

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { conference, decks } = await getPublicDeckArchive(slug);

  if (!conference) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-minne-navy">Slide decks not available</h1>
        <p className="mt-4 text-gray-700">
          The post-conference slide library for this event has not been published yet, or
          the board has not released decks for public sharing.
        </p>
        <Link href="/upcoming" className="btn-secondary mt-6 inline-block">
          View events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">{conference.name} — Slide decks</h1>
      <p className="mt-2 text-gray-700">
        Post-conference library of sessions the board approved for public sharing. Decks
        marked non-shareable by the board are not listed.
      </p>
      {conference.decksPublishedAt && (
        <p className="mt-1 text-sm text-gray-500">
          Published{" "}
          {conference.decksPublishedAt.toLocaleDateString(undefined, {
            dateStyle: "long",
          })}
        </p>
      )}

      {decks.length === 0 ? (
        <p className="mt-8 text-gray-600 italic">
          No slide decks are currently shared for this event. Presenters may still be
          uploading, or the board may have marked sessions as non-shareable.
        </p>
      ) : (
      <ul className="mt-8 space-y-4">
        {decks.map((deck) => (
          <li key={deck.publicId} className="card flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-minne-navy">{deck.title}</h2>
              <p className="text-sm text-gray-600">
                {deck.presenters} · {deck.organization}
              </p>
              <p className="mt-1 text-xs text-gray-500">{deck.filename}</p>
            </div>
            <a
              href={`/api/decks/public/${deck.publicId}`}
              className="btn-primary text-white no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View / download
            </a>
          </li>
        ))}
      </ul>
      )}

      <p className="mt-8">
        <Link href="/upcoming" className="text-minne-navy underline">
          ← All events
        </Link>
      </p>
    </div>
  );
}
