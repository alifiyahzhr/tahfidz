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

export async function getStudentAndRecord(sessionId: string, studentId: string) {
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

  const { data: student } = await service
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();
  if (!student) redirect(`/teacher/session/${sessionId}`);

  const { data: record } = await service
    .from("session_records")
    .select("*")
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .maybeSingle();

  return { session, student: student as Student, record: record as SessionRecord | null };
}

export async function submitRecord(_prevState: unknown, formData: FormData) {
  const kelompokSession = await getKelompokSession();
  if (!kelompokSession) redirect("/teacher");

  const sessionId = String(formData.get("sessionId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const attendance = String(formData.get("attendance") ?? "") as AttendanceStatus;
  const progressText = String(formData.get("progressText") ?? "").trim();
  const proficiency = String(formData.get("proficiency") ?? "") as
    | ProficiencyRating
    | "";
  const comments = String(formData.get("comments") ?? "").trim();

  if (!sessionId || !studentId) return { error: "Missing session or student." };
  if (!attendance) return { error: "Choose an attendance status." };

  const service = createServiceClient();

  const { error } = await service.from("session_records").upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      attendance,
      progress_text: attendance === "hadir" ? progressText || null : null,
      proficiency: attendance === "hadir" && proficiency ? proficiency : null,
      comments: comments || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,student_id" },
  );

  if (error) return { error: "Couldn't save that record. Try again." };

  redirect(`/teacher/session/${sessionId}`);
}
