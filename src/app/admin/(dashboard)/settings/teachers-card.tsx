"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTeacher, removeTeacher } from "../actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import type { Teacher } from "@/lib/types";

function AddTeacherForm() {
  const [state, formAction, pending] = useActionState(addTeacher, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Teacher name
        </label>
        <Input name="fullName" required placeholder="e.g. Ustadzah Fatimah" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

function RemoveTeacherButton({ teacherId }: { teacherId: string }) {
  const [, formAction, pending] = useActionState(removeTeacher, undefined);
  return (
    <form action={formAction}>
      <input type="hidden" name="teacherId" value={teacherId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Remove
      </button>
    </form>
  );
}

export function TeachersCard({ teachers }: { teachers: Teacher[] }) {
  return (
    <Card className="mt-4">
      <h2 className="mb-1 text-sm font-semibold text-zinc-700">Teachers</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Pre-fill names teachers can pick from when starting a session -- they
        can still add a new name on the spot if they&apos;re not listed.
      </p>
      <AddTeacherForm />
      <ul className="mt-4 flex flex-col gap-1">
        {teachers.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            {t.full_name}
            <RemoveTeacherButton teacherId={t.id} />
          </li>
        ))}
        {teachers.length === 0 && (
          <p className="text-sm text-zinc-500">No teachers added yet.</p>
        )}
      </ul>
    </Card>
  );
}
