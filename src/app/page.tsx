import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <AppIcon size={64} className="mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-zinc-900">
          Tahfidz Tracker
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sydney Kelompok &middot; Progress &amp; Attendance
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <Link
            href="/teacher"
            className="rounded-xl bg-emerald-700 px-6 py-5 text-lg font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            Teacher
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-5 text-lg font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
