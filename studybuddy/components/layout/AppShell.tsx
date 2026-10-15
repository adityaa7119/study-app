// components/layout/AppShell.tsx
"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import StudyBot from "@/components/ai/StudyBot";
import FocusOverlay from "@/components/focus/FocusOverlay";
import type { Profile } from "@/lib/types/database";

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export default function AppShell({ profile, children }: AppShellProps) {
  const { setProfile, isBotOpen, isFocusActive } = useAppStore();

  useEffect(() => {
    setProfile(profile);
  }, [profile, setProfile]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 lg:p-8">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>

      {/* StudyBot slide-over */}
      {isBotOpen && <StudyBot />}

      {/* Focus overlay (full-screen) */}
      {isFocusActive && <FocusOverlay />}
    </div>
  );
}
