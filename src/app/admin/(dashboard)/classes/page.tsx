import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { CLASS_TYPE_LABELS } from "@/lib/types";
import { getKelompokContext } from "../actions";
import { AddClassForm } from "./add-class-form";

export default async function ClassesPage() {
  const { classes } = await getKelompokContext();

  return (
    <div>
      <PageTitle icon={GraduationCap}>Classes</PageTitle>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Add a Class</h2>
        <AddClassForm />
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {classes.map((c) => (
          <Card key={c.id}>
            <p className="font-medium text-zinc-900">{c.name}</p>
            <p className="text-xs text-zinc-500">{CLASS_TYPE_LABELS[c.type]}</p>
          </Card>
        ))}
        {classes.length === 0 && (
          <p className="text-sm text-zinc-500">No classes yet.</p>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Targets are set per student now, from each student&apos;s profile
        page -- open a student under{" "}
        <Link href="/admin/students" className="underline">
          Students
        </Link>{" "}
        to set theirs.
      </p>
    </div>
  );
}
