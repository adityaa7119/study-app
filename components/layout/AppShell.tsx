// components/layout/AppShell.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Coins, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import StudyBot from "@/components/ai/StudyBot";
import FocusOverlay from "@/components/focus/FocusOverlay";
import type { Profile } from "@/lib/types/database";
import { getAvatarUrl } from "@/lib/constants/avatars";
import AvatarPickerModal from "@/components/settings/AvatarPickerModal";

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export default function AppShell({ profile, children }: AppShellProps) {
  const { setProfile, isBotOpen, isFocusActive } = useAppStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setProfile(profile);
  }, [profile, setProfile]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const getPageTitle = () => {
    if (pathname.includes("/shorts")) return "Study Shorts";
    if (pathname.includes("/projects")) return "Project Lab";
    if (pathname.includes("/simulator")) return "Concept Simulator";
    if (pathname.includes("/placement")) return "Placement Hub";
    if (pathname.includes("/planner")) return "Planner";
    if (pathname.includes("/quiz")) return "Quiz Arena";
    if (pathname.includes("/library")) return "Library";
    if (pathname.includes("/focus")) return "Focus Shield";
    if (pathname.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden forest-wallpaper-bg text-[var(--text-primary)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (with Photo 1 hamburger menu style) */}
        <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[var(--bg-card)]/80 backdrop-blur-xl px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-primary)] hover:bg-[#D97D29]/15 active:scale-95 transition"
              aria-label="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-[#D97D29]/15 px-2.5 py-1 text-xs font-bold text-[#D97D29] dark:text-[#E3A354]">
              <Coins className="h-3.5 w-3.5 text-[#D97D29]" />
              <span>{profile.credit_points}</span>
            </div>
            <button
              onClick={() => setIsAvatarPickerOpen(true)}
              className="relative group cursor-pointer"
              title="Change Profile Picture"
            >
              <img
                src={getAvatarUrl(profile.avatar_seed, profile.full_name)}
                alt="avatar"
                className="h-7 w-7 rounded-full object-cover border border-[#D97D29] group-hover:scale-105 transition"
              />
            </button>
          </div>
        </header>

        {/* Scrollable content body with mobile bottom padding */}
        <main className="flex-1 overflow-y-auto bg-black/20 dark:bg-black/35 backdrop-blur-[2px]">
          <div className="min-h-full p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">{children}</div>
        </main>

        {/* Mobile bottom navigation bar */}
        <div className="lg:hidden">
          <MobileNav onOpenMenu={() => setIsDrawerOpen(true)} />
        </div>
      </div>

      {/* Mobile drawer sidebar backdrop and modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 flex h-full w-72 flex-col shadow-2xl"
            >
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-3 top-4 rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[#D97D29]/15 z-20"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar onClose={() => setIsDrawerOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* StudyBot slide-over */}
      {isBotOpen && <StudyBot />}

      {/* Focus overlay (full-screen) */}
      {isFocusActive && <FocusOverlay />}

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
    </div>
  );
}
