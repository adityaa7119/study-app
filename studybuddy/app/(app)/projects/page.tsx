// app/(app)/projects/page.tsx
import type { Metadata } from "next";
import ProjectsClient from "@/components/projects/ProjectsClient";

export const metadata: Metadata = {
  title: "Project Lab | Mini Project Suggester & Build Planner",
  description:
    "Curated engineering & data science mini-projects with step-by-step build plans, starter code, datasets, and STAR resume bullets.",
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
