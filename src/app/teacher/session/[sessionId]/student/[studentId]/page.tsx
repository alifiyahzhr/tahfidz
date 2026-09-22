import Link from "next/link";
import { getStudentAndRecord } from "../../../../actions";
import { RecordForm } from "./record-form";
import type { SessionRecord } from "@/lib/types";

export default async function StudentRecordPage({
  params,
}: {
  params: Promise<{ sessionId: string; studentId: string }>;
}) {
  const { sessionId, studentId } = await params;
  const { student, record } = await getStudentAndRecord(sessionId, studentId);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <Link
        href={`/teacher/session/${sessionId}`}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-700"
      >
        &larr; Back to class list
      </Link>
      <RecordForm
        sessionId={sessionId}
        studentId={studentId}
        studentName={student.full_name}
        existing={record as SessionRecord | null}
      />
    </main>
  );
}
