import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listStudents, getKelompokContext } from "../actions";
import { AddStudentForm } from "./add-student-form";

export default async function StudentsPage() {
  const [students, { classes, terms }] = await Promise.all([
    listStudents(),
    getKelompokContext(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">Students</h1>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">
          Add a Student
        </h2>
        <AddStudentForm classes={classes} terms={terms} />
      </Card>

      <div className="mt-6 flex flex-col gap-2">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/admin/students/${s.id}`}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
          >
            <span className="font-medium text-zinc-900">{s.full_name}</span>
            {!s.is_active && (
              <span className="text-xs text-zinc-400">Inactive</span>
            )}
          </Link>
        ))}
        {students.length === 0 && (
          <p className="text-sm text-zinc-500">No students yet.</p>
        )}
      </div>
    </div>
  );
}
