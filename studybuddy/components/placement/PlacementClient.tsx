// components/placement/PlacementClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Bot,
  FileText,
  TrendingUp,
  Award,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  Info,
  Calendar,
  DollarSign,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { COMPANY_PROFILES, INTERVIEW_QUESTIONS, ATS_ROLE_KEYWORDS } from "@/lib/data/placementData";
import type {
  CompanyPlacementProfile,
  CompanyTier,
  InterviewQuestion,
  QuestionTopic,
  CampusApplication,
  ApplicationStage,
  AtsCheckAnalysis,
} from "@/lib/types/placement";

const COMPANY_TIERS: (CompanyTier | "All Tiers")[] = [
  "All Tiers",
  "Product / FAANG",
  "Fintech & Banking",
  "Core Engineering",
  "IT & Consulting",
];

const QUESTION_TOPICS: (QuestionTopic | "All Topics")[] = [
  "All Topics",
  "DSA",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "System Design",
  "Aptitude & Puzzles",
];

const APPLICATION_STAGES: ApplicationStage[] = [
  "Applied",
  "OA Round",
  "Technical Interview",
  "HR / Final",
  "Offered",
  "Rejected",
];

const INITIAL_APPLICATIONS: CampusApplication[] = [
  {
    id: "app-1",
    companyName: "Google",
    role: "Software Engineer (L3)",
    ctc: "₹42 LPA",
    stage: "OA Round",
    dateApplied: "2026-10-12",
    nextRoundDate: "2026-10-24",
    notes: "Review Graph cycle detection & Dijkstra on HackerEarth.",
  },
  {
    id: "app-2",
    companyName: "Barclays",
    role: "Graduate Technology Analyst",
    ctc: "₹16 LPA",
    stage: "Technical Interview",
    dateApplied: "2026-10-05",
    nextRoundDate: "2026-10-20",
    notes: "Prepare SQL transaction isolation levels & Spring Boot microservices.",
  },
  {
    id: "app-3",
    companyName: "TCS Digital",
    role: "Digital Specialist Engineer",
    ctc: "₹9.5 LPA",
    stage: "Offered",
    dateApplied: "2026-09-28",
    notes: "Offer letter received. Acceptance deadline Nov 15th.",
  },
];

const SAMPLE_RESUME_TEXT = `Aspiring Software Engineer with a solid background in Computer Science and Data Structures.
Proficient in C++, Python, TypeScript, and SQL. Built scalable web applications using React, Next.js, and Node.js.
Developed a high-throughput URL shortening service using Redis and PostgreSQL with Docker containerization.
Implemented robust unit testing and CI/CD pipelines on GitHub Actions.
Strong grasp of Operating Systems, multithreading, and RESTful API development.`;

