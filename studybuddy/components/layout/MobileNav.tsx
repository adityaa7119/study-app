// components/layout/MobileNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Trophy, Library, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/planner", icon: Calendar, label: "Planner" },
  { href: "/quiz", icon: Trophy, label: "Quiz" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-t border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              isActive
                ? "text-[#D97D29] font-semibold dark:text-[#E3A354]"
                : "text-[var(--text-secondary)] hover:text-[#D97D29]"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
