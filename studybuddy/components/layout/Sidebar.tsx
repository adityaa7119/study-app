// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Library,
  Settings,
  Shield,
  Bot,
  GraduationCap,
  LogOut,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/quiz", label: "Quiz Arena", icon: Trophy },
  { href: "/library", label: "Library", icon: Library },
  { href: "/focus", label: "Focus Shield", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, openBot } = useAppStore();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-white">StudyBuddy</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {profile?.target_exam ?? "Exam Prep"}
          </div>
        </div>
      </div>

      {/* Credits wallet */}
      {profile && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-500/10">
          <Coins className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {profile.credit_points.toLocaleString()} credits
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "nav-link",
                  isActive && "active"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* AI Tutor */}
        <button
          onClick={openBot}
          className="nav-link w-full text-left"
        >
          <Bot className="h-4 w-4 shrink-0 text-indigo-500" />
          <span>StudyBot AI</span>
          <span className="ml-auto rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            AI
          </span>
        </button>
      </nav>

      {/* User profile footer */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-700">
        {profile && (
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.avatar_seed}&backgroundColor=6366f1&textColor=fff`}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {profile.full_name}
              </div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {profile.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="nav-link w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