export default function PlacementClient() {
  const { openBot } = useAppStore();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"companies" | "questions" | "ats" | "tracker">("companies");

  // Companies Filter State
  const [companyTier, setCompanyTier] = useState<CompanyTier | "All Tiers">("All Tiers");
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(6.0);
  const [companySearch, setCompanySearch] = useState<string>("");
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<CompanyPlacementProfile | null>(null);

  // Questions Filter State
  const [questionTopic, setQuestionTopic] = useState<QuestionTopic | "All Topics">("All Topics");
  const [questionSearch, setQuestionSearch] = useState<string>("");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>("dsa-1");
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<string[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // ATS Scanner State
  const [atsRoleKey, setAtsRoleKey] = useState<string>("swe");
  const [resumeInput, setResumeInput] = useState<string>("");
  const [atsAnalysis, setAtsAnalysis] = useState<AtsCheckAnalysis | null>(null);

  // Application Tracker State
  const [applications, setApplications] = useState<CampusApplication[]>(INITIAL_APPLICATIONS);
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);
  const [newAppForm, setNewAppForm] = useState<Partial<CampusApplication>>({
    companyName: "",
    role: "Software Engineer",
    ctc: "₹12 LPA",
    stage: "Applied",
    dateApplied: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    try {
      const savedSolved = localStorage.getItem("studybuddy_solved_questions");
      if (savedSolved) {
        setSolvedQuestionIds(JSON.parse(savedSolved));
      }
      const savedApps = localStorage.getItem("studybuddy_campus_applications");
      if (savedApps) {
        setApplications(JSON.parse(savedApps));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save applications to LocalStorage
  const persistApplications = (updated: CampusApplication[]) => {
    setApplications(updated);
    try {
      localStorage.setItem("studybuddy_campus_applications", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  // Toggle solved question
  const toggleSolved = (qId: string) => {
    setSolvedQuestionIds((prev) => {
      const next = prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId];
      try {
        localStorage.setItem("studybuddy_solved_questions", JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return COMPANY_PROFILES.filter((c) => {
      const matchesTier = companyTier === "All Tiers" || c.tier === companyTier;
      const matchesCgpa = c.cgpaCutoff >= minCgpaFilter;
      const matchesSearch =
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.role.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.eligibleBranches.some((b) => b.toLowerCase().includes(companySearch.toLowerCase()));
      return matchesTier && matchesCgpa && matchesSearch;
    });
  }, [companyTier, minCgpaFilter, companySearch]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return INTERVIEW_QUESTIONS.filter((q) => {
      const matchesTopic = questionTopic === "All Topics" || q.topic === questionTopic;
      const matchesSearch =
        q.title.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.company.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.question.toLowerCase().includes(questionSearch.toLowerCase());
      return matchesTopic && matchesSearch;
    });
  }, [questionTopic, questionSearch]);

  // Handle ATS Resume Scan
  const handleScanResume = () => {
    if (!resumeInput.trim()) {
      toast.error("Please paste your resume text or click 'Load Sample Resume'");
      return;
    }

    const targetConfig = ATS_ROLE_KEYWORDS[atsRoleKey] || ATS_ROLE_KEYWORDS.swe;
    const lowerText = resumeInput.toLowerCase();

    // Check Must Haves
    const matchedMustHaves = targetConfig.mustHave.filter((kw) =>
      lowerText.includes(kw.toLowerCase())
    );
    const missingMustHaves = targetConfig.mustHave.filter(
      (kw) => !lowerText.includes(kw.toLowerCase())
    );

    // Check Good to Haves
    const matchedGoodToHaves = targetConfig.goodToHave.filter((kw) =>
      lowerText.includes(kw.toLowerCase())
    );

    // Check Action Verbs
    const matchedVerbs = targetConfig.actionVerbs.filter((v) =>
      lowerText.includes(v.toLowerCase())
    );

    // Scoring formula: Must-haves 60%, Good-to-haves 25%, Action Verbs 15%
    const mustHaveScore = (matchedMustHaves.length / targetConfig.mustHave.length) * 60;
    const goodToHaveScore = (matchedGoodToHaves.length / targetConfig.goodToHave.length) * 25;
    const verbScore = Math.min(15, (matchedVerbs.length / 3) * 15);

    const totalScore = Math.min(100, Math.round(mustHaveScore + goodToHaveScore + verbScore));

    let grade: AtsCheckAnalysis["grade"] = "Needs Polish";
    if (totalScore >= 88) grade = "A+";
    else if (totalScore >= 75) grade = "A";
    else if (totalScore >= 60) grade = "B";
    else if (totalScore >= 45) grade = "C";

    const strengths: string[] = [];
    if (matchedMustHaves.length >= 6) strengths.push(`Strong core alignment: matched ${matchedMustHaves.length} essential tech skills.`);
    if (matchedVerbs.length >= 2) strengths.push(`Impactful wording: used high-yield STAR action verbs like "${matchedVerbs.slice(0, 2).join('", "')}".`);
    if (matchedGoodToHaves.length >= 3) strengths.push(`Modern stack bonus: includes high-demand tools like ${matchedGoodToHaves.slice(0, 3).join(", ")}.`);

    const improvements: string[] = [];
    if (missingMustHaves.length > 0) {
      improvements.push(`Missing critical ATS filter keywords: ${missingMustHaves.slice(0, 4).join(", ")}.`);
    }
    if (matchedVerbs.length < 2) {
      improvements.push("Incorporate quantifiable impact verbs (e.g. 'Reduced latency by 35%', 'Automated CI/CD pipeline').");
    }
    if (resumeInput.split(/\s+/).length < 50) {
      improvements.push("Resume excerpt is quite brief; expand on specific metrics, system architectures, and testing methodologies.");
    }

    setAtsAnalysis({
      score: totalScore,
      grade,
      matchedKeywords: [...matchedMustHaves, ...matchedGoodToHaves],
      missingKeywords: missingMustHaves,
      strengths: strengths.length ? strengths : ["Clean formatting and legible technical phrasing."],
      improvements: improvements.length ? improvements : ["Great resume! Ensure dates and company names are in reverse chronological order."],
      suggestedActionVerbs: targetConfig.actionVerbs,
    });

    toast.success(`Resume Analysis Complete: ${totalScore}/100 (${grade})`);
  };

  // Add Campus Application
  const handleAddApplication = () => {
    if (!newAppForm.companyName?.trim()) {
      toast.error("Please enter the company name");
      return;
    }
    const newApp: CampusApplication = {
      id: "app-" + Date.now(),
      companyName: newAppForm.companyName.trim(),
      role: newAppForm.role || "Software Engineer",
      ctc: newAppForm.ctc || "₹10 LPA",
      stage: newAppForm.stage || "Applied",
      dateApplied: newAppForm.dateApplied || new Date().toISOString().split("T")[0],
      nextRoundDate: newAppForm.nextRoundDate,
      notes: newAppForm.notes,
    };
    persistApplications([newApp, ...applications]);
    setShowAddAppModal(false);
    setNewAppForm({
      companyName: "",
      role: "Software Engineer",
      ctc: "₹12 LPA",
      stage: "Applied",
      dateApplied: new Date().toISOString().split("T")[0],
      notes: "",
    });
    toast.success(`Added application for ${newApp.companyName}`);
  };

  const handleUpdateAppStage = (id: string, stage: ApplicationStage) => {
    const updated = applications.map((a) => (a.id === id ? { ...a, stage } : a));
    persistApplications(updated);
    toast.info(`Updated status to ${stage}`);
  };

  const handleDeleteApp = (id: string) => {
    const updated = applications.filter((a) => a.id !== id);
    persistApplications(updated);
    toast.info("Application removed from tracker");
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#EAD9C9] bg-gradient-to-br from-[#FFFDF9] via-[#FAF4ED] to-[#F3E7D7] p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D97D29]/30 bg-[#D97D29]/10 text-xs font-semibold text-[#D97D29]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Campus Recruitment & Career Acceleration</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2C1810] tracking-tight">
              Placement & Career Hub
            </h1>
            <p className="text-sm md:text-base text-[#6B5A4D] leading-relaxed">
              Target top-tier recruiters, master company-specific hiring rounds, analyze your resume against ATS filters, and practice verified technical OA archives.
            </p>
          </div>

          {/* Quick AI Mock Interview Launcher */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openBot()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D97D29] to-[#C26B1E] text-white font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Bot className="w-4 h-4" />
              <span>AI Mock Interview</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("ats");
                if (!resumeInput) setResumeInput(SAMPLE_RESUME_TEXT);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-[#D97D29]/30 bg-white/80 hover:bg-white text-[#2C1810] font-medium text-sm transition-all"
            >
              <FileText className="w-4 h-4 text-[#D97D29]" />
              <span>Instant ATS Scan</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#D97D29]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-[#EAD9C9] overflow-x-auto gap-2 py-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("companies")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "companies"
              ? "bg-[#2C1810] text-[#FDF8F2] shadow-sm"
              : "text-[#6B5A4D] hover:text-[#2C1810] hover:bg-[#FAF4ED]"
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profiles & Cutoffs</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[#D97D29]/20 text-[#D97D29]">
            {COMPANY_PROFILES.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "questions"
              ? "bg-[#2C1810] text-[#FDF8F2] shadow-sm"
              : "text-[#6B5A4D] hover:text-[#2C1810] hover:bg-[#FAF4ED]"
          )}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Technical OA Archive</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[#D97D29]/20 text-[#D97D29]">
            {solvedQuestionIds.length}/{INTERVIEW_QUESTIONS.length} Solved
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ats")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "ats"
              ? "bg-[#2C1810] text-[#FDF8F2] shadow-sm"
              : "text-[#6B5A4D] hover:text-[#2C1810] hover:bg-[#FAF4ED]"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>ATS Resume Checker</span>
        </button>

        <button
          onClick={() => setActiveTab("tracker")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "tracker"
              ? "bg-[#2C1810] text-[#FDF8F2] shadow-sm"
              : "text-[#6B5A4D] hover:text-[#2C1810] hover:bg-[#FAF4ED]"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Application Pipeline</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
            {applications.length} Active
          </span>
        </button>
      </div>

      {/* TAB 1: COMPANY PROFILES & CUTOFFS */}
      {activeTab === "companies" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-white/70 p-4 rounded-2xl border border-[#EAD9C9]">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89A8A]" />
              <input
                type="text"
                placeholder="Search company, role, or branch (e.g. Google, SDE, CSE)..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD9C9] bg-white text-sm text-[#2C1810] placeholder:text-[#A89A8A] focus:outline-none focus:border-[#D97D29]"
              />
            </div>

            {/* Tier Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {COMPANY_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setCompanyTier(tier)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                    companyTier === tier
                      ? "bg-[#D97D29] text-white shadow-sm"
                      : "bg-[#FAF4ED] text-[#6B5A4D] border border-[#EAD9C9] hover:bg-[#F3E7D7]"
                  )}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Min CGPA Slider */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#FAF4ED] border border-[#EAD9C9]">
              <span className="text-xs font-medium text-[#6B5A4D] whitespace-nowrap">
                Min CGPA: <strong className="text-[#2C1810]">{minCgpaFilter.toFixed(1)}</strong>
              </span>
              <input
                type="range"
                min="6.0"
                max="9.0"
                step="0.5"
                value={minCgpaFilter}
                onChange={(e) => setMinCgpaFilter(parseFloat(e.target.value))}
                className="w-20 accent-[#D97D29] cursor-pointer"
              />
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((comp) => (
              <motion.div
                key={comp.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#EAD9C9] bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#D97D29]/50"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C1810] to-[#51352A] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {comp.logoText}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#2C1810] group-hover:text-[#D97D29] transition-colors">
                          {comp.name}
                        </h3>
                        <span className="text-xs font-medium text-[#8A7968]">{comp.tier}</span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                        comp.badgeColor
                      )}
                    >
                      {comp.ctcPackage}
                    </span>
                  </div>

                  {/* Role Title */}
                  <div className="pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#A89A8A]">
                      Target Role
                    </p>
                    <p className="text-sm font-semibold text-[#2C1810]">{comp.role}</p>
                  </div>

                  {/* Eligibility & Cutoff Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-[#FAF4ED] border border-[#EAD9C9]/60">
                      <p className="text-[11px] text-[#8A7968]">Min CGPA Cutoff</p>
                      <p className="text-sm font-bold text-[#2C1810]">{comp.cgpaCutoff} / 10.0</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF4ED] border border-[#EAD9C9]/60">
                      <p className="text-[11px] text-[#8A7968]">Hiring Rounds</p>
                      <p className="text-sm font-bold text-[#2C1810]">{comp.rounds.length} Rounds</p>
                    </div>
                  </div>

                  {/* Eligible Branches */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-[#8A7968]">Eligible Branches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.eligibleBranches.map((br) => (
                        <span
                          key={br}
                          className="px-2 py-0.5 rounded-lg bg-[#FAF4ED] text-[11px] font-medium text-[#6B5A4D] border border-[#EAD9C9]/60"
                        >
                          {br}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Skills */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-medium text-[#8A7968]">Core Evaluation Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.keySkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-lg bg-[#D97D29]/10 text-[11px] font-semibold text-[#D97D29]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-[#EAD9C9]/80 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCompanyModal(comp)}
                    className="flex-1 py-2.5 rounded-xl bg-[#FAF4ED] hover:bg-[#F3E7D7] text-[#2C1810] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Rounds & Tips</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openBot()}
                    title="Mock Interview with AI"
                    className="p-2.5 rounded-xl border border-[#EAD9C9] hover:border-[#D97D29] hover:bg-[#FAF4ED] text-[#D97D29] transition-all"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-[#EAD9C9] bg-white space-y-3">
              <Building2 className="w-12 h-12 mx-auto text-[#A89A8A]" />
              <h3 className="font-serif font-bold text-lg text-[#2C1810]">No companies found</h3>
              <p className="text-sm text-[#6B5A4D]">
                Try adjusting your search criteria or lowering the CGPA cutoff slider.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TECHNICAL OA & INTERVIEW ARCHIVE */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-white/70 p-4 rounded-2xl border border-[#EAD9C9]">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89A8A]" />
              <input
                type="text"
                placeholder="Search questions, companies, or concepts (e.g. Trapping Rain Water, ACID, 25 Horses)..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD9C9] bg-white text-sm text-[#2C1810] placeholder:text-[#A89A8A] focus:outline-none focus:border-[#D97D29]"
              />
            </div>

            {/* Topic Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {QUESTION_TOPICS.map((top) => (
                <button
                  key={top}
                  onClick={() => setQuestionTopic(top)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                    questionTopic === top
                      ? "bg-[#D97D29] text-white shadow-sm"
                      : "bg-[#FAF4ED] text-[#6B5A4D] border border-[#EAD9C9] hover:bg-[#F3E7D7]"
                  )}
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* Solved Progress Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FAF4ED] to-[#F3E7D7] border border-[#EAD9C9]">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-[#D97D29]" />
              <div>
                <p className="text-sm font-bold text-[#2C1810]">
                  Your Preparation Progress: {solvedQuestionIds.length} of {INTERVIEW_QUESTIONS.length} Questions Solved
                </p>
                <p className="text-xs text-[#6B5A4D]">
                  Solve high-frequency campus recruitment interview questions to boost OA confidence.
                </p>
              </div>
            </div>
            <div className="w-36 h-3 rounded-full bg-[#EAD9C9] overflow-hidden">
              <div
                className="h-full bg-[#D97D29] transition-all duration-500 rounded-full"
                style={{
                  width: `${(solvedQuestionIds.length / INTERVIEW_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const isSolved = solvedQuestionIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-3xl border bg-white transition-all overflow-hidden",
                    isSolved ? "border-emerald-200 bg-emerald-50/20" : "border-[#EAD9C9]",
                    isExpanded && "shadow-md border-[#D97D29]/50"
                  )}
                >
                  {/* Question Header Bar */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF4ED]/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF4ED] text-[#D97D29] border border-[#EAD9C9]">
                          {q.topic}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-bold",
                            q.difficulty === "Easy" && "bg-emerald-100 text-emerald-800",
                            q.difficulty === "Medium" && "bg-amber-100 text-amber-800",
                            q.difficulty === "Hard" && "bg-red-100 text-red-800"
                          )}
                        >
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#2C1810]/5 text-[#6B5A4D]">
                          Asked in: <strong>{q.company}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          {q.frequency} Frequency
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#2C1810]">
                        {q.title}
                      </h3>
                      <p className="text-xs text-[#6B5A4D] line-clamp-2">{q.question}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolved(q.id);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all",
                          isSolved
                            ? "bg-emerald-600 text-white"
                            : "bg-[#FAF4ED] text-[#6B5A4D] border border-[#EAD9C9] hover:bg-emerald-50 hover:text-emerald-700"
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSolved ? "Solved" : "Mark as Solved"}</span>
                      </button>

                      <div className="p-2 rounded-xl text-[#A89A8A]">
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 transition-transform",
                            isExpanded && "rotate-180 text-[#D97D29]"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-[#EAD9C9] p-6 bg-[#FFFDF9] space-y-6"
                      >
                        {/* Full Problem Statement */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A89A8A]">
                            Full Problem Statement
                          </h4>
                          <p className="text-sm text-[#2C1810] leading-relaxed font-sans bg-white p-4 rounded-2xl border border-[#EAD9C9]">
                            {q.question}
                          </p>
                        </div>

                        {/* Approach & Explanation */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#D97D29]">
                            Optimal Solution & Approach
                          </h4>
                          <p className="text-sm text-[#4A3B32] leading-relaxed bg-[#FAF4ED] p-4 rounded-2xl border border-[#EAD9C9]">
                            {q.solutionSummary}
                          </p>
                        </div>

                        {/* Code Snippet if applicable */}
                        {q.codeSnippet && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#A89A8A]">
                                Reference Implementation ({q.codeSnippet.language.toUpperCase()})
                              </span>
                              <button
                                onClick={() => copyCode(q.id, q.codeSnippet!.code)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white border border-[#EAD9C9] hover:bg-[#FAF4ED] text-[#2C1810] transition-colors"
                              >
                                {copiedCodeId === q.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-[#8A7968]" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <pre className="p-4 rounded-2xl bg-[#1E140F] text-[#F3E7D7] font-mono text-xs overflow-x-auto leading-relaxed border border-[#3E271D]">
                              <code>{q.codeSnippet.code}</code>
                            </pre>
                          </div>
                        )}

                        {/* Key Takeaway & AI Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#D97D29]/5 border border-[#D97D29]/20">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[#D97D29]">
                              🎯 Interviewer Evaluation Takeaway
                            </p>
                            <p className="text-xs text-[#6B5A4D]">{q.keyTakeaway}</p>
                          </div>

                          <button
                            onClick={() => openBot()}
                            className="px-4 py-2 rounded-xl bg-[#2C1810] text-white text-xs font-bold hover:bg-[#402418] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Bot className="w-3.5 h-3.5 text-[#D97D29]" />
                            <span>Ask AI Tutor</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ATS RESUME SCANNER */}
      {activeTab === "ats" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-3xl border border-[#EAD9C9] bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#2C1810] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D97D29]" />
                    <span>Resume Keyword & ATS Validator</span>
                  </h3>
                  <button
                    onClick={() => {
                      setResumeInput(SAMPLE_RESUME_TEXT);
                      toast.info("Sample resume loaded!");
                    }}
                    className="text-xs font-semibold text-[#D97D29] hover:underline"
                  >
                    Load Sample Resume
                  </button>
                </div>

                {/* Target Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#6B5A4D]">
                    Select Target Campus Job Profile
                  </label>
                  <select
                    value={atsRoleKey}
                    onChange={(e) => setAtsRoleKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C9] bg-[#FAF4ED] text-sm text-[#2C1810] font-medium focus:outline-none focus:border-[#D97D29]"
                  >
                    {Object.entries(ATS_ROLE_KEYWORDS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.roleName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resume Text Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#6B5A4D]">
                    Paste Your Resume Summary, Projects, or Skills
                  </label>
                  <textarea
                    rows={8}
                    value={resumeInput}
                    onChange={(e) => setResumeInput(e.target.value)}
                    placeholder="Paste your technical resume text here (e.g. skills, STAR project bullet points, tools)..."
                    className="w-full p-4 rounded-2xl border border-[#EAD9C9] bg-[#FAF4ED]/50 text-sm text-[#2C1810] placeholder:text-[#A89A8A] focus:outline-none focus:border-[#D97D29] font-sans leading-relaxed"
                  />
                </div>

                {/* Submit Scanner */}
                <button
                  onClick={handleScanResume}
                  className="w-full py-3.5 rounded-2xl bg-[#D97D29] hover:bg-[#C26B1E] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Instant ATS Analysis</span>
                </button>
              </div>

              {/* Tips for Engineering Resumes */}
              <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-[#EAD9C9] space-y-2">
                <p className="text-xs font-bold text-[#2C1810] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#D97D29]" />
                  <span>Google & Tech Campus ATS Tip: The X-Y-Z Formula</span>
                </p>
                <p className="text-xs text-[#6B5A4D] leading-relaxed">
                  Format every project bullet as: <em>“Accomplished [X], as measured by [Y], by doing [Z]”</em>. E.g.: &quot;Reduced API response time by 42% (Y) on 5,000 req/sec endpoints (X) by implementing Redis caching and indexing PostgreSQL tables (Z)&quot;.
                </p>
              </div>
            </div>

            {/* Results / Feedback Panel */}
            <div className="lg:col-span-5 space-y-6">
              {atsAnalysis ? (
                <div className="rounded-3xl border border-[#EAD9C9] bg-white p-6 shadow-sm space-y-6">
                  {/* Score Gauge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-[#FAF4ED] to-[#F3E7D7] border border-[#EAD9C9]">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A89A8A]">
                        ATS Match Score
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-4xl font-extrabold text-[#2C1810]">
                          {atsAnalysis.score}
                        </span>
                        <span className="text-sm font-semibold text-[#8A7968]">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-xl font-bold text-sm",
                          atsAnalysis.grade === "A+" && "bg-emerald-100 text-emerald-800",
                          atsAnalysis.grade === "A" && "bg-emerald-50 text-emerald-700",
                          atsAnalysis.grade === "B" && "bg-blue-100 text-blue-800",
                          atsAnalysis.grade === "C" && "bg-amber-100 text-amber-800",
                          atsAnalysis.grade === "Needs Polish" && "bg-red-100 text-red-800"
                        )}
                      >
                        Grade: {atsAnalysis.grade}
                      </span>
                      <p className="text-[11px] text-[#8A7968] mt-1">Recruiter Readiness</p>
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Matched Keywords ({atsAnalysis.matchedKeywords.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsAnalysis.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing High-Priority Keywords */}
                  {atsAnalysis.missingKeywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#D97D29] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-[#D97D29]" />
                        <span>Recommended Keywords to Add ({atsAnalysis.missingKeywords.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {atsAnalysis.missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            onClick={() => {
                              navigator.clipboard.writeText(kw);
                              toast.info(`Copied "${kw}"`);
                            }}
                            title="Click to copy"
                            className="cursor-pointer px-2.5 py-1 rounded-lg bg-[#FAF4ED] text-[#D97D29] text-xs font-medium border border-[#EAD9C9] hover:bg-[#F3E7D7] transition-colors"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#2C1810]">🌟 What&apos;s Working Well</p>
                    <ul className="space-y-1 text-xs text-[#6B5A4D]">
                      {atsAnalysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Verbs Recommendations */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#2C1810]">🚀 High-Yield Action Verbs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsAnalysis.suggestedActionVerbs.map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 rounded-md bg-[#FAF4ED] text-[11px] font-mono text-[#6B5A4D] border border-[#EAD9C9]"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Rewrite Assistant */}
                  <button
                    onClick={() => openBot()}
                    className="w-full py-2.5 rounded-xl border border-[#D97D29] text-[#D97D29] hover:bg-[#D97D29]/10 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask AI to Polish My Resume Bullets</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center rounded-3xl border border-[#EAD9C9] bg-white space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-[#A89A8A]" />
                  <h4 className="font-serif font-bold text-base text-[#2C1810]">
                    Awaiting Resume Input
                  </h4>
                  <p className="text-xs text-[#6B5A4D]">
                    Paste your resume excerpt or bullet points on the left to get a real-time ATS keyword match score and recruiter recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPUS APPLICATION PIPELINE TRACKER */}
      {activeTab === "tracker" && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 p-4 rounded-2xl border border-[#EAD9C9]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C1810]">
                Campus Application Pipeline Tracker
              </h3>
              <p className="text-xs text-[#6B5A4D]">
                Track all on-campus and off-campus recruitment drives in one organized workspace.
              </p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C1810] text-[#FDF8F2] text-xs font-bold hover:bg-[#402418] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#D97D29]" />
              <span>Add New Application</span>
            </button>
          </div>

          {/* Applications Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-3xl border border-[#EAD9C9] bg-white p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#D97D29]/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#2C1810]">
                        {app.companyName}
                      </h4>
                      <p className="text-xs text-[#8A7968] font-medium">{app.role}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#D97D29]/10 text-[#D97D29]">
                      {app.ctc}
                    </span>
                  </div>

                  {/* Stage Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#8A7968]">Current Stage</label>
                    <select
                      value={app.stage}
                      onChange={(e) =>
                        handleUpdateAppStage(app.id, e.target.value as ApplicationStage)
                      }
                      className={cn(
                        "w-full px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors focus:outline-none",
                        app.stage === "Offered" && "bg-emerald-50 text-emerald-800 border-emerald-200",
                        app.stage === "Rejected" && "bg-red-50 text-red-800 border-red-200",
                        app.stage === "OA Round" && "bg-amber-50 text-amber-800 border-amber-200",
                        app.stage === "Technical Interview" && "bg-blue-50 text-blue-800 border-blue-200",
                        app.stage === "HR / Final" && "bg-purple-50 text-purple-800 border-purple-200",
                        app.stage === "Applied" && "bg-[#FAF4ED] text-[#6B5A4D] border-[#EAD9C9]"
                      )}
                    >
                      {APPLICATION_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-[#FAF4ED] border border-[#EAD9C9]/60">
                      <p className="text-[10px] text-[#8A7968]">Applied On</p>
                      <p className="font-semibold text-[#2C1810]">{app.dateApplied}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF4ED] border border-[#EAD9C9]/60">
                      <p className="text-[10px] text-[#8A7968]">Next Round</p>
                      <p className="font-semibold text-[#2C1810]">
                        {app.nextRoundDate || "TBD"}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="p-2.5 rounded-xl bg-[#FAF4ED]/60 border border-[#EAD9C9]/40 text-xs text-[#6B5A4D]">
                      <strong>Note:</strong> {app.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#EAD9C9]/60 flex items-center justify-between">
                  <button
                    onClick={() => openBot()}
                    className="text-xs font-semibold text-[#D97D29] hover:underline flex items-center gap-1"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Prep with AI</span>
                  </button>

                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-1.5 rounded-lg text-[#A89A8A] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {applications.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-[#EAD9C9] bg-white space-y-3">
              <Layers className="w-12 h-12 mx-auto text-[#A89A8A]" />
              <h4 className="font-serif font-bold text-lg text-[#2C1810]">
                No applications tracked yet
              </h4>
              <p className="text-sm text-[#6B5A4D]">
                Click &quot;Add New Application&quot; to begin tracking your campus recruitment rounds.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: COMPANY HIRING ROUNDS & TIPS */}
      <AnimatePresence>
        {selectedCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-[#EAD9C9] bg-[#FFFDF9] p-6 md:p-8 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C1810] to-[#51352A] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {selectedCompanyModal.logoText}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#2C1810]">
                      {selectedCompanyModal.name}
                    </h3>
                    <p className="text-xs text-[#8A7968]">
                      {selectedCompanyModal.role} • {selectedCompanyModal.ctcPackage}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCompanyModal(null)}
                  className="p-2 rounded-xl text-[#A89A8A] hover:text-[#2C1810] hover:bg-[#FAF4ED] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Rounds Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D97D29]">
                  Step-by-Step Hiring Rounds
                </h4>
                <div className="space-y-3">
                  {selectedCompanyModal.rounds.map((rd) => (
                    <div
                      key={rd.roundNumber}
                      className="p-4 rounded-2xl bg-white border border-[#EAD9C9] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#D97D29]">
                          Round {rd.roundNumber}: {rd.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5A4D]">{rd.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rd.focusAreas.map((fa) => (
                          <span
                            key={fa}
                            className="px-2 py-0.5 rounded-md bg-[#FAF4ED] text-[11px] font-medium text-[#2C1810] border border-[#EAD9C9]/60"
                          >
                            {fa}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insider Tips */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2C1810]">
                  💡 Proven Candidate Tips
                </h4>
                <div className="space-y-2">
                  {selectedCompanyModal.interviewTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF4ED] border border-[#EAD9C9] text-xs text-[#4A3B32] flex items-start gap-2"
                    >
                      <span className="text-[#D97D29] font-bold">★</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAD9C9]">
                <button
                  onClick={() => setSelectedCompanyModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EAD9C9] bg-white text-[#6B5A4D] text-xs font-bold hover:bg-[#FAF4ED] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedCompanyModal(null);
                    openBot();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#D97D29] text-white text-xs font-bold hover:bg-[#C26B1E] transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start AI Mock Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD NEW CAMPUS APPLICATION */}
      <AnimatePresence>
        {showAddAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#EAD9C9] bg-[#FFFDF9] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                  Track Campus Application
                </h3>
                <button
                  onClick={() => setShowAddAppModal(false)}
                  className="p-1.5 rounded-lg text-[#A89A8A] hover:text-[#2C1810]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#6B5A4D]">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Microsoft, Qualcomm, TCS"
                    value={newAppForm.companyName || ""}
                    onChange={(e) =>
                      setNewAppForm({ ...newAppForm, companyName: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[#EAD9C9] bg-white text-sm focus:outline-none focus:border-[#D97D29]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#6B5A4D]">Role Offered</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer (SDE-1)"
                    value={newAppForm.role || ""}
                    onChange={(e) => setNewAppForm({ ...newAppForm, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[#EAD9C9] bg-white text-sm focus:outline-none focus:border-[#D97D29]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-[#6B5A4D]">Package (CTC)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹18 LPA"
                      value={newAppForm.ctc || ""}
                      onChange={(e) => setNewAppForm({ ...newAppForm, ctc: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-[#EAD9C9] bg-white text-sm focus:outline-none focus:border-[#D97D29]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#6B5A4D]">Current Stage</label>
                    <select
                      value={newAppForm.stage || "Applied"}
                      onChange={(e) =>
                        setNewAppForm({
                          ...newAppForm,
                          stage: e.target.value as ApplicationStage,
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-[#EAD9C9] bg-white text-sm focus:outline-none focus:border-[#D97D29]"
                    >
                      {APPLICATION_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#6B5A4D]">Next Round Date (Optional)</label>
                  <input
                    type="date"
                    value={newAppForm.nextRoundDate || ""}
                    onChange={(e) =>
                      setNewAppForm({ ...newAppForm, nextRoundDate: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[#EAD9C9] bg-white text-sm focus:outline-none focus:border-[#D97D29]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#6B5A4D]">Notes or Prep Strategy</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Focus on DBMS B-Trees and Low-Level Design..."
                    value={newAppForm.notes || ""}
                    onChange={(e) => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[#EAD9C9] bg-white text-sm focus:outline-none focus:border-[#D97D29]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAD9C9]">
                <button
                  onClick={() => setShowAddAppModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B5A4D] hover:bg-[#FAF4ED]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApplication}
                  className="px-5 py-2 rounded-xl bg-[#2C1810] text-[#FDF8F2] text-xs font-bold hover:bg-[#402418] transition-colors"
                >
                  Save Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
