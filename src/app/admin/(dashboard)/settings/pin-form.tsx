"use client";

import { useActionState, useRef, useEffect } from "react";
import { changeKelompokPin } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function PinForm() {
  const [state, formAction, pending] = useActionState(changeKelompokPin, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 max-w-sm">
      <Field label="New PIN" hint="Shared with all teachers in this kelompok.">
        <Input type="text" name="newPin" required />
      </Field>
      <Field label="Confirm new PIN">
        <Input type="text" name="confirmPin" required />
      </Field>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-700">PIN updated.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update PIN"}
      </Button>
    </form>
  );
}
