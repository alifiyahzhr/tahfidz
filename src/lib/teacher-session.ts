import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "tahfidz_kelompok";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

export interface KelompokSession {
  kelompokId: string;
  kelompokName: string;
  kelompokSlug: string;
  exp: number;
}

function secret() {
  const s = process.env.TEACHER_SESSION_SECRET;
  if (!s) throw new Error("Missing TEACHER_SESSION_SECRET env var.");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function setKelompokSession(
  data: Omit<KelompokSession, "exp">,
) {
  const session: KelompokSession = {
    ...data,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getKelompokSession(): Promise<KelompokSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const session: KelompokSession = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function clearKelompokSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
