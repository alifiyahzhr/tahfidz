import { redirect } from "next/navigation";
import { getKelompokSession } from "@/lib/teacher-session";
import { getActiveTerm, getClassesForCurrentKelompok } from "../actions";
import { StartForm } from "./start-form";

export default async function StartPage() {
  const session = await getKelompokSession();
  if (!session) redirect("/teacher");

  const [classes, activeTerm] = await Promise.all([
    getClassesForCurrentKelompok(),
    getActiveTerm(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-zinc-900">New session</h1>

        {!activeTerm && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No term is currently active. Ask your admin to set one before you
            can record progress.
          </p>
        )}
        {activeTerm && (
          <p className="mt-1 text-sm text-zinc-500">{activeTerm.name}</p>
        )}

        <div className="mt-8">
          <StartForm classes={classes} kelompokName={session.kelompokName} />
        </div>
      </div>
    </main>
  );
}
