"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import {
  clearKelompokSession,
  getKelompokSession,
  setKelompokSession,
} from "@/lib/teacher-session";
import type {
  AttendanceStatus,
  ProficiencyRating,
  SchoolClass,
  Session,
  SessionRecord,
  Student,
  Teacher,
  Term,
} from "@/lib/types";

export async function verifyPin(_prevState: unknown, formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();
  if (!pin) return { error: "Enter the kelompok PIN." };

  const service = createServiceClient();
  const { data: kelompoks, error } = await service
    .from("kelompok")
    .select("id, name, slug, pin_hash");

  if (error) return { error: "Something went wrong. Please try again." };

  for (const k of kelompoks ?? []) {
    if (await bcrypt.compare(pin, k.pin_hash)) {
      await setKelompokSession({
        kelompokId: k.id,
        kelompokName: k.name,
        kelompokSlug: k.slug,
      });
      redirect("/teacher/start");
    }
  }

  return { error: "That PIN wasn't recognised. Check with your admin." };
}

export async function signOutTeacher() {
  await clearKelompokSession();
  redirect("/teacher");
}

export async function getActiveTerm(): Promise<Term | null> {
  const session = await getKelompokSession();
  if (!session) return null;

  const service = createServiceClient();
  const { data: kelompok } = await service
    .from("kelompok")
    .select("daerah_id")
    .eq("id", session.kelompokId)
    .single();
  if (!kelompok) return null;

  const { data: term } = await service
    .from("terms")
    .select("*")
    .eq("daerah_id", kelompok.daerah_id)
    .eq("is_active", true)
    .maybeSingle();

  return term as Term | null;
}

export async function getClassesForCurrentKelompok() {
  const session = await getKelompokSession();
  if (!session) return [];

  const service = createServiceClient();
  const { data } = await service
    .from("classes")
    .select("*")
    .eq("kelompok_id", session.kelompokId)
    .eq("is_active", true)
    .order("sort_order");

  return (data ?? []) as SchoolClass[];
}

export async function getTeachersForCurrentKelompok() {
  const session = await getKelompokSession();
  if (!session) return [];

  const service = createServiceClient();
  const { data } = await service
    .from("teachers")
    .select("*")
    .eq("kelompok_id", session.kelompokId)
    .order("full_name");

  return (data ?? []) as Teacher[];
}

export async function startSession(_prevState: unknown, formData: FormData) {
  const session = await getKelompokSession();
  if (!session) redirect("/teacher");

  const teacherName = String(formData.get("teacherName") ?? "").trim();
  const classId = String(formData.get("classId") ?? "");
  const sessionDate = String(formData.get("sessionDate") ?? "");

  if (!teacherName) return { error: "Enter your name." };
  if (!classId) return { error: "Choose a class." };
  if (!sessionDate) return { error: "Choose a date." };

  const term = await getActiveTerm();
  if (!term) {
    return {
      error:
        "No active term is set up yet. Ask your admin to activate the current term.",
    };
  }

  const service = createServiceClient();

  // Remember a newly-typed teacher name for next time's dropdown.
  await service
    .from("teachers")
    .upsert(
      { kelompok_id: session.kelompokId, full_name: teacherName },
      { onConflict: "kelompok_id,full_name", ignoreDuplicates: true },
    );

  // Confirm the class actually belongs to this kelompok before writing anything.
  const { data: klass } = await service
    .from("classes")
    .select("id, kelompok_id")
    .eq("id", classId)
    .single();
  if (!klass || klass.kelompok_id !== session.kelompokId) {
    return { error: "That class isn't valid." };
  }

  const { data: existing } = await service
    .from("sessions")
    .select("id")
    .eq("class_id", classId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  let sessionId = existing?.id as string | undefined;

  if (sessionId) {
    await service
      .from("sessions")
      .update({ teacher_name: teacherName })
      .eq("id", sessionId);
  } else {
    const { data: created, error } = await service
      .from("sessions")
      .insert({
        class_id: classId,
        term_id: term.id,
        session_date: sessionDate,
        teacher_name: teacherName,
      })
      .select("id")
      .single();
    if (error || !created) return { error: "Couldn't start the session." };
    sessionId = created.id;
  }

  redirect(`/teacher/session/${sessionId}`);
}

export async function getSessionWithRoster(sessionId: string) {
  const kelompokSession = await getKelompokSession();
  if (!kelompokSession) redirect("/teacher");

  const service = createServiceClient();

  const { data: sessionData } = await service
    .from("sessions")
    .select("*, classes(*)")
    .eq("id", sessionId)
    .single();
  const session = sessionData as unknown as (Session & { classes: SchoolClass }) | null;

  if (!session || session.classes.kelompok_id !== kelompokSession.kelompokId) {
    redirect("/teacher/start");
  }

  const { data: enrollments } = await service
    .from("enrollments")
    .select("student_id, students(*)")
    .eq("class_id", session.class_id)
    .eq("term_id", session.term_id);

  const students = ((enrollments ?? []) as unknown as Array<{ students: Student | null }>)
    .map((e) => e.students)
    .filter((s): s is Student => !!s && s.is_active)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const { data: records } = await service
    .from("session_records")
    .select("*")
    .eq("session_id", sessionId);

  return { session, students, records: (records ?? []) as SessionRecord[] };
}

export interface SessionRecordInput {
  studentId: string;
  attendance: AttendanceStatus | null;
  progress_text: string;
  proficiency: ProficiencyRating | null;
  comments: string;
}

export async function submitSessionRecords(
  sessionId: string,
  records: SessionRecordInput[],
) {
  const kelompokSession = await getKelompokSession();
  if (!kelompokSession) redirect("/teacher");

  const service = createServiceClient();

  const { data: sessionData } = await service
    .from("sessions")
    .select("*, classes(*)")
    .eq("id", sessionId)
    .single();
  const session = sessionData as unknown as (Session & { classes: SchoolClass }) | null;
  if (!session || session.classes.kelompok_id !== kelompokSession.kelompokId) {
    return { error: "Not found." };
  }

  if (records.some((r) => !r.attendance)) {
    return { error: "Mark attendance for every child before saving." };
  }

  const rows = records.map((r) => ({
    session_id: sessionId,
    student_id: r.studentId,
    attendance: r.attendance,
    progress_text: r.progress_text.trim() || null,
    proficiency: r.proficiency || null,
    comments: r.comments.trim() || null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await service
    .from("session_records")
    .upsert(rows, { onConflict: "session_id,student_id" });

  if (error) return { error: "Couldn't save. Please try again." };

  return { success: true };
}
