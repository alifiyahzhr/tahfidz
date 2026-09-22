import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getKelompokContext, listSessions } from "../actions";
import { TermPicker } from "../term-picker";
import { NewSessionForm } from "./new-session-form";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const { term: termParam } = await searchParams;
  const { terms, classes } = await getKelompokContext();
  const activeTerm = terms.find((t) => t.id === termParam) ?? terms.find((t) => t.is_active) ?? terms[0];
  const sessions = activeTerm ? await listSessions(activeTerm.id) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Sessions</h1>
        <TermPicker terms={terms} selectedTermId={activeTerm?.id} />
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">
          Add a Session
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          For a session a teacher didn&apos;t log themselves. If one already
          exists for that class and date, you&apos;ll be taken to it instead.
        </p>
        <NewSessionForm classes={classes} termId={activeTerm?.id} />
      </Card>

      <div className="mt-6 flex flex-col gap-2">
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={`/admin/sessions/${s.id}`}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
          >
            <div>
              <p className="font-medium text-zinc-900">{s.classes.name}</p>
              <p className="text-xs text-zinc-500">
                {s.session_date} &middot; {s.teacher_name}
              </p>
            </div>
          </Link>
        ))}
        {sessions.length === 0 && (
          <p className="text-sm text-zinc-500">No sessions logged for this term yet.</p>
        )}
      </div>
    </div>
  );
}
