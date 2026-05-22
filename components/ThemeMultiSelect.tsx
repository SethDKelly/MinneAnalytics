"use client";

type ThemeOption = { id: string; name: string };

type Props = {
  themes: ThemeOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
};

export function ThemeMultiSelect({ themes, selected, onChange, max = 3 }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }
    if (selected.length >= max) return;
    onChange([...selected, id]);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Select up to {max} themes that best describe your presentation.
      </p>
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className={`rounded-full border px-3 py-1 text-sm ${
                on
                  ? "border-minne-navy bg-minne-navy text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:border-minne-navy"
              }`}
              onClick={() => toggle(t.id)}
            >
              {t.name}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-amber-800">At least one theme is required.</p>
      )}
    </div>
  );
}
