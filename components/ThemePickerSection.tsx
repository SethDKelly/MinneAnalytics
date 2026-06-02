"use client";

import { useState } from "react";
import { ProposeThemeField, type ThemePickOption } from "./ProposeThemeField";
import { ThemeMultiSelect } from "./ThemeMultiSelect";

type Props = {
  conferenceSlug: string;
  initialThemes: ThemePickOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  proposedBySubmissionId?: string;
};

export function ThemePickerSection({
  conferenceSlug,
  initialThemes,
  selected,
  onChange,
  proposedBySubmissionId,
}: Props) {
  const [themes, setThemes] = useState<ThemePickOption[]>(initialThemes);

  function onThemeAdded(theme: ThemePickOption) {
    setThemes((prev) => {
      if (prev.some((t) => t.id === theme.id)) return prev;
      return [...prev, theme];
    });
  }

  return (
    <div>
      <ThemeMultiSelect themes={themes} selected={selected} onChange={onChange} />
      <ProposeThemeField
        conferenceSlug={conferenceSlug}
        selected={selected}
        onChange={onChange}
        onThemeAdded={onThemeAdded}
        proposedBySubmissionId={proposedBySubmissionId}
      />
    </div>
  );
}
