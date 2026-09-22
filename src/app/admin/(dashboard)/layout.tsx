import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-session";
import { SignOutButton } from "./sign-out-button";
import { NavLinks } from "./nav-links";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-white px-4 py-4 md:w-56 md:shrink-0 md:border-b-0 md:border-r md:px-3 md:py-6">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-zinc-900">Tahfidz Admin</p>
          <p className="text-xs text-zinc-500">{admin.full_name}</p>
        </div>
        <NavLinks />
        <div className="mt-6 px-2 md:mt-8">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
