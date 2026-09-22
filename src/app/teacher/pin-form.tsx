"use client";

import { useActionState } from "react";
import { verifyPin } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function PinForm() {
  const [state, formAction, pending] = useActionState(verifyPin, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        type="password"
        inputMode="numeric"
        name="pin"
        placeholder="Kelompok PIN"
        autoFocus
        required
        className="text-center text-xl tracking-widest"
      />
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Checking..." : "Continue"}
      </Button>
    </form>
  );
}
