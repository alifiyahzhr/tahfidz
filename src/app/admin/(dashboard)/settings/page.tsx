import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { listAccessibleKelompoks, listTeachers } from "../actions";
import { KelompokPinsTable } from "./kelompok-pins-table";
import { ChangePasswordCard } from "./change-password-card";
import { TeachersCard } from "./teachers-card";

export default async function SettingsPage() {
  const [kelompoks, teachers] = await Promise.all([
    listAccessibleKelompoks(),
    listTeachers(),
  ]);

  return (
    <div>
      <PageTitle icon={SettingsIcon}>Settings</PageTitle>

      <Card className="mt-6">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">
          Teacher PINs
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          The code teachers enter to sign in and record progress, per
          kelompok.
        </p>
        <KelompokPinsTable kelompoks={kelompoks} />
      </Card>

      <ChangePasswordCard />

      <TeachersCard teachers={teachers} />
    </div>
  );
}
