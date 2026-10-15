// app/(app)/quiz/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QuizClient from "@/components/quiz/QuizClient";

export default async function QuizPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [quizzesRes, profileRes] = await Promise.all([
    supabase.from("quizzes").select("*").eq("is_active", true).order("created_at"),
    supabase.from("profiles").select("credit_points, id").eq("id", user.id).single(),
  ]);

  return (
    <QuizClient
      quizzes={quizzesRes.data ?? []}
      userId={user.id}
      creditPoints={(profileRes.data as { credit_points: number } | null)?.credit_points ?? 0}
    />
  );
}
