// app/(app)/dashboard/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getMondayOfCurrentWeek, formatDateKey } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const mondayDate = getMondayOfCurrentWeek();
  const weekKey = formatDateKey(mondayDate);

  const [profileRes, schedulesRes, attemptsRes, sessionsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start_date", weekKey),
    supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(20),
    supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("started_at", { ascending: true }),
  ]);

  return (
    <DashboardClient
      profile={profileRes.data!}
      schedules={schedulesRes.data ?? []}
      quizAttempts={attemptsRes.data ?? []}
      recentSessions={sessionsRes.data ?? []}
    />
  );
}
