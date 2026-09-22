"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTerm, setActiveTerm } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function CreateTermForm() {
  const [state, formAction, pending] = useActionState(createTerm, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Year">
        <Input type="number" name="year" defaultValue={new Date().getFullYear()} required />
      </Field>
      <Field label="Term number (1-4)">
        <Input type="number" name="termNumber" min={1} max={4} required />
      </Field>
      <Field label="Name">
        <Input name="name" placeholder="e.g. Term 1 2026" required />
      </Field>
      <div />
      <Field label="Start date">
        <Input type="date" name="startDate" required />
      </Field>
      <Field label="End date">
        <Input type="date" name="endDate" required />
      </Field>

      {state?.error && <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add term"}
        </Button>
      </div>
    </form>
  );
}

export function SetActiveTermButton({ termId, isActive }: { termId: string; isActive: boolean }) {
  const [, formAction, pending] = useActionState(setActiveTerm, undefined);

  if (isActive) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
        Active
      </span>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="termId" value={termId} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "..." : "Set active"}
      </Button>
    </form>
  );
}
