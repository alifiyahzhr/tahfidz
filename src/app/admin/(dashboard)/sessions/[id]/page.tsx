import Link from "next/link";
import { getSessionForEditing } from "../../actions";
import { AdminRecordRow } from "./admin-record-row";
import type { SessionRecord } from "@/lib/types";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, students, records } = await getSessionForEditing(id);
  const recordByStudent = new Map(records.map((r) => [r.student_id, r as SessionRecord]));

  return (
    <div>
      <Link href="/admin/sessions" className="text-sm text-zinc-500 hover:text-zinc-700">
        &larr; All sessions
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-zinc-900">{session.classes.name}</h1>
      <p className="text-sm text-zinc-500">
        {session.session_date} &middot; logged by {session.teacher_name}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {students.map((s) => (
          <AdminRecordRow
            key={s.id}
            sessionId={id}
            student={s}
            existing={recordByStudent.get(s.id) ?? null}
          />
        ))}
        {students.length === 0 && (
          <p className="text-sm text-zinc-500">
            No students are enrolled in this class for this term.
          </p>
        )}
      </div>
    </div>
  );
}
