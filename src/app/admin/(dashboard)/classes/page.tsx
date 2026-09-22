import { Card } from "@/components/ui/card";
import { CLASS_TYPE_LABELS } from "@/lib/types";
import { getKelompokContext, getClassTargets } from "../actions";
import { AddClassForm } from "./add-class-form";
import { TargetForm } from "./target-form";
import { TermPicker } from "../term-picker";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const { term: termParam } = await searchParams;
  const { classes, terms } = await getKelompokContext();
  const activeTerm = terms.find((t) => t.id === termParam) ?? terms.find((t) => t.is_active) ?? terms[0];
  const targets = activeTerm ? await getClassTargets(activeTerm.id) : [];
  const targetByClass = new Map(targets.map((t) => [t.class_id, t.target_text]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Classes & targets</h1>
        <TermPicker terms={terms} selectedTermId={activeTerm?.id} />
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Add a class</h2>
        <AddClassForm />
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {classes.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-900">{c.name}</p>
                <p className="text-xs text-zinc-500">{CLASS_TYPE_LABELS[c.type]}</p>
              </div>
              {activeTerm && (
                <div className="w-full sm:w-auto">
                  <TargetForm
                    classId={c.id}
                    termId={activeTerm.id}
                    initialTarget={targetByClass.get(c.id) ?? ""}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
        {classes.length === 0 && (
          <p className="text-sm text-zinc-500">No classes yet.</p>
        )}
      </div>
    </div>
  );
}
