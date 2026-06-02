export function RescoreIndicator({ version }: { version: number }) {
  return (
    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-950">
      Rescore needed (v{version})
    </span>
  );
}
