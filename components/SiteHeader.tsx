import Link from "next/link";

const nav = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/upcoming" },
  { label: "MUDAC demo", href: "/mudac" },
  { label: "Slide decks", href: "/archive/data-tech-2027" },
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
              Conference &amp; MUDAC demos
            </span>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-minne-navy">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-minne-navy no-underline hover:underline"
            >
              {item.label}
            </Link>
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
