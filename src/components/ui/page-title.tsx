import type { LucideIcon } from "lucide-react";

export function PageTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
      <Icon className="h-5 w-5 text-emerald-700" strokeWidth={2} />
      {children}
    </h1>
  );
}
