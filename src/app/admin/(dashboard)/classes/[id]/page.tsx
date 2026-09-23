import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CLASS_TYPE_LABELS } from "@/lib/types";
import { getKelompokContext, getClassDetail } from "../../actions";
import { TermPicker } from "../../term-picker";
import { ClassProgressScatter } from "@/components/charts/class-progress-scatter";
import { calculateAge } from "@/lib/format";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const { id } = await params;
  const { term: termParam } = await searchParams;
  const { terms } = await getKelompokContext();
  const activeTerm = terms.find((t) => t.id === termParam) ?? terms.find((t) => t.is_active) ?? terms[0];
  const { class: klass, students, teachers, scatterData } = await getClassDetail(id, activeTerm?.id);

  return (
    <div>
      <Link href="/admin/classes" className="text-sm text-zinc-500 hover:text-zinc-700">
        &larr; All classes
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{klass.name}</h1>
          <p className="text-sm text-zinc-500">{CLASS_TYPE_LABELS[klass.type]}</p>
        </div>
        <TermPicker terms={terms} selectedTermId={activeTerm?.id} />
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Teachers</h2>
        {teachers.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {teachers.map((t) => (
              <li
                key={t}
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">
            No sessions logged for this class in {activeTerm?.name ?? "this term"} yet.
          </p>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">
          Students ({students.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {students.map((s) => {
            const age = calculateAge(s.date_of_birth);
            return (
              <Link
                key={s.id}
                href={`/admin/students/${s.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
              >
                <span className="font-medium text-zinc-900">{s.full_name}</span>
                {age !== null && (
                  <span className="text-xs text-zinc-500">{age} yrs</span>
                )}
              </Link>
            );
          })}
        </ul>
        {students.length === 0 && (
          <p className="text-sm text-zinc-500">
            No students enrolled in {activeTerm?.name ?? "this term"} yet.
          </p>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">Class Progress</h2>
        <p className="mb-2 text-xs text-zinc-500">
          Every proficiency rating logged this term, by date.
        </p>
        {scatterData.length > 0 ? (
          <ClassProgressScatter data={scatterData} />
        ) : (
          <p className="py-8 text-center text-sm text-zinc-400">
            No proficiency ratings logged yet this term.
          </p>
        )}
      </Card>
    </div>
  );
}
