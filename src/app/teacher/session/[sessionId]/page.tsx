import Link from "next/link";
import { getSessionWithRoster, signOutTeacher } from "../../actions";
import { SessionForm } from "./session-form";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { session, students, records } = await getSessionWithRoster(sessionId);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href="/teacher/start"
          className="rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200"
        >
          &larr; Other class
        </Link>
        <form action={signOutTeacher}>
          <button
            type="submit"
            className="rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200"
          >
            Log out
          </button>
        </form>
      </div>

      <div className="mb-6">
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

      <SessionForm sessionId={sessionId} students={students} existingRecords={records} />
    </main>
  );
}
