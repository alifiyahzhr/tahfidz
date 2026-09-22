import Link from "next/link";
import { getSessionWithRoster, signOutTeacher } from "../../actions";
import { ATTENDANCE_LABELS, type AttendanceStatus } from "@/lib/types";
import { clsx } from "clsx";
import { StudentJumpSelect } from "./student-jump";

const STATUS_DOT: Record<AttendanceStatus, string> = {
  hadir: "bg-emerald-600",
  izin_reason: "bg-amber-500",
  izin_no_reason: "bg-orange-500",
  absent: "bg-red-500",
};

export default async function SessionRosterPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { session, students, records } = await getSessionWithRoster(sessionId);

  const recordByStudent = new Map(records.map((r) => [r.student_id, r]));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {session.classes.name}
          </h1>
          <p className="text-sm text-zinc-500">
            {new Date(session.session_date + "T00:00:00").toLocaleDateString(
              "en-AU",
              { weekday: "long", day: "numeric", month: "long" },
            )}{" "}
            &middot; {session.teacher_name}
          </p>
        </div>
        <form action={signOutTeacher}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Log out
          </button>
        </form>
      </div>

      <p className="mb-3 text-sm font-medium text-zinc-700">
        Select a child to record their progress ({recordByStudent.size}/
        {students.length} done)
      </p>

      <div className="mb-4">
        <StudentJumpSelect
          sessionId={sessionId}
          students={students}
          doneIds={new Set(recordByStudent.keys())}
        />
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {students.map((s) => {
          const record = recordByStudent.get(s.id);
          return (
            <li key={s.id}>
              <Link
                href={`/teacher/session/${sessionId}/student/${s.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
              >
                <span className="font-medium text-zinc-900">{s.full_name}</span>
                {record ? (
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span
                      className={clsx(
                        "h-2 w-2 rounded-full",
                        STATUS_DOT[record.attendance as AttendanceStatus],
                      )}
                    />
                    {ATTENDANCE_LABELS[record.attendance as AttendanceStatus]}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-400">Not recorded</span>
                )}
              </Link>
            </li>
          );
        })}
        {students.length === 0 && (
          <p className="text-sm text-zinc-500">
            No children are enrolled in this class for the current term yet.
            Ask your admin to add them.
          </p>
        )}
      </ul>

      <Link
        href="/teacher/start"
        className="mt-8 text-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        Finish &amp; start another session
      </Link>
    </main>
  );
}
