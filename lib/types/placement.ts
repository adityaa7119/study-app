// lib/types/placement.ts

export type CompanyTier = "Product / FAANG" | "Fintech & Banking" | "Core Engineering" | "IT & Consulting";

export interface CompanyPlacementProfile {
  id: string;
  name: string;
  logoText: string;
  badgeColor: string;
  tier: CompanyTier;
  role: string;
  ctcPackage: string; // e.g. "₹24 - 45 LPA"
  cgpaCutoff: number; // e.g. 7.5
  eligibleBranches: string[];
  rounds: {
    roundNumber: number;
    title: string;
    description: string;
    focusAreas: string[];
  }[];
  keySkills: string[];
  selectionRate: string; // e.g. "3.8%"
  interviewTips: string[];
}

export type QuestionTopic = "DSA" | "DBMS" | "Operating Systems" | "Computer Networks" | "System Design" | "Aptitude & Puzzles";

export interface InterviewQuestion {
  id: string;
  title: string;
  company: string;
  topic: QuestionTopic;
  difficulty: "Easy" | "Medium" | "Hard";
  frequency: "High" | "Very High" | "Medium";
  question: string;
  solutionSummary: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  keyTakeaway: string;
}

export type ApplicationStage = "Applied" | "OA Round" | "Technical Interview" | "HR / Final" | "Offered" | "Rejected";

export interface CampusApplication {
  id: string;
  companyName: string;
  role: string;
  ctc: string;
  stage: ApplicationStage;
  dateApplied: string;
  nextRoundDate?: string;
  notes?: string;
}

export interface AtsCheckAnalysis {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "Needs Polish";
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  suggestedActionVerbs: string[];
}
