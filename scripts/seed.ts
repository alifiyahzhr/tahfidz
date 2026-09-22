/**
 * One-time setup script: creates the AU-NZ daerah, the Sydney kelompok
 * (with its teacher PIN), the four NSW 2026 school terms, and one admin
 * login. Safe to re-run -- it skips anything that already exists.
 *
 * Edit the CONFIG block below, then run:
 *   npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const CONFIG = {
  daerahName: "AU-NZ",
  kelompokName: "Sydney",
  kelompokSlug: "sydney",
  teacherPin: "sydney2026", // teachers will use this to sign in -- change it!
  adminEmail: "zack.macock@gmail.com",
  adminPassword: "DyMnTo4d0Zwp8PK5",
  adminFullName: "Admin",
  terms: [
    { year: 2026, term_number: 1, name: "Term 1 2026", start_date: "2026-02-02", end_date: "2026-04-02" },
    { year: 2026, term_number: 2, name: "Term 2 2026", start_date: "2026-04-22", end_date: "2026-07-03" },
    { year: 2026, term_number: 3, name: "Term 3 2026", start_date: "2026-07-21", end_date: "2026-09-25" },
    { year: 2026, term_number: 4, name: "Term 4 2026", start_date: "2026-10-13", end_date: "2026-12-17" },
  ],
  activeTermNumber: 3, // NSW term currently in progress
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local and fill it in first.",
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Setting up daerah...");
  let { data: daerah } = await supabase
    .from("daerah")
    .select("*")
    .eq("name", CONFIG.daerahName)
    .maybeSingle();
  if (!daerah) {
    const { data, error } = await supabase
      .from("daerah")
      .insert({ name: CONFIG.daerahName })
      .select("*")
      .single();
    if (error) throw error;
    daerah = data;
  }

  console.log("Setting up kelompok...");
  let { data: kelompok } = await supabase
    .from("kelompok")
    .select("*")
    .eq("slug", CONFIG.kelompokSlug)
    .maybeSingle();
  if (!kelompok) {
    const pinHash = await bcrypt.hash(CONFIG.teacherPin, 10);
    const { data, error } = await supabase
      .from("kelompok")
      .insert({
        daerah_id: daerah.id,
        name: CONFIG.kelompokName,
        slug: CONFIG.kelompokSlug,
        pin_hash: pinHash,
      })
      .select("*")
      .single();
    if (error) throw error;
    kelompok = data;
    console.log(`  Teacher PIN set to: ${CONFIG.teacherPin}`);
  } else {
    console.log("  Kelompok already exists, leaving its PIN as-is.");
  }

  console.log("Setting up terms...");
  for (const term of CONFIG.terms) {
    const { data: existing } = await supabase
      .from("terms")
      .select("id")
      .eq("daerah_id", daerah.id)
      .eq("year", term.year)
      .eq("term_number", term.term_number)
      .maybeSingle();
    if (!existing) {
      await supabase.from("terms").insert({ ...term, daerah_id: daerah.id });
    }
  }

  console.log(`Activating term ${CONFIG.activeTermNumber}...`);
  await supabase.from("terms").update({ is_active: false }).eq("daerah_id", daerah.id);
  await supabase
    .from("terms")
    .update({ is_active: true })
    .eq("daerah_id", daerah.id)
    .eq("term_number", CONFIG.activeTermNumber)
    .eq("year", 2026);

  console.log("Setting up admin login...");
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let authUser = existingUsers.users.find((u) => u.email === CONFIG.adminEmail);
  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: CONFIG.adminEmail,
      password: CONFIG.adminPassword,
      email_confirm: true,
    });
    if (error) throw error;
    authUser = data.user;
    console.log(`  Admin login created: ${CONFIG.adminEmail} / ${CONFIG.adminPassword}`);
    console.log("  Please sign in and change this password.");
  } else {
    console.log("  Admin auth user already exists, leaving password as-is.");
  }

  const { data: existingAdminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", authUser!.id)
    .maybeSingle();
  if (!existingAdminRow) {
    await supabase.from("admin_users").insert({
      auth_user_id: authUser!.id,
      full_name: CONFIG.adminFullName,
      role: "kelompok_admin",
      daerah_id: daerah.id,
      kelompok_id: kelompok.id,
    });
  }

  console.log("\nDone. Next steps:");
  console.log(`  - Teacher PIN: ${CONFIG.teacherPin} (change it any time from Admin > Settings)`);
  console.log(`  - Admin login: ${CONFIG.adminEmail} / ${CONFIG.adminPassword}`);
  console.log("  - Add classes and students from the Admin dashboard.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
