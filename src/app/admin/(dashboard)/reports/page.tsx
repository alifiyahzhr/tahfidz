import { Card } from "@/components/ui/card";
import { getKelompokContext, getAttendanceReport, getProgressReport } from "../actions";
import { TermPicker } from "../term-picker";
import { AttendanceChart } from "@/components/charts/attendance-chart";
import { ProgressChart } from "@/components/charts/progress-chart";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const { term: termParam } = await searchParams;
  const { terms } = await getKelompokContext();
  const activeTerm = terms.find((t) => t.id === termParam) ?? terms.find((t) => t.is_active) ?? terms[0];

  const [attendance, progress] = activeTerm
    ? await Promise.all([
        getAttendanceReport(activeTerm.id),
        getProgressReport(activeTerm.id),
      ])
    : [[], []];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Reports</h1>
        <TermPicker terms={terms} selectedTermId={activeTerm?.id} />
      </div>

      {!activeTerm && <p className="mt-6 text-sm text-zinc-500">No terms set up yet.</p>}

      {activeTerm && (
        <>
          <Card className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-700">Attendance by Class</h2>
            <AttendanceChart data={attendance} />
          </Card>

          <Card className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-700">Progress vs Target</h2>
            <p className="mb-2 mt-1 text-xs text-zinc-500">
              Proficiency ratings logged this term against each class&apos;s target.
            </p>
            <ul className="mb-2 flex flex-col gap-1 text-xs text-zinc-600">
              {progress.map((p) => (
                <li key={p.classId}>
                  <span className="font-medium text-zinc-800">{p.className}:</span>{" "}
                  {p.target ? p.target : <span className="text-zinc-400">No target set</span>}
                </li>
              ))}
            </ul>
            <ProgressChart data={progress} />
          </Card>
        </>
      )}
    </div>
  );
}
