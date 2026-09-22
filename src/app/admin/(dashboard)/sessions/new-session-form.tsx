"use client";

import { useActionState } from "react";
import { adminCreateSession } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { SchoolClass } from "@/lib/types";

function todayIso() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function NewSessionForm({
  classes,
  termId,
}: {
  classes: SchoolClass[];
  termId?: string;
}) {
  const [state, formAction, pending] = useActionState(adminCreateSession, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="termId" value={termId ?? ""} />

      <Field label="Class">
        <Select name="classId" required defaultValue="" disabled={classes.length === 0}>
          <option value="" disabled>
            {classes.length === 0 ? "Add a class first" : "Choose a class"}
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Date">
        <Input type="date" name="sessionDate" defaultValue={todayIso()} required />
      </Field>

      <Field label="Teacher name">
        <Input name="teacherName" required placeholder="e.g. Ustadzah Fatimah" />
      </Field>

      {!termId && (
        <p className="sm:col-span-2 text-sm text-amber-700">
          Choose a term above before creating a session.
        </p>
      )}
      {state?.error && (
        <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending || classes.length === 0 || !termId}>
          {pending ? "Creating..." : "Create session"}
        </Button>
      </div>
    </form>
  );
}
