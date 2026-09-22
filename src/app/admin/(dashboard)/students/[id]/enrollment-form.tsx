"use client";

import { useActionState } from "react";
import { setEnrollment } from "../../actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import type { SchoolClass, Term } from "@/lib/types";

export function EnrollmentForm({
  studentId,
  terms,
  classes,
  currentByTerm,
}: {
  studentId: string;
  terms: Term[];
  classes: SchoolClass[];
  currentByTerm: Map<string, string>;
}) {
  const [state, formAction, pending] = useActionState(setEnrollment, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="studentId" value={studentId} />

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Term</label>
        <Select name="termId" required className="py-2" defaultValue={terms.find((t) => t.is_active)?.id ?? ""}>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Class</label>
        <Select name="classId" required className="py-2" defaultValue="">
          <option value="" disabled>
            Choose
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Saving..." : "Set class"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="w-full text-xs text-zinc-500">
        {terms.map((t) => (
          <div key={t.id}>
            {t.name}: {classes.find((c) => c.id === currentByTerm.get(t.id))?.name ?? "-"}
          </div>
        ))}
      </div>
    </form>
  );
}
