// lib/types/shorts.ts

export type ShortSubject =
  | "All"
  | "Physics"
  | "Mathematics"
  | "Computer Science"
  | "Chemistry"
  | "Biology & Medical"
  | "Study Hacks";

export interface ShortCreator {
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  subscribers?: string;
}

export interface QuickQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rewardCredits: number;
}

export interface ShortComment {
  id: string;
  user: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
}

export interface EducationalShort {
  id: string;
  title: string;
  subject: "Physics" | "Mathematics" | "Computer Science" | "Chemistry" | "Biology & Medical" | "Study Hacks";
  creator: ShortCreator;
  summary: string;
  formula: string | null;
  conceptExplanation: string;
  videoUrl?: string;
  youtubeId: string;
  isCustom?: boolean;
  interactiveType?:
    | "magnetic-induction"
    | "relu-gradient"
    | "pythagoras-flow"
    | "bernoulli-flow"
    | "dijkstra-graph"
    | "feynman-technique"
    | "eigen-transform"
    | "chemical-equilibrium";
  duration: string;
  likes: number;
  views: string;
  saves: number;
  tags: string[];
  quickQuiz: QuickQuiz;
  comments: ShortComment[];
}

/**
 * Helper to extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
