"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GraduationCap,
  CalendarRange,
  BarChart3,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sessions", label: "Sessions", icon: ClipboardList },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/terms", label: "Terms", icon: CalendarRange },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-50 text-emerald-800"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
