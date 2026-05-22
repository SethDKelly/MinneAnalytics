import Link from "next/link";

const nav = [
  {
    label: "Community",
    href: "#",
    children: ["About Us", "News", "Scholarships", "Startups", "Leadership"],
  },
  {
    label: "Events",
    href: "#",
    children: ["Upcoming", "Past Events", "Meetups"],
  },
  {
    label: "Jobs",
    href: "#",
    children: ["Job Listings", "Post Job"],
  },
];

export function SiteHeader() {
  return (
    <header className="border-b border-minne-navy/20">
      <div className="bg-minne-navy text-white text-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <span>Twin Cities Big Data, Data Science and Analytics Community</span>
          <div className="hidden gap-4 sm:flex">
            <Link href="#" className="text-white/90 no-underline hover:text-white">
              Join
            </Link>
            <Link href="#" className="text-white/90 no-underline hover:text-white">
              Sponsor
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="no-underline hover:no-underline">
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-minne-navy">
              MinneAnalytics
            </span>
            <span className="text-xs text-gray-600">
              Conference planning demo
            </span>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-minne-navy">
          {nav.map((item) => (
            <div key={item.label} className="group relative">
              <span className="cursor-default">{item.label}</span>
            </div>
          ))}
          <Link
            href="/submit/data-tech-2027"
            className="btn-primary text-white no-underline"
          >
            Submit a Talk
          </Link>
        </nav>
      </div>
    </header>
  );
}
