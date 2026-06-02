type FeedbackItem = {
  id: string;
  kind: "ABSTRACT" | "GENERAL";
  body: string;
  reviewerLabel: string;
  abstractVersion: number | null;
  createdAt: string;
};

type Props = {
  feedback: FeedbackItem[];
};

const KIND_LABELS: Record<FeedbackItem["kind"], string> = {
  ABSTRACT: "Abstract feedback",
  GENERAL: "General feedback",
};

export function PresenterFeedbackList({ feedback }: Props) {
  if (feedback.length === 0) return null;

  return (
    <section className="card mt-6">
      <h3 className="font-bold text-minne-navy">Committee feedback</h3>
      <p className="mt-2 text-sm text-gray-700">
        Comments from the program committee. Update your submission above if asked to revise
        your abstract.
      </p>
      <ul className="mt-4 space-y-4">
        {feedback.map((f) => (
          <li key={f.id} className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-minne-navy">
                {KIND_LABELS[f.kind]}
                {f.abstractVersion != null ? ` · v${f.abstractVersion}` : ""}
              </span>
              <span className="text-xs text-gray-500">
                {f.reviewerLabel} ·{" "}
                {new Date(f.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-gray-800">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
