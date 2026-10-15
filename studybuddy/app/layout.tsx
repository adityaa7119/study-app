// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/components/providers/ThemeInitializer";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "StudyBuddy — Your AI-Powered Study Companion",
  description:
    "Master your exams with smart scheduling, focus sessions, AI tutoring, and gamified quizzes. Built for JEE, NEET, and competitive exam aspirants.",
  keywords: ["study", "JEE", "NEET", "quiz", "pomodoro", "AI tutor", "timetable"],
  openGraph: {
    title: "StudyBuddy",
    description: "Your AI-Powered Study Companion for Exam Success",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
