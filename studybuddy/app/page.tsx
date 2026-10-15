// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Brain, Zap, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthForm from "@/components/auth/AuthForm";

const features = [
  {
    icon: Brain,
    title: "AI Concept Tutor",
    description: "StudyBot powered by Gemini AI explains anything instantly",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    icon: Zap,
    title: "Focus Shield",
    description: "Deep work sessions with Pomodoro timer and distraction blocking",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    icon: Trophy,
    title: "Quiz Arena",
    description: "Daily quizzes, weekly mocks, and peer duels with credit wagers",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    icon: BookOpen,
    title: "Smart Library",
    description: "Searchable formula cards and markdown revision notes",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
            AI-Powered Study Platform
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Study
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Buddy
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Your all-in-one companion for JEE, NEET and competitive exam prep. Smart scheduling,
            AI tutoring, focus sessions and gamified quizzes — all in one place.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 backdrop-blur-sm"
              >
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{feature.description}</p>
              </motion.div>
            ))}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="col-span-2 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-5"
            >
              <div className="flex items-center justify-around text-center">
                {[
                  { val: "25k+", label: "Students" },
                  { val: "1M+", label: "Questions" },
                  { val: "95%", label: "Success Rate" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-indigo-400">{s.val}</div>
                    <div className="text-xs text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AuthForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
