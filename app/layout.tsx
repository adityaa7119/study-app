// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/components/providers/ThemeInitializer";
import { Toaster } from "@/components/ui/Toaster";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1C120C",
};

export const metadata: Metadata = {
  title: "StudyBuddy — Your AI-Powered Study Companion",
  description:
    "Master your engineering semesters with smart scheduling, focus sessions, AI tutoring, and gamified quizzes. Built for engineering students across First Year to Final Year.",
  keywords: ["study", "engineering", "semester exams", "FE", "SE", "TE", "BE", "quiz", "pomodoro", "AI tutor", "timetable"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyBuddy",
  },
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
      <body className="antialiased overflow-x-hidden">
        <ThemeInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
