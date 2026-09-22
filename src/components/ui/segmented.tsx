"use client";

import { clsx } from "clsx";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  colorFor,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  name: string;
  colorFor?: (value: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? (colorFor?.(opt.value) ?? "bg-emerald-700 text-white border-emerald-700")
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
