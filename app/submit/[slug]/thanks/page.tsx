import Link from "next/link";

export default async function ThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">Thank you for your submission</h1>
      <p className="mt-4 text-gray-700">
        Your abstract has been received and is <strong>Pending</strong> review by the program
        committee.
      </p>
      {token && (
        <div className="card mt-6">
          <h2 className="font-bold text-minne-navy">Your presenter portal</h2>
          <p className="mt-2 text-sm text-gray-700">
            Save this private link to check status, upload your slide deck after approval, or
            withdraw your talk at any time.
          </p>
          <p className="mt-3 break-all rounded bg-gray-100 p-3 font-mono text-xs">
            <Link href={`/presenter/${token}`}>/presenter/…</Link>
          </p>
          <Link href={`/presenter/${token}`} className="btn-primary mt-4">
            Open presenter portal
          </Link>
        </div>
      )}
      <Link href={`/submit/${slug}`} className="mt-8 inline-block text-sm">
        ← Back to event
      </Link>
    </div>
  );
}
