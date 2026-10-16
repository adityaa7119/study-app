"use client";

import { useState } from "react";
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
  Users,
  Film,
  Rocket,
  Activity,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/constants/avatars";
import AvatarPickerModal from "@/components/settings/AvatarPickerModal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shorts", label: "Study Shorts", icon: Film, badge: "New" },
  { href: "/projects", label: "Project Lab", icon: Rocket, badge: "AI" },
  { href: "/simulator", label: "Concept Simulator", icon: Activity, badge: "Code" },
  { href: "/placement", label: "Placement Hub", icon: Briefcase, badge: "Jobs" },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/quiz", label: "Quiz Arena", icon: Trophy },
  { href: "/library", label: "Library", icon: Library },
  { href: "/focus", label: "Focus Shield", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, openBot } = useAppStore();
  const router = useRouter();

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-black/30 backdrop-blur-3xl text-white transition-all select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <div className="apple-glass-icon flex h-11 w-11 items-center justify-center text-white shadow-lg shadow-[#D97D29]/25">
          <GraduationCap className="h-5 w-5 text-[#E3A354]" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight font-poppins">StudyBuddy</div>
          <div className="text-xs text-[#E8D6C4] font-medium">
            {profile?.target_exam === "JEE" ? "First Year (FE)" : (profile?.target_exam ?? "First Year (FE)")}
          </div>
        </div>
      </div>

      {/* Credits wallet */}
      {profile && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-2.5 backdrop-blur-xl shadow-sm">
          <Coins className="h-4 w-4 text-[#E3A354]" />
          <span className="text-xs font-semibold text-[#FDF5EC]">
            {profile.credit_points.toLocaleString()} credits
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "nav-link",
                  isActive && "active"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#D97D29] dark:text-[#E3A354]" : "text-[var(--text-secondary)]")} />
                <span>{item.label}</span>
                {"badge" in item && (
                  <span className="ml-1.5 rounded-full bg-gradient-to-r from-[#D97D29]/30 to-[#E3A354]/30 border border-[#E3A354]/40 px-1.5 py-0.5 text-[9px] font-bold text-[#E3A354]">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto h-2 w-2 rounded-full bg-[#D97D29] dark:bg-[#E3A354]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* AI Tutor */}
        <button
          onClick={() => {
            if (onClose) onClose();
            openBot();
          }}
          className="nav-link w-full text-left"
        >
          <Bot className="h-4 w-4 shrink-0 text-[#E3A354]" />
          <span>StudyBot AI</span>
          <span className="ml-auto rounded-full bg-[#E3A354]/20 px-2 py-0.5 text-[10px] font-bold text-[#D97D29] dark:bg-[#D97D29]/30 dark:text-[#E3A354]">
            AI Tutor
          </span>
        </button>
      </nav>

      {/* User profile footer */}
      <div className="border-t border-white/10 p-3">
        {profile && (
          <div
            onClick={() => setIsAvatarPickerOpen(true)}
            className="mb-2 flex items-center gap-3 rounded-2xl p-2.5 bg-white/10 border border-white/15 backdrop-blur-xl hover:bg-white/20 transition cursor-pointer group"
            title="Click to choose or upload profile picture"
          >
            <div className="relative shrink-0">
              <img
                src={getAvatarUrl(profile.avatar_seed, profile.full_name)}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover border border-[#E3A354] group-hover:scale-105 transition"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#E3A354] border border-[#2B1810] flex items-center justify-center text-[7px] text-black font-bold">
                ✎
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-white group-hover:text-[#E3A354] transition">
                {profile.full_name}
              </div>
              <div className="truncate text-[11px] text-[#E8D6C4]/80">
                {profile.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-semibold w-full text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 backdrop-blur-sm transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Avatar Picker Modal */}
      {profile && (
        <AvatarPickerModal
          isOpen={isAvatarPickerOpen}
          onClose={() => setIsAvatarPickerOpen(false)}
          currentAvatar={profile.avatar_seed}
          onSelect={(newAvatar) => {
            const { setProfile } = useAppStore.getState();
            setProfile({ ...profile, avatar_seed: newAvatar });
          }}
          studentName={profile.full_name}
        />
      )}
    </aside>
  );
}
