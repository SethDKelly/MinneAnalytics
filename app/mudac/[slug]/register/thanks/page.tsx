import Link from "next/link";

export default async function MudacRegisterThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-minne-navy">Registration complete</h1>
      <p className="mt-4 text-gray-700">
        Thank you for volunteering as a MinneMUDAC judge. A confirmation message was logged to
        the dev server console (email stub).
      </p>
      {token && (
        <div className="card mt-6">
          <h2 className="font-bold text-minne-navy">Your judging portal</h2>
          <p className="mt-2 text-sm text-gray-700">
            Save this private link. You will use it to score team presentations once assigned
            to a panel.
          </p>
          <p className="mt-3 break-all rounded bg-gray-100 p-3 font-mono text-xs">
            /mudac/judge/…
          </p>
          <Link href={`/mudac/judge/${token}`} className="btn-primary mt-4">
            Open judging portal
          </Link>
        </div>
      )}
      <Link href="/mudac" className="mt-8 inline-block text-sm">
        ← Back to MinneMUDAC demo
      </Link>
      <span className="mx-2 text-gray-400">·</span>
      <Link href={`/mudac/${slug}/register`} className="text-sm">
        Register another judge
      </Link>
    </div>
  );
}
