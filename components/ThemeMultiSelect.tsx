"use client";

import type { ThemeSource } from "@prisma/client";

export type ThemePickOption = {
  id: string;
  name: string;
  source: ThemeSource;
};

type Props = {
  themes: ThemePickOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
};

export function ThemeMultiSelect({ themes, selected, onChange, max = 3 }: Props) {
  const official = themes.filter((t) => t.source === "ADMIN");
  const community = themes.filter((t) => t.source === "PRESENTER");

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }
    if (selected.length >= max) return;
    onChange([...selected, id]);
  }

  function renderGroup(label: string, items: ThemePickOption[]) {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((t) => {
            const on = selected.includes(t.id);
            const atMax = selected.length >= max && !on;
            return (
              <button
                key={t.id}
                type="button"
                disabled={atMax}
                className={`rounded-full border px-3 py-1 text-sm ${
                  on
                    ? "border-minne-navy bg-minne-navy text-white"
                    : atMax
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-gray-300 bg-white text-gray-800 hover:border-minne-navy"
                }`}
                onClick={() => toggle(t.id)}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Select up to {max} themes that best describe your presentation.
      </p>
      {renderGroup("Conference themes", official)}
      {renderGroup("Suggested by speakers", community)}
      {selected.length === 0 && (
        <p className="text-xs text-amber-800">At least one theme is required.</p>
      )}
    </div>
  );
}
