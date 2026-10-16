// app/(app)/shorts/page.tsx
import type { Metadata } from "next";
import ShortsClient from "@/components/shorts/ShortsClient";

export const metadata: Metadata = {
  title: "Study Shorts | Educational Micro-Learning",
  description: "Bite-sized, interactive STEM & study technique concept lessons.",
};

export default function ShortsPage() {
  return <ShortsClient />;
}
