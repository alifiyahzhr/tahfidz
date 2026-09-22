import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
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
        <PageTitle icon={BarChart3}>Reports</PageTitle>
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
            <h2 className="text-sm font-semibold text-zinc-700">Progress by Class</h2>
            <p className="mb-2 mt-1 text-xs text-zinc-500">
              Proficiency ratings logged this term. Individual targets are set
              per student on their profile.
            </p>
            <ProgressChart data={progress} />
          </Card>
        </>
      )}
    </div>
  );
}
