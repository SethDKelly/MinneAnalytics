import Link from "next/link";

export default function ArchiveNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-minne-navy">No public decks</h1>
      <p className="mt-4 text-gray-700">
        This archive is published but no shareable slide decks are available yet.
      </p>
      <Link href="/upcoming" className="btn-secondary mt-6 inline-block">
        View events
      </Link>
    </div>
  );
}
