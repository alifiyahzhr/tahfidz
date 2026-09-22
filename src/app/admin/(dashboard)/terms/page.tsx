import { Card } from "@/components/ui/card";
import { getKelompokContext } from "../actions";
import { CreateTermForm, SetActiveTermButton } from "./term-forms";

export default async function TermsPage() {
  const { terms } = await getKelompokContext();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">Terms</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Only one term should be active at a time -- teachers record progress
        against whichever term is active.
      </p>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Add a term</h2>
        <CreateTermForm />
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {terms.map((t) => (
          <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-zinc-900">{t.name}</p>
              <p className="text-xs text-zinc-500">
                {t.start_date} &ndash; {t.end_date}
              </p>
            </div>
            <SetActiveTermButton termId={t.id} isActive={t.is_active} />
          </Card>
        ))}
        {terms.length === 0 && (
          <p className="text-sm text-zinc-500">No terms yet.</p>
        )}
      </div>
    </div>
  );
}
