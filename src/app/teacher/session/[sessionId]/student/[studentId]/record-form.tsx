"use client";

import { useActionState, useState } from "react";
import { submitRecord } from "../../../../actions";
import { Button } from "@/components/ui/button";
import { Field, Textarea, Input } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented";
import {
  ATTENDANCE_LABELS,
  PROFICIENCY_LABELS,
  type AttendanceStatus,
  type ProficiencyRating,
  type SessionRecord,
} from "@/lib/types";

const ATTENDANCE_OPTIONS = (
  Object.keys(ATTENDANCE_LABELS) as AttendanceStatus[]
).map((value) => ({ value, label: ATTENDANCE_LABELS[value] }));

const PROFICIENCY_OPTIONS = (
  Object.keys(PROFICIENCY_LABELS) as ProficiencyRating[]
).map((value) => ({ value, label: PROFICIENCY_LABELS[value] }));

const ATTENDANCE_COLOR: Record<AttendanceStatus, string> = {
  hadir: "bg-emerald-700 text-white border-emerald-700",
  izin_reason: "bg-amber-500 text-white border-amber-500",
  izin_no_reason: "bg-orange-500 text-white border-orange-500",
  absent: "bg-red-600 text-white border-red-600",
};

export function RecordForm({
  sessionId,
  studentId,
  studentName,
  existing,
}: {
  sessionId: string;
  studentId: string;
  studentName: string;
  existing: SessionRecord | null;
}) {
  const [state, formAction, pending] = useActionState(submitRecord, undefined);
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(
    existing?.attendance ?? null,
  );
  const [proficiency, setProficiency] = useState<ProficiencyRating | null>(
    existing?.proficiency ?? null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="attendance" value={attendance ?? ""} />
      <input type="hidden" name="proficiency" value={proficiency ?? ""} />

      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{studentName}</h1>
      </div>

      <Field label="Attendance">
        <SegmentedControl
          name="attendance"
          options={ATTENDANCE_OPTIONS}
          value={attendance}
          onChange={setAttendance}
          colorFor={(v) => ATTENDANCE_COLOR[v]}
        />
      </Field>

      {attendance === "hadir" && (
        <>
          <Field label="What did they read?" hint="e.g. Surah Al-Baqarah 1-10, or Juz 29 recap">
            <Input
              name="progressText"
              defaultValue={existing?.progress_text ?? ""}
              placeholder="Surah / ayat / juz covered"
            />
          </Field>

          <Field label="Proficiency">
            <SegmentedControl
              name="proficiency"
              options={PROFICIENCY_OPTIONS}
              value={proficiency}
              onChange={setProficiency}
            />
          </Field>
        </>
      )}

      <Field
        label="Comments"
        hint={
          attendance && attendance !== "hadir"
            ? "Add the reason for absence here if relevant."
            : "Optional notes for this session."
        }
      >
        <Textarea
          name="comments"
          rows={3}
          defaultValue={existing?.comments ?? ""}
        />
      </Field>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending || !attendance} className="w-full">
        {pending ? "Saving..." : "Save & back to class"}
      </Button>
    </form>
  );
}
