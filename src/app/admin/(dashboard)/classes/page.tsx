import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { CLASS_TYPE_LABELS } from "@/lib/types";
import { getKelompokContext, getClassesOverview } from "../actions";
import { AddClassForm } from "./add-class-form";
import { TermPicker } from "../term-picker";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const { term: termParam } = await searchParams;
  const { terms } = await getKelompokContext();
  const activeTerm = terms.find((t) => t.id === termParam) ?? terms.find((t) => t.is_active) ?? terms[0];
  const classes = await getClassesOverview(activeTerm?.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle icon={GraduationCap}>Classes</PageTitle>
        <TermPicker terms={terms} selectedTermId={activeTerm?.id} />
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Add a Class</h2>
        <AddClassForm />
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {classes.map((c) => (
          <Link key={c.id} href={`/admin/classes/${c.id}`}>
            <Card className="transition-colors hover:border-emerald-300 hover:bg-zinc-50 active:bg-zinc-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-500">{CLASS_TYPE_LABELS[c.type]}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {c.minAge !== null && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600">
                      {c.minAge === c.maxAge ? `${c.minAge} yrs` : `${c.minAge}-${c.maxAge} yrs`}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                    {c.studentCount} {c.studentCount === 1 ? "student" : "students"}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {classes.length === 0 && (
          <p className="text-sm text-zinc-500">No classes yet.</p>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Targets are set per student now, from each student&apos;s profile
        page -- open a student under{" "}
        <Link href="/admin/students" className="underline">
          Students
        </Link>{" "}
        to set theirs.
      </p>
    </div>
  );
}
