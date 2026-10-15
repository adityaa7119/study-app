// lib/store/useAppStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/lib/types/database";

export type Theme = "light" | "dark" | "amoled";

interface AppState {
  profile: Profile | null;
  theme: Theme;
  isBotOpen: boolean;
  isFocusActive: boolean;
  focusSubject: string;
  focusDurationMinutes: number;
  focusSecondsRemaining: number;
  focusTabSwitches: number;

  setProfile: (profile: Profile | null) => void;
  setTheme: (theme: Theme) => void;
  openBot: () => void;
  closeBot: () => void;
  startFocus: (subject: string, durationMinutes: number) => void;
  endFocus: () => void;
  tickFocus: () => void;
  incrementTabSwitch: () => void;
  updateCredits: (delta: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      theme: "dark",
      isBotOpen: false,
      isFocusActive: false,
      focusSubject: "",
      focusDurationMinutes: 25,
      focusSecondsRemaining: 0,
      focusTabSwitches: 0,

      setProfile: (profile) => set({ profile }),

      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        root.classList.remove("dark", "amoled", "light");
        if (theme === "dark" || theme === "amoled") {
          root.classList.add("dark");
        }
        if (theme === "amoled") {
          root.classList.add("amoled");
        }
      },

      openBot: () => set({ isBotOpen: true }),
      closeBot: () => set({ isBotOpen: false }),

      startFocus: (subject, durationMinutes) =>
        set({
          isFocusActive: true,
          focusSubject: subject,
          focusDurationMinutes: durationMinutes,
          focusSecondsRemaining: durationMinutes * 60,
          focusTabSwitches: 0,
        }),

      endFocus: () =>
        set({
          isFocusActive: false,
          focusSubject: "",
          focusSecondsRemaining: 0,
          focusTabSwitches: 0,
        }),

      tickFocus: () => {
        const { focusSecondsRemaining } = get();
        if (focusSecondsRemaining > 0) {
          set({ focusSecondsRemaining: focusSecondsRemaining - 1 });
        }
      },

      incrementTabSwitch: () =>
        set((s) => ({ focusTabSwitches: s.focusTabSwitches + 1 })),

      updateCredits: (delta) =>
        set((s) => {
          if (!s.profile) return s;
          return {
            profile: {
              ...s.profile,
              credit_points: Math.max(0, s.profile.credit_points + delta),
            },
          };
        }),
    }),
    {
      name: "studybuddy-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
