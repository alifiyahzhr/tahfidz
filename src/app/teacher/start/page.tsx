import { redirect } from "next/navigation";
import { getKelompokSession } from "@/lib/teacher-session";
import {
  getActiveTerm,
  getClassesForCurrentKelompok,
  getTeachersForCurrentKelompok,
  signOutTeacher,
} from "../actions";
import { StartForm } from "./start-form";
import { AppIcon } from "@/components/ui/app-icon";

export default async function StartPage() {
  const session = await getKelompokSession();
  if (!session) redirect("/teacher");

  const [classes, teachers, activeTerm] = await Promise.all([
    getClassesForCurrentKelompok(),
    getTeachersForCurrentKelompok(),
    getActiveTerm(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AppIcon size={48} className="mb-3" />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">New Session</h1>
          <form action={signOutTeacher}>
            <button
              type="submit"
              className="rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200"
            >
              Log out
            </button>
          </form>
        </div>

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
          <StartForm classes={classes} teachers={teachers} kelompokName={session.kelompokName} />
        </div>
      </div>
    </main>
  );
}
