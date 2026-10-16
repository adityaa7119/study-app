// components/layout/MobileNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Rocket,
  Activity,
  Briefcase,
  Grid,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onOpenMenu?: () => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/shorts", icon: Film, label: "Shorts" },
  { href: "/projects", icon: Rocket, label: "Projects" },
  { href: "/simulator", icon: Activity, label: "Simulator" },
  { href: "/placement", icon: Briefcase, label: "Career" },
];

export default function MobileNav({ onOpenMenu }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-2xl text-[var(--text-primary)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 px-1 shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 select-none",
                isActive
                  ? "text-[#D97D29] font-bold dark:text-[#E3A354]"
                  : "text-white/60 hover:text-white"
              )}
            >
              {/* Active Pip glow */}
              {isActive && (
                <div className="absolute -top-1 w-6 h-1 rounded-full bg-[#D97D29] shadow-sm shadow-[#D97D29]/50 animate-pulse" />
              )}
              <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110 text-[#D97D29]")} />
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* More Menu Trigger for phone thumb reach */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-white/60 hover:text-white active:scale-90 transition-all select-none"
          title="All Tools & Settings"
        >
          <Grid className="h-5 w-5" />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">More</span>
        </button>
      </div>
    </nav>
  );
}
