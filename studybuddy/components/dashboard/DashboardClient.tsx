// components/dashboard/DashboardClient.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Clock, Flame, Coins, CalendarDays, Shield, Bot,
  Trophy, Calendar, TrendingUp, BookOpen, Zap, Play,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Profile, Schedule, QuizAttempt, FocusSession } from "@/lib/types/database";
import {
  formatDuration, getDaysUntilExam, getGreeting,
  getDaysOfWeek, getMondayOfCurrentWeek, SUBJECT_COLORS,
} from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import { useRouter } from "next/navigation";

interface Props {
  profile: Profile;
  schedules: Schedule[];
  quizAttempts: QuizAttempt[];
  recentSessions: FocusSession[];
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardClient({ profile, schedules, quizAttempts, recentSessions }: Props) {
  const router = useRouter();
  const { openBot, startFocus } = useAppStore();
  const daysUntilExam = getDaysUntilExam(profile.exam_date);

  // Today's focus total
  const todayMinutes = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return recentSessions
      .filter((s) => new Date(s.started_at) >= todayStart && s.completed)
      .reduce((sum, s) => sum + s.actual_minutes, 0);
  }, [recentSessions]);

  // 7-day chart data
  const chartData = useMemo(() => {
    const days = getDaysOfWeek(getMondayOfCurrentWeek());
    return days.map((d) => {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const mins = recentSessions
        .filter((s) => {
          const sd = new Date(s.started_at);
          return sd >= dayStart && sd <= dayEnd && s.completed;
        })
        .reduce((sum, s) => sum + s.actual_minutes, 0);
      return {
        day: d.toLocaleDateString("en", { weekday: "short" }),
        minutes: mins,
        hours: parseFloat((mins / 60).toFixed(1)),
      };
    });
  }, [recentSessions]);

  // Subject progress (based on completed schedules)
  const subjectProgress = useMemo(() => {
    const subjects: Record<string, { total: number; completed: number }> = {};
    schedules.forEach((s) => {
      if (!subjects[s.subject]) subjects[s.subject] = { total: 0, completed: 0 };
      subjects[s.subject].total++;
      if (s.is_completed) subjects[s.subject].completed++;
    });
    return Object.entries(subjects).map(([name, data]) => ({
      name,
      pct: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      color: SUBJECT_COLORS[name] ?? "#6366f1",
    }));
  }, [schedules]);

  // Today's schedule
  const todaySchedule = useMemo(() => {
    const today = new Date().getDay();
    const adjustedDay = today === 0 ? 6 : today - 1;
    return schedules
      .filter((s) => s.day_of_week === adjustedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedules]);

  const targetHoursReached = todayMinutes >= profile.daily_target_hours * 60;

  return (
    <motion.div
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={ITEM_VARIANTS}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {getGreeting()},{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            {profile.full_name.split(" ")[0]}
          </span>{" "}
          👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {targetHoursReached
            ? "You've hit your daily target! 🎉"
            : `${formatDuration(profile.daily_target_hours * 60 - todayMinutes)} left to reach your daily goal`}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={ITEM_VARIANTS} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: Clock,
            label: "Today's Focus",
            value: formatDuration(todayMinutes),
            sub: `of ${profile.daily_target_hours}h goal`,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-500/10",
          },
          {
            icon: Flame,
            label: "Current Streak",
            value: `${profile.streak_count} days`,
            sub: `Best: ${profile.longest_streak}d`,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-500/10",
          },
          {
            icon: Coins,
            label: "Credit Wallet",
            value: profile.credit_points.toLocaleString(),
            sub: "credits",
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-500/10",
          },
          {
            icon: CalendarDays,
            label: "Exam Countdown",
            value: daysUntilExam !== null ? `${daysUntilExam}d` : "—",
            sub: profile.target_exam,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
          },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{card.label}</div>
            <div className="mt-0.5 text-xs text-slate-400">{card.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={ITEM_VARIANTS}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: Shield,
              label: "Focus Shield",
              desc: "Start a session",
              color: "from-indigo-500 to-violet-600",
              action: () => startFocus("General Study", 25),
            },
            {
              icon: Bot,
              label: "AI Tutor",
              desc: "Ask StudyBot",
              color: "from-emerald-500 to-teal-600",
              action: openBot,
            },
            {
              icon: Trophy,
              label: "Daily Quiz",
              desc: "Attempt now",
              color: "from-amber-500 to-orange-600",
              action: () => router.push("/quiz"),
            },
            {
              icon: Calendar,
              label: "Timetable",
              desc: "View schedule",
              color: "from-blue-500 to-cyan-600",
              action: () => router.push("/planner"),
            },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.action}
              className={`rounded-2xl bg-gradient-to-br ${action.color} p-4 text-left text-white shadow-sm`}
            >
              <action.icon className="mb-2 h-5 w-5" />
              <div className="text-sm font-semibold">{action.label}</div>
              <div className="text-xs text-white/70">{action.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 7-day chart */}
        <motion.div variants={ITEM_VARIANTS} className="card col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              <TrendingUp className="mr-2 inline h-4 w-4 text-indigo-500" />
              7-Day Study Time
            </h2>
            <span className="text-xs text-slate-400">hours/day</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}h`, "Study Time"]}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Progress */}
        <motion.div variants={ITEM_VARIANTS} className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            <BookOpen className="mr-2 inline h-4 w-4 text-indigo-500" />
            Subject Progress
          </h2>
          {subjectProgress.length === 0 ? (
            <p className="text-sm text-slate-400">Add slots in the planner to track progress.</p>
          ) : (
            <div className="space-y-4">
              {subjectProgress.map((s) => (
                <div key={s.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="progress-fill"
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Today's Schedule */}
      <motion.div variants={ITEM_VARIANTS} className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            <Zap className="mr-2 inline h-4 w-4 text-amber-500" />
            Today&apos;s Schedule
          </h2>
          <button
            onClick={() => router.push("/planner")}
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View all →
          </button>
        </div>
        {todaySchedule.length === 0 ? (
          <p className="text-sm text-slate-400">No sessions scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {todaySchedule.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div
                  className="h-10 w-1 rounded-full"
                  style={{ background: SUBJECT_COLORS[slot.subject] ?? "#6366f1" }}
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800 dark:text-slate-100">{slot.title}</div>
                  <div className="text-xs text-slate-500">
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)} · {slot.subject}
                  </div>
                </div>
                {slot.is_completed ? (
                  <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    ✓ Done
                  </span>
                ) : (
                  <button
                    onClick={() => startFocus(slot.subject, 25)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
                  >
                    <Play className="h-3 w-3" /> Start
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
