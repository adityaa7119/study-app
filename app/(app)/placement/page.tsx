// app/(app)/placement/page.tsx
import type { Metadata } from "next";
import PlacementClient from "@/components/placement/PlacementClient";

export const metadata: Metadata = {
  title: "Placement & Career Hub | Company Cutoffs, OA Archive & ATS Scanner",
  description:
    "Engineering campus recruitment accelerator. Explore company hiring rounds and CGPA cutoffs, practice solved technical OA archives, test your resume with our instant ATS scanner, and track your applications.",
};

export default function PlacementPage() {
  return <PlacementClient />;
}
