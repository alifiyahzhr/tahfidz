import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getStudentProfile, getKelompokContext, getStudentTargets } from "../../actions";
import { StudentDetailForm } from "./student-detail-form";
import { EnrollmentForm } from "./enrollment-form";
import { TargetForm } from "./target-form";
import { TermPicker } from "../../term-picker";
import { ProgressChart } from "@/components/charts/progress-chart";
import { calculateAge } from "@/lib/format";
import {
  ATTENDANCE_LABELS,
  PROFICIENCY_LABELS,
  type AttendanceStatus,
  type ProficiencyRating,
} from "@/lib/types";

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const { id } = await params;
  const { term: termParam } = await searchParams;
  const [{ student, enrollments, records }, { classes, terms }, targets] = await Promise.all([
    getStudentProfile(id),
    getKelompokContext(),
    getStudentTargets(id),
  ]);

  const currentByTerm = new Map(enrollments.map((e) => [e.term_id, e.class_id]));
  const targetByTerm = new Map(targets.map((t) => [t.term_id, t.target_text]));
  const age = calculateAge(student.date_of_birth);

  const chartTerm = terms.find((t) => t.id === termParam) ?? terms.find((t) => t.is_active) ?? terms[0];
  const termRecords = chartTerm
    ? records.filter((r) => r.sessions?.term_id === chartTerm.id)
    : [];
  const proficiencyCounts = { ulang: 0, cukup: 0, baik: 0, lancar: 0 };
  for (const r of termRecords) {
    if (r.proficiency) proficiencyCounts[r.proficiency as ProficiencyRating] += 1;
  }
  const chartData = [{ className: chartTerm?.name ?? "", ...proficiencyCounts }];

  return (
    <div>
      <Link href="/admin/students" className="text-sm text-zinc-500 hover:text-zinc-700">
        &larr; All students
      </Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">{student.full_name}</h1>
        {age !== null && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {age} yrs
          </span>
        )}
      </div>

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
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Target by Term</h2>
        <TargetForm studentId={student.id} terms={terms} targetByTerm={targetByTerm} />
      </Card>

      <Card className="mt-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-700">Progress This Term</h2>
          <TermPicker terms={terms} selectedTermId={chartTerm?.id} />
        </div>
        <p className="mb-2 text-xs text-zinc-500">
          Proficiency ratings logged in {chartTerm?.name ?? "this term"}.
        </p>
        {termRecords.some((r) => r.proficiency) ? (
          <ProgressChart data={chartData} />
        ) : (
          <p className="py-8 text-center text-sm text-zinc-400">
            No proficiency ratings logged yet this term.
          </p>
        )}
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
