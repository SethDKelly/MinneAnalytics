export function RevisionBadge({ version }: { version: number }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
      v{version}
    </span>
  );
}
