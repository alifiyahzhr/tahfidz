"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui/field";
import type { Term } from "@/lib/types";

export function TermPicker({
  terms,
  selectedTermId,
}: {
  terms: Term[];
  selectedTermId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      className="w-auto py-2"
      defaultValue={selectedTermId ?? ""}
      onChange={(e) => router.push(`${pathname}?term=${e.target.value}`)}
    >
      {terms.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name} {t.is_active ? "(active)" : ""}
        </option>
      ))}
    </Select>
  );
}
