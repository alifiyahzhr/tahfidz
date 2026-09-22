"use client";

import { useActionState } from "react";
import { startSession } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { SchoolClass } from "@/lib/types";
import { CLASS_TYPE_LABELS } from "@/lib/types";

function todayIso() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function StartForm({
  classes,
  kelompokName,
}: {
  classes: SchoolClass[];
  kelompokName: string;
}) {
  const [state, formAction, pending] = useActionState(startSession, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500">Kelompok: {kelompokName}</p>

      <Field label="Your name">
        <Input name="teacherName" placeholder="e.g. Ustadzah Fatimah" required />
      </Field>

      <Field label="Class">
        <Select name="classId" required defaultValue="">
          <option value="" disabled>
            Choose a class
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} &mdash; {CLASS_TYPE_LABELS[c.type]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Date">
        <Input type="date" name="sessionDate" defaultValue={todayIso()} required />
      </Field>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Loading..." : "Start session"}
      </Button>
    </form>
  );
}
