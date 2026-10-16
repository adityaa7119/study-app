// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const SUBJECT_COLORS: Record<string, string> = {
  Physics: "#6366f1",
  Chemistry: "#f59e0b",
  Mathematics: "#10b981",
  Biology: "#3b82f6",
  English: "#ec4899",
  History: "#8b5cf6",
  Other: "#6b7280",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getMondayOfCurrentWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDaysOfWeek(mondayDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getDaysUntilExam(examDate: string | null): number | null {
  if (!examDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const MOTIVATIONAL_QUOTES = [
  "Small steps, big results. ♡",
  "Today: Study. Practice. Be better. Keep going. ♡",
  "Good things take time. ♡",
  "You can do it. ♡",
  "Focus. Learn. Grow. ♡",
  "Better days ahead. :)",
  "Understand concepts, build cool projects, make your future self proud. ♡",
  "Success is the sum of small efforts repeated day in, day out.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Consistency beats intensity every single time.",
  "A little progress each day adds up to big rank-defining results.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your only limit is the courage you bring to the study desk today.",
  "Small daily focus sessions compound into massive breakthroughs.",
  "Stay patient and trust your preparation. Mastery takes deliberate practice.",
  "Every expert was once a beginner who refused to surrender.",
  "Difficult concepts today will become your easiest scoring areas tomorrow.",
  "The pain of discipline is far less than the pain of regret.",
  "Focus on depth over speed. Understanding beats memorization.",
];

export function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}
