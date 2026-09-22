"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/field";

export function StudentJumpSelect({
  sessionId,
  students,
  doneIds,
}: {
  sessionId: string;
  students: { id: string; full_name: string }[];
  doneIds: Set<string>;
}) {
  const router = useRouter();

  return (
    <Select
      defaultValue=""
      onChange={(e) => {
        const studentId = e.target.value;
        if (studentId) {
          router.push(`/teacher/session/${sessionId}/student/${studentId}`);
        }
      }}
      className="py-3 text-base"
    >
      <option value="" disabled>
        Choose a child...
      </option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {doneIds.has(s.id) ? "✓ " : ""}
          {s.full_name}
        </option>
      ))}
    </Select>
  );
}
