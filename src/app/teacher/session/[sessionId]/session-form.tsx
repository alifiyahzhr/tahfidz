"use client";

import { useState } from "react";
import { submitSessionRecords, type SessionRecordInput } from "../../actions";
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
import { ChevronDown, Check } from "lucide-react";

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

type RecordState = {
  attendance: AttendanceStatus | null;
  progress_text: string;
  proficiency: ProficiencyRating | null;
  comments: string;
};

export function SessionForm({
  sessionId,
  students,
  existingRecords,
}: {
  sessionId: string;
  students: Student[];
  existingRecords: SessionRecord[];
}) {
  const existingByStudent = new Map(existingRecords.map((r) => [r.student_id, r]));

  const [records, setRecords] = useState<Record<string, RecordState>>(() => {
    const init: Record<string, RecordState> = {};
    for (const s of students) {
      const ex = existingByStudent.get(s.id);
      init[s.id] = {
        attendance: ex?.attendance ?? null,
        progress_text: ex?.progress_text ?? "",
        proficiency: ex?.proficiency ?? null,
        comments: ex?.comments ?? "",
      };
    }
    return init;
  });

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(studentId: string, patch: Partial<RecordState>) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...patch } }));
    setSaved(false);
  }

  function markEveryoneHadir() {
    setRecords((prev) => {
      const next = { ...prev };
      for (const s of students) next[s.id] = { ...next[s.id], attendance: "hadir" };
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setPending(true);
    setError(null);
    const payload: SessionRecordInput[] = students.map((s) => ({
      studentId: s.id,
      ...records[s.id],
    }));
    const result = await submitSessionRecords(sessionId, payload);
    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }

  const attendanceDoneCount = students.filter((s) => records[s.id]?.attendance).length;

  if (students.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No children are enrolled in this class for the current term yet. Ask
        your admin to add them.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-28">
      <section>
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900">1. Attendance</h2>
          <button
            type="button"
            onClick={markEveryoneHadir}
            className="rounded-md px-2 py-1.5 text-xs font-medium text-emerald-700 underline-offset-2 hover:bg-emerald-50 hover:underline active:bg-emerald-100"
          >
            Mark everyone Hadir
          </button>
        </div>
        <p className="mb-3 text-xs text-zinc-500">
          {attendanceDoneCount}/{students.length} marked
        </p>
        <ul className="flex flex-col gap-3">
          {students.map((s) => (
            <li key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="mb-3 font-medium text-zinc-900">{s.full_name}</p>
              <SegmentedControl
                name={`attendance-${s.full_name}`}
                options={ATTENDANCE_OPTIONS}
                value={records[s.id]?.attendance ?? null}
                onChange={(v) => update(s.id, { attendance: v })}
                colorFor={(v) => ATTENDANCE_COLOR[v]}
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-zinc-900">2. Progress</h2>
        <ul className="flex flex-col gap-3">
          {students.map((s) => {
            const r = records[s.id];
            const filled = !!(r.progress_text || r.proficiency || r.comments);
            return (
              <li
                key={s.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
              >
                <details className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 p-4 transition-colors hover:bg-zinc-50 active:bg-zinc-100">
                    <span className="flex items-center gap-2 font-medium text-zinc-900">
                      {filled && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                      )}
                      {s.full_name}
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-4 border-t border-zinc-100 p-4">
                    <Field
                      label="What did they read?"
                      hint="e.g. Surah Al-Baqarah 1-10, or Juz 29 recap"
                    >
                      <Input
                        value={r.progress_text}
                        onChange={(e) => update(s.id, { progress_text: e.target.value })}
                        placeholder="Surah / ayat / juz covered"
                      />
                    </Field>
                    <div>
                      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Proficiency
                      </span>
                      <SegmentedControl
                        name={`proficiency-${s.full_name}`}
                        options={PROFICIENCY_OPTIONS}
                        value={r.proficiency}
                        onChange={(v) => update(s.id, { proficiency: v })}
                      />
                    </div>
                    <Field label="Comments">
                      <Textarea
                        rows={2}
                        value={r.comments}
                        onChange={(e) => update(s.id, { comments: e.target.value })}
                      />
                    </Field>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !error && (
            <p className="text-sm text-emerald-700">All progress saved.</p>
          )}
          <Button type="button" onClick={handleSave} disabled={pending} className="w-full">
            {pending ? "Saving..." : "Save all"}
          </Button>
        </div>
      </div>
    </div>
  );
}
