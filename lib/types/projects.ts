// lib/types/projects.ts

export type EngineeringBranch =
  | "All Branches"
  | "Data Science & AI"
  | "Computer Science & IT"
  | "Electronics & ENTC"
  | "Electrical Engineering"
  | "Mechanical Engineering"
  | "Civil Engineering";

export type AcademicYear =
  | "All Years"
  | "First Year (FE)"
  | "Second Year (SE)"
  | "Third Year (TE)"
  | "Final Year (BE)";

export type ProjectDifficulty = "Beginner (Weekend)" | "Intermediate (1-2 Weeks)" | "Advanced (Semester)";

export interface ProjectMilestone {
  phase: string;
  title: string;
  description: string;
  tasks: string[];
}

export interface ProjectResource {
  name: string;
  url: string;
  type: "dataset" | "api" | "documentation" | "tool";
}

export interface MiniProject {
  id: string;
  title: string;
  tagline: string;
  branch: EngineeringBranch;
  year: AcademicYear;
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  skills: string[];
  overview: string;
  realWorldImpact: string;
  architecture: string;
  milestones: ProjectMilestone[];
  starterCode: {
    language: string;
    filename: string;
    code: string;
  };
  recommendedResources: ProjectResource[];
  resumeBulletPoints: string[];
}

export interface ProjectFilterState {
  branch: EngineeringBranch;
  year: AcademicYear;
  difficulty: ProjectDifficulty | "All Difficulties";
  searchQuery: string;
  selectedSkills: string[];
}
