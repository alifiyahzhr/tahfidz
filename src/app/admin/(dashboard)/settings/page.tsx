import { Card } from "@/components/ui/card";
import { getKelompokContext } from "../actions";
import { PinForm } from "./pin-form";

export default async function SettingsPage() {
  const { kelompok } = await getKelompokContext();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>

      <Card className="mt-6">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">
          Teacher PIN &mdash; {kelompok?.name}
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          This is the code teachers enter to sign in and record progress.
        </p>
        <PinForm />
      </Card>
    </div>
  );
}
