"use client";

import { useActionState, useState } from "react";
import { adminUpsertRecord } from "../../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented";
import {
  ATTENDANCE_LABELS,
  PROFICIENCY_LABELS,
  type AttendanceStatus,
  type ProficiencyRating,
  type SessionRecord,
  type Student,
} from "@/lib/types";

const ATTENDANCE_OPTIONS = (Object.keys(ATTENDANCE_LABELS) as AttendanceStatus[]).map(
  (value) => ({ value, label: ATTENDANCE_LABELS[value] }),
);
const PROFICIENCY_OPTIONS = (Object.keys(PROFICIENCY_LABELS) as ProficiencyRating[]).map(
  (value) => ({ value, label: PROFICIENCY_LABELS[value] }),
);

export function AdminRecordRow({
  sessionId,
  student,
  existing,
}: {
  sessionId: string;
  student: Student;
  existing: SessionRecord | null;
}) {
  const [state, formAction, pending] = useActionState(adminUpsertRecord, undefined);
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(
    existing?.attendance ?? null,
  );
  const [proficiency, setProficiency] = useState<ProficiencyRating | null>(
    existing?.proficiency ?? null,
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="studentId" value={student.id} />
      <input type="hidden" name="attendance" value={attendance ?? ""} />
      <input type="hidden" name="proficiency" value={proficiency ?? ""} />

      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-zinc-900">{student.full_name}</p>
        {!existing && (
          <span className="text-xs text-amber-600">Missing</span>
        )}
      </div>

      <div className="mt-3">
        <SegmentedControl
          name="attendance"
          options={ATTENDANCE_OPTIONS}
          value={attendance}
          onChange={setAttendance}
        />
      </div>

      {attendance === "hadir" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Progress">
            <Input
              name="progressText"
              defaultValue={existing?.progress_text ?? ""}
            />
          </Field>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Proficiency
            </span>
            <SegmentedControl
              name="proficiency"
              options={PROFICIENCY_OPTIONS}
              value={proficiency}
              onChange={setProficiency}
            />
          </div>
        </div>
      )}

      <div className="mt-3">
        <Field label="Comments">
          <Textarea name="comments" rows={2} defaultValue={existing?.comments ?? ""} />
        </Field>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" variant="secondary" disabled={pending || !attendance}>
          {pending ? "Saving..." : "Save"}
        </Button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-700">Saved</p>}
        {existing?.updated_by_admin && (
          <span className="text-xs text-zinc-400">Edited by admin</span>
        )}
      </div>
    </form>
  );
}
