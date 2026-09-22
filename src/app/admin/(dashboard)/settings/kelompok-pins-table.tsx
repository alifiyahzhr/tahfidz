"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changeKelompokPin } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import type { KelompokWithDaerah } from "@/lib/types";

function PinCell({ pin }: { pin: string | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!pin) {
    return <span className="text-sm text-zinc-400">Not set</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed((r) => !r)}
      className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-900"
      title={revealed ? "Hide PIN" : "Show PIN"}
    >
      {revealed ? pin : "•".repeat(Math.max(pin.length, 6))}
      {revealed ? (
        <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
      ) : (
        <Eye className="h-3.5 w-3.5 text-zinc-400" />
      )}
    </button>
  );
}

function ChangePinRow({ kelompokId }: { kelompokId: string }) {
  const [state, formAction, pending] = useActionState(changeKelompokPin, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-emerald-700 hover:text-emerald-800"
      >
        Change
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input type="hidden" name="kelompokId" value={kelompokId} />
      <Input name="newPin" placeholder="New PIN" className="w-32 py-1.5 text-sm" />
      <Input name="confirmPin" placeholder="Confirm" className="w-32 py-1.5 text-sm" />
      <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-1.5 text-sm">
        {pending ? "Saving..." : "Save"}
      </Button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-1 text-sm text-zinc-500 hover:text-zinc-700"
      >
        {state?.success ? "Done" : "Cancel"}
      </button>
      {state?.error && (
        <p className="w-full text-xs text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full text-xs text-emerald-700">PIN updated.</p>
      )}
    </form>
  );
}

export function KelompokPinsTable({ kelompoks }: { kelompoks: KelompokWithDaerah[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500">
            <th className="pb-2 pr-4">Kelompok</th>
            <th className="pb-2 pr-4">Daerah</th>
            <th className="pb-2 pr-4">PIN</th>
            <th className="pb-2">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {kelompoks.map((k) => (
            <tr key={k.id} className="border-b border-zinc-100">
              <td className="py-3 pr-4 font-medium text-zinc-900">{k.name}</td>
              <td className="py-3 pr-4 text-zinc-600">{k.daerah_name}</td>
              <td className="py-3 pr-4">
                <PinCell pin={k.pin} />
              </td>
              <td className="py-3">
                <ChangePinRow kelompokId={k.id} />
              </td>
            </tr>
          ))}
          {kelompoks.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-zinc-400">
                No kelompok found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
