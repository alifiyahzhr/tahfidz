"use client";

import { useActionState } from "react";
import { setStudentTarget } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import type { Term } from "@/lib/types";

export function TargetForm({
  studentId,
  terms,
  targetByTerm,
}: {
  studentId: string;
  terms: Term[];
  targetByTerm: Map<string, string>;
}) {
  const [state, formAction, pending] = useActionState(setStudentTarget, undefined);
  const defaultTermId = terms.find((t) => t.is_active)?.id ?? terms[0]?.id ?? "";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="studentId" value={studentId} />

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Term</label>
        <Select name="termId" required className="py-2" defaultValue={defaultTermId}>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-500">Target</label>
        <Input
          name="targetText"
          defaultValue={targetByTerm.get(defaultTermId) ?? ""}
          placeholder="e.g. Complete Juz 29"
          className="py-2"
        />
      </div>
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Saving..." : "Save target"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="w-full text-xs text-zinc-500">
        {terms.map((t) => (
          <div key={t.id}>
            {t.name}: {targetByTerm.get(t.id) || <span className="text-zinc-400">No target set</span>}
          </div>
        ))}
      </div>
    </form>
  );
}
