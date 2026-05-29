import Link from "next/link";
import { notFound } from "next/navigation";
import { MudacJudgeRegistrationForm } from "@/components/MudacJudgeRegistrationForm";
import { canRegisterForEvent } from "@/lib/mudac/auth";
import { getMudacEventBySlug } from "@/lib/mudac/queries";

export default async function MudacRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getMudacEventBySlug(slug);
  if (!event) notFound();

  const reg = canRegisterForEvent(event);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-sm text-gray-600">
        <Link href="/mudac" className="text-minne-navy underline">
          MinneMUDAC demo
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-minne-navy">Judge registration</h1>
      <p className="mt-2 text-gray-700">{event.name}</p>

      {!reg.ok ? (
        <div className="card mt-6 p-4 text-sm text-gray-700">{reg.message}</div>
      ) : (
        <MudacJudgeRegistrationForm
          eventSlug={slug}
          eventName={event.name}
          requiresCode={Boolean(event.registrationCodeHash)}
        />
      )}
    </div>
  );
}
