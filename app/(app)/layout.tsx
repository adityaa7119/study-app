// app/(app)/layout.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import type { Profile } from "@/lib/types/database";

const DEFAULT_PROFILE: Profile = {
  id: "usr_siddhi_default",
  email: "siddhi@studybuddy.edu",
  full_name: "Siddhi",
  avatar_seed: "/avatars/avatar-1.png",
  target_exam: "First Year (FE)",
  daily_target_hours: 6,
  exam_date: null,
  streak_count: 12,
  longest_streak: 15,
  credit_points: 120,
  total_focus_minutes: 260,
  last_active_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile = DEFAULT_PROFILE;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) profile = data as Profile;
    }
  } catch {
    // Fallback gracefully to default student profile in dev environment
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
