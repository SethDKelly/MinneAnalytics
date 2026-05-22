import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t-4 border-minne-navy bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase text-minne-navy">Community</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>
              <Link href="#">About Us</Link>
            </li>
            <li>
              <Link href="#">News Blog</Link>
            </li>
            <li>
              <Link href="#">Scholarships</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase text-minne-navy">Get Involved</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>
              <Link href="#">Upcoming Events</Link>
            </li>
            <li>
              <Link href="/submit/data-tech-2027">Submit a Talk</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase text-minne-navy">Planning Demo</h3>
          <p className="text-sm text-gray-600">
            Chair and reviewer access uses private URLs issued by your administrator.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        MinneAnalytics ©2026 — Prototype
      </div>
    </footer>
  );
}
