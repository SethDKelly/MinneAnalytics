import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-minne-navy">Page not found</h1>
      <p className="mt-2 text-gray-600">
        This link may be invalid or expired. Review and presenter URLs are private.
      </p>
      <Link href="/" className="btn-primary mt-6 inline-block">
        Return home
      </Link>
    </div>
  );
}
