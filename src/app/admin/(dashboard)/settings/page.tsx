import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { getKelompokContext, listTeachers } from "../actions";
import { PinForm } from "./pin-form";
import { TeachersCard } from "./teachers-card";

export default async function SettingsPage() {
  const [{ kelompok }, teachers] = await Promise.all([
    getKelompokContext(),
    listTeachers(),
  ]);

  return (
    <div>
      <PageTitle icon={SettingsIcon}>Settings</PageTitle>

      <Card className="mt-6">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">
          Teacher PIN &mdash; {kelompok?.name}
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          This is the code teachers enter to sign in and record progress.
        </p>
        <PinForm />
      </Card>

      <TeachersCard teachers={teachers} />
    </div>
  );
}
