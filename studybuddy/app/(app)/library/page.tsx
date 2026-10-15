// app/(app)/library/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LibraryClient from "@/components/library/LibraryClient";

export default async function LibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return <LibraryClient notes={notes ?? []} />;
}
