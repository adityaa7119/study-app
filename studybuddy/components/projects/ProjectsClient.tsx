// components/projects/ProjectsClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Code2,
  Clock,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  FileCode,
  Bookmark,
  Share2,
  Bot,
  Brain,
  Lightbulb,
  Award,
  Download,
  Terminal,
  Cpu,
  BarChart3,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { CURATED_PROJECTS, ALL_SKILLS_LIST } from "@/lib/data/curatedProjects";
import type {
  MiniProject,
  EngineeringBranch,
  AcademicYear,
  ProjectDifficulty,
} from "@/lib/types/projects";

const BRANCHES: EngineeringBranch[] = [
  "All Branches",
  "Data Science & AI",
  "Computer Science & IT",
  "Electronics & ENTC",
  "Mechanical Engineering",
];

const YEARS: AcademicYear[] = [
  "All Years",
  "First Year (FE)",
  "Second Year (SE)",
  "Third Year (TE)",
  "Final Year (BE)",
];

const DIFFICULTIES: (ProjectDifficulty | "All Difficulties")[] = [
  "All Difficulties",
  "Beginner (Weekend)",
  "Intermediate (1-2 Weeks)",
  "Advanced (Semester)",
];

export default function ProjectsClient() {
  const { profile, openBot } = useAppStore();

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<EngineeringBranch>(() => {
    return "Data Science & AI";
  });
  const [selectedYear, setSelectedYear] = useState<AcademicYear>("All Years");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ProjectDifficulty | "All Difficulties">("All Difficulties");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);

  // Active / Bookmarked Projects
  const [savedProjectIds, setSavedProjectIds] = useState<Record<string, boolean>>({});
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Selected Project for Detailed Build Plan Modal
  const [activeProject, setActiveProject] = useState<MiniProject | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"milestones" | "code" | "resources" | "resume">("milestones");
  const [codeCopied, setCodeCopied] = useState(false);

  // Task checklist state (stored in localStorage)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("studybuddy_project_tasks");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem("studybuddy_project_tasks", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // AI Project Generator State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState("");
  const [aiBranch, setAiBranch] = useState("Data Science & AI");
  const [aiYear, setAiYear] = useState("Second Year (SE)");
  const [aiSkills, setAiSkills] = useState("Python, Pandas, Scikit-Learn");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<MiniProject | null>(null);

  // Toggle Save Project
  const toggleSaveProject = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedProjectIds((prev) => {
      const isSaved = !prev[projectId];
      toast.success(isSaved ? "Project added to My Active Projects!" : "Removed from My Projects");
      return { ...prev, [projectId]: isSaved };
    });
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    const list = generatedProject ? [generatedProject, ...CURATED_PROJECTS] : CURATED_PROJECTS;

    return list.filter((p) => {
      if (showSavedOnly && !savedProjectIds[p.id]) return false;
      if (selectedBranch !== "All Branches" && p.branch !== selectedBranch) return false;
      if (selectedYear !== "All Years" && p.year !== selectedYear) return false;
      if (selectedDifficulty !== "All Difficulties" && p.difficulty !== selectedDifficulty) return false;
      if (activeSkillFilter && !p.skills.includes(activeSkillFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTagline = p.tagline.toLowerCase().includes(q);
        const matchesSkills = p.skills.some((s) => s.toLowerCase().includes(q));
        const matchesOverview = p.overview.toLowerCase().includes(q);
        return matchesTitle || matchesTagline || matchesSkills || matchesOverview;
      }

      return true;
    });
  }, [selectedBranch, selectedYear, selectedDifficulty, activeSkillFilter, searchQuery, showSavedOnly, savedProjectIds, generatedProject]);

  // Handle Copy Code
  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      toast.success("Starter code copied to clipboard!");
      setTimeout(() => setCodeCopied(false), 2200);
    }
  };

  // Handle Export Build Plan as Markdown
  const handleExportMarkdown = (project: MiniProject) => {
    const md = `# ${project.title}
**Branch:** ${project.branch} | **Target Year:** ${project.year} | **Difficulty:** ${project.difficulty} (${project.estimatedHours} hrs)
**Skills:** ${project.skills.join(", ")}

## Overview
${project.overview}

## Real-World Impact
${project.realWorldImpact}

## Architecture
${project.architecture}

## Build Plan & Milestones
${project.milestones
  .map(
    (m, i) => `### ${m.phase}: ${m.title}
${m.description}
${m.tasks.map((t) => `- [ ] ${t}`).join("\n")}
`
  )
  .join("\n")}

## Starter Code (${project.starterCode.filename})
\`\`\`${project.starterCode.language}
${project.starterCode.code}
\`\`\`

## Recommended Datasets & Resources
${project.recommendedResources.map((r) => `- [${r.name}](${r.url}) (${r.type})`).join("\n")}

## Resume Bullet Points (STAR Format)
${project.resumeBulletPoints.map((b) => `- ${b}`).join("\n")}
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.id}-build-plan.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Build plan exported as Markdown! 📑");
  };

  // AI Custom Generator Call
  const handleGenerateCustomProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a complete Mini Engineering Project specification for a student with:
Branch: ${aiBranch}
Academic Year: ${aiYear}
Known Skills: ${aiSkills}
Specific Interest/Topic: ${aiPromptTopic || "practical prediction or real-time web application"}

You must return a valid JSON object matching this structure:
{
  "id": "custom-ai-project-${Date.now()}",
  "title": "Title of the project",
  "tagline": "One punchy sentence summary",
  "branch": "${aiBranch}",
  "year": "${aiYear}",
  "difficulty": "Intermediate (1-2 Weeks)",
  "estimatedHours": 18,
  "skills": ["Skill1", "Skill2", "Skill3"],
  "overview": "Detailed 2-3 sentence overview",
  "realWorldImpact": "Why companies or industries care about this",
  "architecture": "Flowchart text e.g. Data -> Feature Engineering -> Model -> Web App",
  "milestones": [
    {
      "phase": "Phase 1: Setup & Data",
      "title": "Data ingestion and cleaning",
      "description": "Details",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "phase": "Phase 2: Core Algorithm & Implementation",
      "title": "Build the model or system",
      "description": "Details",
      "tasks": ["Task 1", "Task 2"]
    },
    {
      "phase": "Phase 3: Deployment & User Interface",
      "title": "Interactive front-end",
      "description": "Details",
      "tasks": ["Task 1", "Task 2"]
    }
  ],
  "starterCode": {
    "language": "python",
    "filename": "main.py",
    "code": "# Starter boilerplate code"
  },
  "recommendedResources": [
    { "name": "Resource Name", "url": "https://kaggle.com", "type": "dataset" }
  ],
  "resumeBulletPoints": [
    "Engineered ... using ... achieving ...",
    "Implemented ... resulting in ..."
  ]
}
Return ONLY the raw JSON object, without markdown quotes or backticks if possible.`,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data && data.text) {
        // Try to parse json from AI text
        const cleanJson = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson) as MiniProject;
        setGeneratedProject(parsed);
        setActiveProject(parsed);
        setIsAiModalOpen(false);
        toast.success("Custom project build plan generated! 🚀");
      } else {
        throw new Error("No response text");
      }
    } catch {
      // Fallback custom project if offline/rate-limited
      const fallback: MiniProject = {
        id: `ai-custom-${Date.now()}`,
        title: `${aiPromptTopic || "Predictive Intelligence Pipeline"} for ${aiBranch}`,
        tagline: `End-to-end engineered solution customized for ${aiYear} curriculum.`,
        branch: aiBranch as EngineeringBranch,
        year: aiYear as AcademicYear,
        difficulty: "Intermediate (1-2 Weeks)",
        estimatedHours: 16,
        skills: aiSkills.split(",").map((s) => s.trim()),
        overview: `A tailored ${aiBranch} mini-project applying ${aiSkills} to build a real-time data ingestion and analytics pipeline.`,
        realWorldImpact: "Demonstrates practical production readiness and end-to-end deployment on engineering portfolios.",
        architecture: "Data Source -> Preprocessing Pipeline -> Inference Engine -> Interactive UI Dashboard.",
        milestones: [
          {
            phase: "Phase 1: Environment & Dataset Acquisition",
            title: "Data Sourcing & Cleaning",
            description: "Set up the local development environment and validate input distributions.",
            tasks: [
              "Create virtual environment and install project dependencies.",
              "Source benchmark dataset matching project requirements.",
              "Document schema and handle null or corrupted records.",
            ],
          },
          {
            phase: "Phase 2: Core Algorithm Implementation",
            title: "Model Development & Optimization",
            description: "Implement baseline and optimized algorithm with evaluation metrics.",
            tasks: [
              "Develop baseline algorithm and log initial benchmark scores.",
              "Tune hyperparameters and cross-validate across stratified folds.",
            ],
          },
          {
            phase: "Phase 3: Interactive Dashboard & Packaging",
            title: "User Experience & GitHub Documentation",
            description: "Build an interactive UI and write clear setup instructions.",
            tasks: [
              "Create a lightweight web UI or CLI for live testing.",
              "Write a professional README with architectural diagrams.",
            ],
          },
        ],
        starterCode: {
          language: "python",
          filename: "custom_pipeline.py",
          code: `# Auto-Generated Starter Code for ${aiPromptTopic || "Engineering Mini-Project"}
import sys

def main():
    print("Initializing custom pipeline for ${aiBranch}...")
    print("Skills: ${aiSkills}")
    # TODO: Add your model training or processing logic here

if __name__ == "__main__":
    main()
`,
        },
        recommendedResources: [
          { name: "Kaggle Open Datasets", url: "https://www.kaggle.com/datasets", type: "dataset" },
          { name: "GitHub Open Source Starter Templates", url: "https://github.com", type: "tool" },
        ],
        resumeBulletPoints: [
          `Engineered a custom ${aiBranch} mini-project integrating ${aiSkills} to deliver automated analysis.`,
          "Implemented comprehensive milestone tracking, error handling, and end-to-end validation metrics.",
        ],
      };
      setGeneratedProject(fallback);
      setActiveProject(fallback);
      setIsAiModalOpen(false);
      toast.success("Custom project build plan ready! 🚀");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-poppins text-white">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER WITH STUDENT PERSONA CHIP */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl apple-glass-card p-6 sm:p-8 shadow-2xl border border-white/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97D29]/20 border border-[#D97D29]/30 text-[#E3A354] text-xs font-semibold mb-3">
              <Rocket className="h-3.5 w-3.5" />
              <span>Project Lab · Resume-Ready Mini Projects</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-poppins">
              Mini Project Suggester & Build Planner
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#E8D6C4]/85 leading-relaxed">
              Curated, syllabus-aligned engineering and data science projects with complete step-by-step
              milestones, starter boilerplate code, real-world datasets, and pre-written resume bullet points.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[#E8D6C4]">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-[#E3A354]" />
                <span><strong className="text-white">{CURATED_PROJECTS.length}</strong> Curated Blueprints</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-[#E3A354]" />
                <span>Starter Code Included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#E3A354]" />
                <span>STAR Resume Bullets</span>
              </div>
            </div>
          </div>

          {/* AI Generator CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D97D29] to-[#E3A354] hover:opacity-95 text-white font-semibold text-xs shadow-xl shadow-[#D97D29]/30 transition active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Custom AI Project</span>
            </button>

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-medium backdrop-blur-md transition",
                showSavedOnly
                  ? "bg-[#E3A354] text-black border-[#E3A354] font-bold"
                  : "bg-white/10 text-white/90 border-white/15 hover:bg-white/20"
              )}
            >
              <Bookmark className="h-4 w-4" />
              <span>
                My Saved Projects ({Object.values(savedProjectIds).filter(Boolean).length})
              </span>
            </button>
          </div>
        </div>

        {/* Soft Background Radial Light */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#D97D29]/20 blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & SEARCH CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="apple-glass-card p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search projects (e.g. prediction, sensor)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E3A354] transition"
            />
          </div>

          {/* Branch Dropdown */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as EngineeringBranch)}
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354] transition"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b} className="bg-[#1D1612] text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Dropdown */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value as AcademicYear)}
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354] transition"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-[#1D1612] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as ProjectDifficulty | "All Difficulties")}
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354] transition"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-[#1D1612] text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-[#E8D6C4]/70 mr-1 shrink-0">
            Skills:
          </span>
          <button
            onClick={() => setActiveSkillFilter(null)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition shrink-0",
              activeSkillFilter === null
                ? "bg-[#D97D29] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            )}
          >
            All Skills
          </button>
          {ALL_SKILLS_LIST.slice(0, 10).map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveSkillFilter(activeSkillFilter === skill ? null : skill)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition shrink-0 whitespace-nowrap",
                activeSkillFilter === skill
                  ? "bg-[#E3A354] text-black font-bold"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROJECT CARDS GRID */}
      {/* ========================================================================= */}
      {filteredProjects.length === 0 ? (
        <div className="apple-glass-card p-12 text-center rounded-3xl border border-white/10 max-w-md mx-auto">
          <BookOpen className="h-12 w-12 mx-auto text-[#E3A354] opacity-50 mb-3" />
          <h3 className="text-base font-bold text-white">No Matching Projects Found</h3>
          <p className="text-xs text-[#E8D6C4]/80 mt-1">
            Try adjusting your search query, branch filter, or click below to generate a tailored build plan with AI.
          </p>
          <button
            onClick={() => {
              setSelectedBranch("All Branches");
              setSelectedYear("All Years");
              setSelectedDifficulty("All Difficulties");
              setActiveSkillFilter(null);
              setSearchQuery("");
            }}
            className="btn-primary mt-4 text-xs mx-auto"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isSaved = !!savedProjectIds[project.id];
            // Calculate completed tasks for this project
            const totalTasks = project.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
            const doneTasks = project.milestones.reduce(
              (acc, m, mIdx) =>
                acc + m.tasks.filter((_, tIdx) => completedTasks[`${project.id}-${mIdx}-${tIdx}`]).length,
              0
            );
            const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col justify-between apple-glass-card rounded-3xl p-5 border border-white/15 hover:border-[#E3A354]/40 hover:bg-white/[0.12] transition-all duration-300 shadow-xl"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-[#D97D29]/20 border border-[#D97D29]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#E3A354]">
                      {project.branch}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-white/70">
                        <Clock className="h-3 w-3 text-[#E3A354]" />
                        {project.estimatedHours}h
                      </span>

                      <button
                        onClick={(e) => toggleSaveProject(project.id, e)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition text-white/70 hover:text-white"
                        title={isSaved ? "Saved" : "Save project"}
                      >
                        <Bookmark
                          className={cn("h-4 w-4", isSaved && "fill-[#E3A354] text-[#E3A354]")}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#E3A354] transition">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#E8D6C4]/85 mt-1.5 leading-relaxed line-clamp-2">
                    {project.tagline}
                  </p>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {project.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-black/40 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-white/90"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className="text-[10px] text-white/50 self-center">
                        +{project.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar (if student started tasks) */}
                <div className="mt-5 pt-3 border-t border-white/10">
                  {doneTasks > 0 ? (
                    <div className="mb-2.5">
                      <div className="flex justify-between text-[10px] text-[#E8D6C4]/80 mb-1">
                        <span>Milestone Progress</span>
                        <span className="font-bold text-[#E3A354]">{doneTasks}/{totalTasks} tasks ({progressPct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D97D29] to-[#E3A354] rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-white/60 mb-2.5">
                      <span>{project.difficulty}</span>
                      <span>{project.milestones.length} Phases</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveProject(project);
                        setActiveModalTab("milestones");
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#D97D29] hover:bg-[#b8631b] active:scale-95 text-white text-xs font-semibold shadow-md shadow-[#D97D29]/25 transition"
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      <span>View Build Plan</span>
                    </button>

                    <button
                      onClick={() => handleExportMarkdown(project)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
                      title="Export Build Plan as Markdown"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DETAILED BUILD PLAN MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/20 bg-[#1D1612]/95 text-white shadow-2xl overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#D97D29]/20 border border-[#D97D29]/30 flex items-center justify-center text-[#E3A354]">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#D97D29]/20 border border-[#D97D29]/30 px-2 py-0.5 text-[9px] font-bold text-[#E3A354]">
                        {activeProject.branch}
                      </span>
                      <span className="text-[11px] text-white/60">
                        {activeProject.difficulty} · ~{activeProject.estimatedHours} hours
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                      {activeProject.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportMarkdown(activeProject)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition"
                    title="Export as Markdown"
                  >
                    <Download className="h-3.5 w-3.5 text-[#E3A354]" />
                    <span className="hidden sm:inline">Export Plan</span>
                  </button>

                  <button
                    onClick={() => setActiveProject(null)}
                    className="rounded-xl p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-black/20 overflow-x-auto no-scrollbar">
                {[
                  { id: "milestones", label: "Build Plan & Tasks", icon: CheckCircle2 },
                  { id: "code", label: "Starter Boilerplate Code", icon: Code2 },
                  { id: "resources", label: "Datasets & Tools", icon: ExternalLink },
                  { id: "resume", label: "Resume Bullet Points (STAR)", icon: Award },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id as typeof activeModalTab)}
                    className={cn(
                      "flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold transition border-b-2 whitespace-nowrap",
                      activeModalTab === tab.id
                        ? "border-[#E3A354] text-[#E3A354]"
                        : "border-transparent text-white/60 hover:text-white"
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Modal Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* TAB 1: MILESTONES & TASKS */}
                {activeModalTab === "milestones" && (
                  <div className="space-y-6">
                    {/* Project Overview Banner */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-xs font-bold text-[#E3A354] uppercase tracking-wider mb-1">
                        Executive Overview & Architecture
                      </h4>
                      <p className="text-xs sm:text-sm text-[#E8D6C4]/90 leading-relaxed">
                        {activeProject.overview}
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-white/50 block text-[10px] uppercase font-bold">
                            Architecture Pipeline
                          </span>
                          <span className="text-white font-mono text-[11px]">
                            {activeProject.architecture}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50 block text-[10px] uppercase font-bold">
                            Real-World Impact
                          </span>
                          <span className="text-[#E8D6C4] text-[11px]">
                            {activeProject.realWorldImpact}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Phases */}
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Phase-by-Phase Execution Plan</span>
                        <span className="text-[#E3A354] text-[11px] font-normal">
                          Click checkboxes to track your build progress
                        </span>
                      </h3>

                      <div className="space-y-4">
                        {activeProject.milestones.map((milestone, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-4 rounded-2xl bg-black/40 border border-white/10"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="rounded-md bg-[#D97D29]/30 border border-[#E3A354]/40 px-2 py-0.5 text-[10px] font-bold text-[#E3A354]">
                                {milestone.phase}
                              </span>
                              <h4 className="text-sm font-bold text-white">
                                {milestone.title}
                              </h4>
                            </div>
                            <p className="text-xs text-[#E8D6C4]/80 mt-1 mb-3">
                              {milestone.description}
                            </p>

                            {/* Task Checkboxes */}
                            <div className="space-y-2">
                              {milestone.tasks.map((task, tIdx) => {
                                const taskId = `${activeProject.id}-${mIdx}-${tIdx}`;
                                const isChecked = !!completedTasks[taskId];

                                return (
                                  <label
                                    key={tIdx}
                                    className={cn(
                                      "flex items-start gap-2.5 p-2 rounded-xl transition cursor-pointer text-xs",
                                      isChecked
                                        ? "bg-emerald-500/10 text-emerald-300 line-through opacity-75"
                                        : "hover:bg-white/5 text-white"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleTask(taskId)}
                                      className="mt-0.5 h-3.5 w-3.5 rounded border-white/30 text-[#D97D29] focus:ring-0 cursor-pointer"
                                    />
                                    <span className="leading-snug">{task}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: STARTER CODE */}
                {activeModalTab === "code" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-[#E3A354]" />
                        <span className="font-mono text-xs font-semibold text-white">
                          {activeProject.starterCode.filename}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/60">
                          {activeProject.starterCode.language}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(activeProject.starterCode.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
                      >
                        {codeCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{codeCopied ? "Copied!" : "Copy Code"}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-black/70 border border-white/10 font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed shadow-inner max-h-[500px]">
                      <code>{activeProject.starterCode.code}</code>
                    </pre>
                  </div>
                )}

                {/* TAB 3: DATASETS & TOOLS */}
                {activeModalTab === "resources" && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#E8D6C4]/80">
                      Recommended free datasets, APIs, and official engineering documentation for this project:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeProject.recommendedResources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E3A354]/40 hover:bg-white/10 transition group"
                        >
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#E3A354]">
                              {res.type}
                            </span>
                            <h4 className="text-sm font-semibold text-white group-hover:text-[#E3A354] transition mt-0.5">
                              {res.name}
                            </h4>
                            <span className="text-[11px] text-white/50 truncate block max-w-xs mt-1">
                              {res.url}
                            </span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white transition shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: RESUME BULLETS */}
                {activeModalTab === "resume" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#D97D29]/15 border border-[#D97D29]/30">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#E3A354]">
                        <Award className="h-4 w-4" />
                        <span>Ready-to-Use STAR Format Resume Points</span>
                      </div>
                      <p className="text-xs text-[#E8D6C4] mt-1">
                        Copy these high-impact action-driven bullet points directly into the Projects section of your resume or LinkedIn profile:
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeProject.resumeBulletPoints.map((bullet, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/90 leading-relaxed group"
                        >
                          <span className="h-5 w-5 rounded-full bg-[#E3A354]/20 text-[#E3A354] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="flex-1">{bullet}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(bullet);
                              toast.success("Resume bullet copied!");
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/40 group-hover:text-white transition shrink-0"
                            title="Copy bullet"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-black/40">
                <button
                  onClick={() => toggleSaveProject(activeProject.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <Bookmark
                    className={cn(
                      "h-3.5 w-3.5",
                      savedProjectIds[activeProject.id] && "fill-[#E3A354] text-[#E3A354]"
                    )}
                  />
                  <span>
                    {savedProjectIds[activeProject.id] ? "Saved in My Projects" : "Save to My Projects"}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openBot();
                      setActiveProject(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
                  >
                    <Bot className="h-3.5 w-3.5 text-[#E3A354]" />
                    <span>Ask StudyBot AI</span>
                  </button>

                  <button
                    onClick={() => setActiveProject(null)}
                    className="px-5 py-2 rounded-xl bg-[#D97D29] hover:bg-[#b8631b] text-white text-xs font-semibold shadow-md transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. AI CUSTOM PROJECT GENERATOR MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#1D1612]/95 text-white shadow-2xl overflow-hidden font-poppins"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-[#D97D29]/20 border border-[#D97D29]/30 flex items-center justify-center text-[#E3A354]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">AI Project Architect</h2>
                    <p className="text-[11px] text-[#E8D6C4]/80">
                      Tailors a mini-project based on your branch and skills
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="rounded-xl p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateCustomProject} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                      Engineering Branch
                    </label>
                    <select
                      value={aiBranch}
                      onChange={(e) => setAiBranch(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354]"
                    >
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Computer Science & IT">Computer Science & IT</option>
                      <option value="Electronics & ENTC">Electronics & ENTC</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                      Academic Year
                    </label>
                    <select
                      value={aiYear}
                      onChange={(e) => setAiYear(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354]"
                    >
                      <option value="First Year (FE)">First Year (FE)</option>
                      <option value="Second Year (SE)">Second Year (SE)</option>
                      <option value="Third Year (TE)">Third Year (TE)</option>
                      <option value="Final Year (BE)">Final Year (BE)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                    Skills You Know / Want to Use
                  </label>
                  <input
                    type="text"
                    value={aiSkills}
                    onChange={(e) => setAiSkills(e.target.value)}
                    placeholder="e.g. Python, Pandas, Scikit-Learn, Streamlit"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                    Specific Interest or Topic (Optional)
                  </label>
                  <input
                    type="text"
                    value={aiPromptTopic}
                    onChange={(e) => setAiPromptTopic(e.target.value)}
                    placeholder="e.g. Stock price prediction, Campus food waste, Health diagnostics"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D97D29] to-[#E3A354] text-white font-semibold text-xs shadow-lg shadow-[#D97D29]/30 transition active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isGenerating ? "Synthesizing Build Plan..." : "Generate Project Blueprint"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
