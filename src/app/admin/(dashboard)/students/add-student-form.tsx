"use client";

import { useActionState, useRef, useEffect } from "react";
import { createStudent } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { SchoolClass, Term } from "@/lib/types";

export function AddStudentForm({
  classes,
  terms,
}: {
  classes: SchoolClass[];
  terms: Term[];
}) {
  const [state, formAction, pending] = useActionState(createStudent, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const activeTerm = terms.find((t) => t.is_active) ?? terms[0];

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name">
        <Input name="fullName" required />
      </Field>
      <Field label="Date of birth (optional)">
        <Input type="date" name="dob" />
      </Field>
      <Field label="Guardian name (optional)">
        <Input name="guardianName" />
      </Field>
      <Field label="Guardian contact (optional)">
        <Input name="guardianContact" />
      </Field>
      <Field label="Starting class (optional)">
        <Select name="classId" defaultValue="">
          <option value="">No class yet</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <input type="hidden" name="termId" value={activeTerm?.id ?? ""} />

      {state?.error && (
        <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="sm:col-span-2 text-sm text-emerald-700">Student added.</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add student"}
        </Button>
      </div>
    </form>
  );
}
