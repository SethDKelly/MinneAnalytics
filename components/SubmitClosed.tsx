import Link from "next/link";

type Props = {
  conferenceName: string;
  message: string;
};

export function SubmitClosed({ conferenceName, message }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-minne-navy">Submissions closed</h1>
      <p className="mt-2 text-gray-700">{conferenceName}</p>
      <p className="mt-4 text-gray-800">{message}</p>
      <Link href="/upcoming" className="btn-secondary mt-8 inline-block">
        View events
      </Link>
    </div>
  );
}
