"use client";

import { DEGREE_OPTIONS } from "@/lib/constants";

type Props = {
  name: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  required?: boolean;
};

export function DegreeMultiSelect({ name, label, value, onChange, required }: Props) {
  function toggle(degree: string) {
    if (degree === "None") {
      onChange(["None"]);
      return;
    }
    const withoutNone = value.filter((d) => d !== "None");
    if (withoutNone.includes(degree)) {
      const next = withoutNone.filter((d) => d !== degree);
      onChange(next.length ? next : ["None"]);
    } else {
      onChange([...withoutNone, degree]);
    }
  }

  return (
    <fieldset>
      <legend className="form-label">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {DEGREE_OPTIONS.map((degree) => {
          const checked = value.includes(degree);
          return (
            <label
              key={degree}
              className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                checked
                  ? "border-minne-navy bg-minne-navy text-white"
                  : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={degree}
                checked={checked}
                onChange={() => toggle(degree)}
                className="sr-only"
              />
              {degree}
            </label>
          );
        })}
      </div>
      <p className="form-hint">Select all that apply. Choose None if no post-bachelor degrees.</p>
    </fieldset>
  );
}
