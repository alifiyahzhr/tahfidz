export type ClassType = "memorisation" | "recitation";

export type AttendanceStatus =
  | "hadir"
  | "izin_reason"
  | "izin_no_reason"
  | "absent";

export type ProficiencyRating = "ulang" | "cukup" | "baik" | "lancar";

export type AdminRole = "super_admin" | "daerah_admin" | "kelompok_admin";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  izin_reason: "Izin (with reason)",
  izin_no_reason: "Izin (no reason)",
  absent: "Absent",
};

export const PROFICIENCY_LABELS: Record<ProficiencyRating, string> = {
  ulang: "Ulang",
  cukup: "Cukup",
  baik: "Baik",
  lancar: "Lancar",
};

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  memorisation: "Memorisation",
  recitation: "Recitation",
};

export interface Daerah {
  id: string;
  name: string;
}

export interface Kelompok {
  id: string;
  daerah_id: string;
  name: string;
  slug: string;
  pin: string | null;
}

export interface KelompokWithDaerah extends Kelompok {
  daerah_name: string;
}

export interface Teacher {
  id: string;
  kelompok_id: string;
  full_name: string;
}

export interface StudentTarget {
  id: string;
  student_id: string;
  term_id: string;
  target_text: string;
}

export interface Term {
  id: string;
  daerah_id: string;
  year: number;
  term_number: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface SchoolClass {
  id: string;
  kelompok_id: string;
  name: string;
  type: ClassType;
  sort_order: number;
  is_active: boolean;
}

export interface Student {
  id: string;
  kelompok_id: string;
  full_name: string;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Enrollment {
  id: string;
  student_id: string;
  term_id: string;
  class_id: string;
}

export interface Session {
  id: string;
  class_id: string;
  term_id: string;
  session_date: string;
  teacher_name: string;
}

export interface SessionRecord {
  id: string;
  session_id: string;
  student_id: string;
  attendance: AttendanceStatus;
  progress_text: string | null;
  proficiency: ProficiencyRating | null;
  comments: string | null;
  updated_by_admin: boolean;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  auth_user_id: string;
  full_name: string;
  role: AdminRole;
  daerah_id: string | null;
  kelompok_id: string | null;
}
