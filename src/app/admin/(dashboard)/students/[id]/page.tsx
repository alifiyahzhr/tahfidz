import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getStudentProfile, getKelompokContext } from "../../actions";
import { StudentDetailForm } from "./student-detail-form";
import { EnrollmentForm } from "./enrollment-form";
import {
  ATTENDANCE_LABELS,
  PROFICIENCY_LABELS,
  type AttendanceStatus,
  type ProficiencyRating,
} from "@/lib/types";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ student, enrollments, records }, { classes, terms }] = await Promise.all([
    getStudentProfile(id),
    getKelompokContext(),
  ]);

  const currentByTerm = new Map(enrollments.map((e) => [e.term_id, e.class_id]));

  return (
    <div>
      <Link href="/admin/students" className="text-sm text-zinc-500 hover:text-zinc-700">
        &larr; All students
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-zinc-900">{student.full_name}</h1>

      <Card className="mt-4">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Details</h2>
        <StudentDetailForm student={student} />
      </Card>

      <Card className="mt-4">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Class by Term</h2>
        <EnrollmentForm
          studentId={student.id}
          terms={terms}
          classes={classes}
          currentByTerm={currentByTerm}
        />
      </Card>

      <Card className="mt-4">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Session History</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs text-zinc-500">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Term</th>
                <th className="pb-2 pr-4">Class</th>
                <th className="pb-2 pr-4">Attendance</th>
                <th className="pb-2 pr-4">Progress</th>
                <th className="pb-2 pr-4">Rating</th>
                <th className="pb-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {r.sessions?.session_date}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{r.sessions?.terms?.name}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{r.sessions?.classes?.name}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {ATTENDANCE_LABELS[r.attendance as AttendanceStatus]}
                  </td>
                  <td className="py-2 pr-4">{r.progress_text ?? "-"}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {r.proficiency
                      ? PROFICIENCY_LABELS[r.proficiency as ProficiencyRating]
                      : "-"}
                  </td>
                  <td className="py-2">{r.comments ?? "-"}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-zinc-400">
                    No sessions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
