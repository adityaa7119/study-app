// app/(app)/planner/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlannerClient from "@/components/planner/PlannerClient";
import { getMondayOfCurrentWeek, formatDateKey } from "@/lib/utils";

export default async function PlannerPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const monday = getMondayOfCurrentWeek();
  const weekKey = formatDateKey(monday);

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start_date", weekKey)
    .order("day_of_week")
    .order("start_time");

  return (
    <PlannerClient
      initialSchedules={schedules ?? []}
      weekStartDate={weekKey}
      userId={user.id}
    />
  );
}
