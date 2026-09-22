"use client";

import { useActionState } from "react";
import { updateStudent } from "../../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { Student } from "@/lib/types";

export function StudentDetailForm({ student }: { student: Student }) {
  const [state, formAction, pending] = useActionState(updateStudent, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="studentId" value={student.id} />

      <Field label="Full name">
        <Input name="fullName" defaultValue={student.full_name} required />
      </Field>
      <Field label="Date of birth">
        <Input type="date" name="dob" defaultValue={student.date_of_birth ?? ""} />
      </Field>
      <Field label="Guardian name">
        <Input name="guardianName" defaultValue={student.guardian_name ?? ""} />
      </Field>
      <Field label="Guardian contact">
        <Input name="guardianContact" defaultValue={student.guardian_contact ?? ""} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notes">
          <Textarea name="notes" rows={3} defaultValue={student.notes ?? ""} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={student.is_active}
          className="h-4 w-4 rounded border-zinc-300"
        />
        Active
      </label>

      {state?.error && (
        <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="sm:col-span-2 text-sm text-emerald-700">Saved.</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
