"use client";

import { useActionState, useRef, useEffect } from "react";
import { createClass } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function AddClassForm() {
  const [state, formAction, pending] = useActionState(createClass, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <Field label="Class name">
          <Input name="name" required className="py-2" placeholder="e.g. Juz Amma" />
        </Field>
      </div>
      <div>
        <Field label="Type">
          <Select name="type" required className="py-2" defaultValue="">
            <option value="" disabled>
              Choose
            </option>
            <option value="memorisation">Memorisation</option>
            <option value="recitation">Recitation</option>
          </Select>
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add class"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
