"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-session";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  AttendanceStatus,
  ProficiencyRating,
  SchoolClass,
  Session,
  SessionRecord,
  Student,
  Term,
} from "@/lib/types";

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Kelompok id this admin is allowed to manage. Super/daerah admins with no
 * kelompok_id set fall back to the first kelompok in their daerah (or overall,
 * for super_admin) -- fine for the single-kelompok MVP, and each write below
 * still re-checks ownership of the specific row being touched. */
async function scopedKelompokId(): Promise<string> {
  const admin = await requireAdmin();
  const service = createServiceClient();

  if (admin.kelompok_id) return admin.kelompok_id;

  const query = service.from("kelompok").select("id").limit(1);
  const { data } = admin.daerah_id
    ? await query.eq("daerah_id", admin.daerah_id).single()
    : await query.single();

  if (!data) throw new Error("No kelompok found for this admin.");
  return data.id;
}

// ---------- Reference data ----------

export async function getKelompokContext() {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const { data: kelompok } = await service
    .from("kelompok")
    .select("*")
    .eq("id", kelompokId)
    .single();

  const [{ data: terms }, { data: classes }] = await Promise.all([
    service
      .from("terms")
      .select("*")
      .eq("daerah_id", kelompok?.daerah_id ?? "")
      .order("year", { ascending: false })
      .order("term_number", { ascending: false }),
    service
      .from("classes")
      .select("*")
      .eq("kelompok_id", kelompokId)
      .order("sort_order"),
  ]);

  return {
    kelompok,
    terms: (terms ?? []) as Term[],
    classes: (classes ?? []) as SchoolClass[],
  };
}

export async function getActiveOrLatestTerm() {
  const { terms } = await getKelompokContext();
  return terms.find((t) => t.is_active) ?? terms[0] ?? null;
}

// ---------- Dashboard ----------

