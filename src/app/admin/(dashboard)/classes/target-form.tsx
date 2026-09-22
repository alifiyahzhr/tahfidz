"use client";

import { useActionState } from "react";
import { setClassTarget } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function TargetForm({
  classId,
  termId,
  initialTarget,
}: {
  classId: string;
  termId: string;
  initialTarget: string;
}) {
  const [state, formAction, pending] = useActionState(setClassTarget, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="termId" value={termId} />
      <Input
        name="targetText"
        defaultValue={initialTarget}
        placeholder="e.g. Complete Juz 29"
        className="py-2"
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
