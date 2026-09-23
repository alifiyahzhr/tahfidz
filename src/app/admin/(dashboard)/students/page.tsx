import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { listStudents, getKelompokContext } from "../actions";
import { AddStudentForm } from "./add-student-form";
import { calculateAge } from "@/lib/format";

export default async function StudentsPage() {
  const { classes, terms } = await getKelompokContext();
  const activeTerm = terms.find((t) => t.is_active) ?? terms[0];
  const students = await listStudents(activeTerm?.id);

  return (
    <div>
      <PageTitle icon={Users}>Students</PageTitle>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">
          Add a Student
        </h2>
        <AddStudentForm classes={classes} terms={terms} />
      </Card>

      <div className="mt-6 flex flex-col gap-2">
        {students.map((s) => {
          const age = calculateAge(s.date_of_birth);
          return (
            <Link
              key={s.id}
              href={`/admin/students/${s.id}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
            >
              <span className="font-medium text-zinc-900">{s.full_name}</span>
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                {age !== null && <span>{age} yrs</span>}
                {s.className && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600">
                    {s.className}
                  </span>
                )}
                {!s.className && (
                  <span className="text-amber-600">No class</span>
                )}
                {!s.is_active && <span className="text-zinc-400">Inactive</span>}
              </span>
            </Link>
          );
        })}
        {students.length === 0 && (
          <p className="text-sm text-zinc-500">No students yet.</p>
        )}
      </div>
    </div>
  );
}