export async function getDashboardStats() {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();
  const term = await getActiveOrLatestTerm();

  const [{ count: studentCount }, { count: classCount }] = await Promise.all([
    service
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("kelompok_id", kelompokId)
      .eq("is_active", true),
    service
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("kelompok_id", kelompokId)
      .eq("is_active", true),
  ]);

  let sessionCount = 0;
  let recordCount = 0;
  if (term) {
    const { data: classIds } = await service
      .from("classes")
      .select("id")
      .eq("kelompok_id", kelompokId);
    const ids = (classIds ?? []).map((c) => c.id);
    const { count: sc } = await service
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("term_id", term.id)
      .in("class_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    sessionCount = sc ?? 0;

    const { data: sessionIds } = await service
      .from("sessions")
      .select("id")
      .eq("term_id", term.id)
      .in("class_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const sids = (sessionIds ?? []).map((s) => s.id);
    if (sids.length) {
      const { count: rc } = await service
        .from("session_records")
        .select("*", { count: "exact", head: true })
        .in("session_id", sids);
      recordCount = rc ?? 0;
    }
  }

  return { studentCount: studentCount ?? 0, classCount: classCount ?? 0, term, sessionCount, recordCount };
}

// ---------- Students ----------

export async function listStudents() {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();
  const { data } = await service
    .from("students")
    .select("*")
    .eq("kelompok_id", kelompokId)
    .order("full_name");
  return (data ?? []) as Student[];
}

export async function getStudentProfile(studentId: string) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const { data: student } = await service
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("kelompok_id", kelompokId)
    .single();
  if (!student) redirect("/admin/students");

  const { data: enrollments } = await service
    .from("enrollments")
    .select("*, terms(*), classes(*)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  const { data: records } = await service
    .from("session_records")
    .select("*, sessions(session_date, teacher_name, term_id, classes(name), terms(name))")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return {
    student: student as Student,
    enrollments: (enrollments ?? []) as unknown as Array<{
      id: string;
      student_id: string;
      term_id: string;
      class_id: string;
      terms: Term | null;
      classes: SchoolClass | null;
    }>,
    records: (records ?? []) as unknown as Array<{
      id: string;
      attendance: AttendanceStatus;
      progress_text: string | null;
      proficiency: ProficiencyRating | null;
      comments: string | null;
      sessions: {
        session_date: string;
        teacher_name: string;
        term_id: string;
        classes: { name: string } | null;
        terms: { name: string } | null;
      } | null;
    }>,
  };
}

export async function createStudent(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const classId = String(formData.get("classId") ?? "");
  const termId = String(formData.get("termId") ?? "");
  const dob = String(formData.get("dob") ?? "").trim();
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const guardianContact = String(formData.get("guardianContact") ?? "").trim();

  if (!fullName) return { error: "Enter the student's name." };
  if (!classId) return { error: "Choose a class for this student." };
  if (!termId) {
    return {
      error: "No active term is set up yet. Set one from Admin > Terms first.",
    };
  }

  const { data: student, error } = await service
    .from("students")
    .insert({
      kelompok_id: kelompokId,
      full_name: fullName,
      date_of_birth: dob || null,
      guardian_name: guardianName || null,
      guardian_contact: guardianContact || null,
    })
    .select("id")
    .single();

  if (error || !student) return { error: "Couldn't add the student." };

  await service.from("enrollments").upsert(
    { student_id: student.id, term_id: termId, class_id: classId },
    { onConflict: "student_id,term_id" },
  );

  revalidatePath("/admin/students");
  return { success: true };
}

export async function updateStudent(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const studentId = String(formData.get("studentId") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const dob = String(formData.get("dob") ?? "").trim();
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const guardianContact = String(formData.get("guardianContact") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!studentId || !fullName) return { error: "Missing required fields." };

  const { error } = await service
    .from("students")
    .update({
      full_name: fullName,
      date_of_birth: dob || null,
      guardian_name: guardianName || null,
      guardian_contact: guardianContact || null,
      notes: notes || null,
      is_active: isActive,
    })
    .eq("id", studentId)
    .eq("kelompok_id", kelompokId);

  if (error) return { error: "Couldn't update the student." };

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  return { success: true };
}

export async function setEnrollment(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const studentId = String(formData.get("studentId") ?? "");
  const termId = String(formData.get("termId") ?? "");
  const classId = String(formData.get("classId") ?? "");

  if (!studentId || !termId || !classId) return { error: "Missing fields." };

  // Ownership check via the student row.
  const { data: student } = await service
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("kelompok_id", kelompokId)
    .single();
  if (!student) return { error: "Not found." };

  const { error } = await service
    .from("enrollments")
    .upsert(
      { student_id: studentId, term_id: termId, class_id: classId },
      { onConflict: "student_id,term_id" },
    );

  if (error) return { error: "Couldn't update enrollment." };

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

// ---------- Classes & targets ----------

export async function createClass(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  if (!name || !["memorisation", "recitation"].includes(type)) {
    return { error: "Fill in the class name and type." };
  }

  const { error } = await service.from("classes").insert({
    kelompok_id: kelompokId,
    name,
    type,
  });

  if (error) return { error: "Couldn't add the class (name may already exist)." };

  revalidatePath("/admin/classes");
  return { success: true };
}

export async function setClassTarget(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const classId = String(formData.get("classId") ?? "");
  const termId = String(formData.get("termId") ?? "");
  const targetText = String(formData.get("targetText") ?? "").trim();

  if (!classId || !termId) return { error: "Missing fields." };

  const { data: klass } = await service
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("kelompok_id", kelompokId)
    .single();
  if (!klass) return { error: "Not found." };

  const { error } = await service.from("class_targets").upsert(
    {
      class_id: classId,
      term_id: termId,
      target_text: targetText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "class_id,term_id" },
  );

  if (error) return { error: "Couldn't save the target." };

  revalidatePath("/admin/classes");
  return { success: true };
}

export async function getClassTargets(termId: string) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();
  const { data } = await service
    .from("class_targets")
    .select("*, classes!inner(kelompok_id)")
    .eq("term_id", termId)
    .eq("classes.kelompok_id", kelompokId);
  return data ?? [];
}

// ---------- Terms ----------

export async function createTerm(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();

  const { data: kelompok } = await service
    .from("kelompok")
    .select("daerah_id")
    .eq("id", await scopedKelompokId())
    .single();
  if (!kelompok) return { error: "No kelompok found." };

  const year = Number(formData.get("year"));
  const termNumber = Number(formData.get("termNumber"));
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!year || !termNumber || !name || !startDate || !endDate) {
    return { error: "Fill in all fields." };
  }

  const { error } = await service.from("terms").insert({
    daerah_id: kelompok.daerah_id,
    year,
    term_number: termNumber,
    name,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) return { error: "Couldn't add the term (it may already exist)." };

  revalidatePath("/admin/terms");
  return { success: true };
}

export async function setActiveTerm(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();
  const termId = String(formData.get("termId") ?? "");
  if (!termId) return { error: "Missing term." };

  const { data: term } = await service
    .from("terms")
    .select("daerah_id")
    .eq("id", termId)
    .single();
  if (!term) return { error: "Not found." };

  await service.from("terms").update({ is_active: false }).eq("daerah_id", term.daerah_id);
  const { error } = await service.from("terms").update({ is_active: true }).eq("id", termId);

  if (error) return { error: "Couldn't set the active term." };

  revalidatePath("/admin/terms");
  revalidatePath("/admin");
  return { success: true };
}

// ---------- Sessions (admin correction) ----------

export async function adminCreateSession(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const classId = String(formData.get("classId") ?? "");
  const termId = String(formData.get("termId") ?? "");
  const sessionDate = String(formData.get("sessionDate") ?? "");
  const teacherName = String(formData.get("teacherName") ?? "").trim();

  if (!classId) return { error: "Choose a class." };
  if (!termId) return { error: "Choose a term." };
  if (!sessionDate) return { error: "Choose a date." };
  if (!teacherName) return { error: "Enter the teacher's name." };

  const { data: klass } = await service
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("kelompok_id", kelompokId)
    .single();
  if (!klass) return { error: "That class isn't valid." };

  const { data: existing } = await service
    .from("sessions")
    .select("id")
    .eq("class_id", classId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (existing) redirect(`/admin/sessions/${existing.id}`);

  const { data: created, error } = await service
    .from("sessions")
    .insert({
      class_id: classId,
      term_id: termId,
      session_date: sessionDate,
      teacher_name: teacherName,
    })
    .select("id")
    .single();

  if (error || !created) return { error: "Couldn't create the session." };

  redirect(`/admin/sessions/${created.id}`);
}

export async function listSessions(termId?: string) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  let query = service
    .from("sessions")
    .select("*, classes!inner(name, kelompok_id)")
    .eq("classes.kelompok_id", kelompokId)
    .order("session_date", { ascending: false });

  if (termId) query = query.eq("term_id", termId);

  const { data } = await query;
  return (data ?? []) as unknown as Array<
    Session & { classes: { name: string; kelompok_id: string } }
  >;
}

export async function getSessionForEditing(sessionId: string) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const { data: sessionData } = await service
    .from("sessions")
    .select("*, classes(*)")
    .eq("id", sessionId)
    .single();
  const session = sessionData as unknown as (Session & { classes: SchoolClass }) | null;
  if (!session || session.classes.kelompok_id !== kelompokId) {
    redirect("/admin/sessions");
  }

  const { data: enrollments } = await service
    .from("enrollments")
    .select("students(*)")
    .eq("class_id", session.class_id)
    .eq("term_id", session.term_id);

  const students = ((enrollments ?? []) as unknown as Array<{ students: Student | null }>)
    .map((e) => e.students)
    .filter((s): s is Student => !!s)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const { data: records } = await service
    .from("session_records")
    .select("*")
    .eq("session_id", sessionId);

  return { session, students, records: (records ?? []) as SessionRecord[] };
}

export async function adminUpsertRecord(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const sessionId = String(formData.get("sessionId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const attendance = String(formData.get("attendance") ?? "") as AttendanceStatus;
  const progressText = String(formData.get("progressText") ?? "").trim();
  const proficiency = String(formData.get("proficiency") ?? "") as ProficiencyRating | "";
  const comments = String(formData.get("comments") ?? "").trim();

  if (!sessionId || !studentId || !attendance) return { error: "Missing fields." };

  const { data: sessionData } = await service
    .from("sessions")
    .select("*, classes(kelompok_id)")
    .eq("id", sessionId)
    .single();
  const session = sessionData as unknown as { classes: { kelompok_id: string } } | null;
  if (!session || session.classes.kelompok_id !== kelompokId) {
    return { error: "Not found." };
  }

  const { error } = await service.from("session_records").upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      attendance,
      progress_text: attendance === "hadir" ? progressText || null : null,
      proficiency: attendance === "hadir" && proficiency ? proficiency : null,
      comments: comments || null,
      updated_by_admin: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,student_id" },
  );

  if (error) return { error: "Couldn't save that record." };

  revalidatePath(`/admin/sessions/${sessionId}`);
  return { success: true };
}

// ---------- Settings ----------

export async function changeKelompokPin(_prevState: unknown, formData: FormData) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const newPin = String(formData.get("newPin") ?? "").trim();
  const confirmPin = String(formData.get("confirmPin") ?? "").trim();

  if (newPin.length < 4) return { error: "PIN must be at least 4 characters." };
  if (newPin !== confirmPin) return { error: "PINs don't match." };

  const pinHash = await bcrypt.hash(newPin, 10);
  const { error } = await service
    .from("kelompok")
    .update({ pin_hash: pinHash })
    .eq("id", kelompokId);

  if (error) return { error: "Couldn't update the PIN." };
  return { success: true };
}

// ---------- Reports ----------

export async function getAttendanceReport(termId: string) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const { data: classes } = await service
    .from("classes")
    .select("id, name")
    .eq("kelompok_id", kelompokId)
    .order("sort_order");

  const results: {
    classId: string;
    className: string;
    hadir: number;
    izin_reason: number;
    izin_no_reason: number;
    absent: number;
  }[] = [];

  for (const klass of classes ?? []) {
    const { data: sessions } = await service
      .from("sessions")
      .select("id")
      .eq("class_id", klass.id)
      .eq("term_id", termId);
    const sessionIds = (sessions ?? []).map((s) => s.id);

    const counts = { hadir: 0, izin_reason: 0, izin_no_reason: 0, absent: 0 };
    if (sessionIds.length) {
      const { data: records } = await service
        .from("session_records")
        .select("attendance")
        .in("session_id", sessionIds);
      for (const r of records ?? []) {
        counts[r.attendance as AttendanceStatus] += 1;
      }
    }

    results.push({ classId: klass.id, className: klass.name, ...counts });
  }

  return results;
}

export async function getProgressReport(termId: string) {
  const kelompokId = await scopedKelompokId();
  const service = createServiceClient();

  const { data: classes } = await service
    .from("classes")
    .select("id, name")
    .eq("kelompok_id", kelompokId)
    .order("sort_order");

  const { data: targets } = await service
    .from("class_targets")
    .select("class_id, target_text")
    .eq("term_id", termId);
  const targetByClass = new Map((targets ?? []).map((t) => [t.class_id, t.target_text]));

  const results: {
    classId: string;
    className: string;
    target: string | null;
    ulang: number;
    cukup: number;
    baik: number;
    lancar: number;
  }[] = [];

  for (const klass of classes ?? []) {
    const { data: sessions } = await service
      .from("sessions")
      .select("id")
      .eq("class_id", klass.id)
      .eq("term_id", termId);
    const sessionIds = (sessions ?? []).map((s) => s.id);

    const counts = { ulang: 0, cukup: 0, baik: 0, lancar: 0 };
    if (sessionIds.length) {
      const { data: records } = await service
        .from("session_records")
        .select("proficiency")
        .in("session_id", sessionIds)
        .not("proficiency", "is", null);
      for (const r of records ?? []) {
        if (r.proficiency) counts[r.proficiency as ProficiencyRating] += 1;
      }
    }

    results.push({
      classId: klass.id,
      className: klass.name,
      target: targetByClass.get(klass.id) ?? null,
      ...counts,
    });
  }

  return results;
}
