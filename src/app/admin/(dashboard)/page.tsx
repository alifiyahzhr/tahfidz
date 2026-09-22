import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { PageTitle } from "@/components/ui/page-title";
import { getDashboardStats } from "./actions";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <AppIcon size={48} className="mb-3" />
      <PageTitle icon={LayoutDashboard}>Dashboard</PageTitle>
      <p className="mt-1 text-sm text-zinc-500">
        {stats.term ? stats.term.name : "No active term set"}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-zinc-500">Active students</p>
          <p className="mt-1 text-2xl font-semibold">{stats.studentCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Classes</p>
          <p className="mt-1 text-2xl font-semibold">{stats.classCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Sessions this term</p>
          <p className="mt-1 text-2xl font-semibold">{stats.sessionCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Records logged</p>
          <p className="mt-1 text-2xl font-semibold">{stats.recordCount}</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/sessions">
          <Card className="transition-colors hover:border-emerald-300">
            <p className="font-medium text-zinc-900">Review Sessions</p>
            <p className="mt-1 text-sm text-zinc-500">
              Correct attendance, progress, and comments teachers have logged.
            </p>
          </Card>
        </Link>
        <Link href="/admin/students">
          <Card className="transition-colors hover:border-emerald-300">
            <p className="font-medium text-zinc-900">Manage Students</p>
            <p className="mt-1 text-sm text-zinc-500">
              Add students, update details, view individual profiles.
            </p>
          </Card>
        </Link>
        <Link href="/admin/classes">
          <Card className="transition-colors hover:border-emerald-300">
            <p className="font-medium text-zinc-900">Classes</p>
            <p className="mt-1 text-sm text-zinc-500">
              Manage memorisation and recitation classes.
            </p>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="transition-colors hover:border-emerald-300">
            <p className="font-medium text-zinc-900">Reports</p>
            <p className="mt-1 text-sm text-zinc-500">
              Attendance and progress charts.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
