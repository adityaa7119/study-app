// components/dashboard/DashboardClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Coins,
  CalendarDays,
  CheckSquare,
  Megaphone,
  BarChart3,
  BookMarked,
  Timer,
  Compass,
  FileText,
  Library,
  Flame,
  Snowflake,
  Award,
  Trophy,
  FileSignature,
  Zap,
  Clock,
  TrendingUp,
  X,
  Play,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Shield,
  Bot,
  Search,
  Sparkles,
  Quote,
  Sun,
  Sliders,
  Rocket,
  Activity,
  Briefcase,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Profile, Schedule, QuizAttempt, FocusSession } from "@/lib/types/database";
import {
  formatDuration,
  getDaysUntilExam,
  getGreeting,
  getDaysOfWeek,
  getMondayOfCurrentWeek,
  MOTIVATIONAL_QUOTES,
} from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

interface Props {
  profile: Profile;
  schedules: Schedule[];
  quizAttempts: QuizAttempt[];
  recentSessions: FocusSession[];
}

// Hub modules matching Photo 1 design layout (18 tiles in 3-column grid)
interface HubModule {
  id: string;
  label: string;
  icon: typeof User;
  type: "route" | "modal" | "action";
  target?: string;
  badge?: string;
  color?: string;
  description: string;
}

export default function DashboardClient({
  profile,
  schedules,
  quizAttempts,
  recentSessions,
}: Props) {
  const router = useRouter();
  const { openBot, startFocus, updateCredits } = useAppStore();
  const daysUntilExam = getDaysUntilExam(profile.exam_date);

  // Motivational quote rotating every 10-15s (12s interval)
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Active view tab: "hub" (Photo 1 3-column grid) vs "analytics" (Charts & timetable)
  const [activeView, setActiveView] = useState<"hub" | "analytics">("hub");

  // Active modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Syllabus tracker state
  const [syllabusItems, setSyllabusItems] = useState([
    { id: "s1", subject: "Physics", topic: "Rotational Dynamics & Torque", done: true },
    { id: "s2", subject: "Physics", topic: "Thermodynamics & Heat Engines", done: false },
    { id: "s3", subject: "Chemistry", topic: "Coordination Compounds & CFT", done: true },
    { id: "s4", subject: "Chemistry", topic: "Aldehydes, Ketones & Carboxylic Acids", done: false },
    { id: "s5", subject: "Mathematics", topic: "Definite Integrals & Area Under Curve", done: true },
    { id: "s6", subject: "Mathematics", topic: "Vector Algebra & 3D Geometry", done: false },
  ]);

  // Streak freeze state
  const [freezeApplied, setFreezeApplied] = useState(false);

  // Apple Lockscreen Clock state (Photo 2 reference)
  const [liveTime, setLiveTime] = useState("");
  const [liveDate, setLiveDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveTime(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
      setLiveDate(d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Today's schedule
  const todaySchedule = useMemo(() => {
    const today = new Date().getDay();
    const adjustedDay = today === 0 ? 6 : today - 1;
    return schedules
      .filter((s) => s.day_of_week === adjustedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedules]);

  const targetHoursReached = todayMinutes >= profile.daily_target_hours * 60;

  // 18 Modules in 3-column grid directly matching Photo 1:
  // Row 1: Profile | Fees | Miscellaneous Fee
  // Row 2: Holidays | Assignment | Announcement
  // Row 3: Bulletin Board | Student Assessment | Syllabus
  // Row 4: Session Plan | Admissions | Document
  // Row 5: Library | Attendance | Leave Application
  // Row 6: Placement | Project | Exam
  const HUB_MODULES: HubModule[] = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      type: "route",
      target: "/settings",
      description: "Manage avatar, exam targets, and personal study settings",
    },
    {
      id: "fees",
      label: "Fees & Credits",
      icon: Coins,
      type: "route",
      target: "/settings",
      badge: `${profile.credit_points} cr`,
      description: "View wallet balance, earned bonuses, and credit shop",
    },
    {
      id: "misc_fee",
      label: "Credit Rewards",
      icon: Zap,
      type: "route",
      target: "/settings",
      description: "Redeem streak freezes, bonus questions, and XP boosts",
    },
    {
      id: "holidays",
      label: "Holidays & Dates",
      icon: CalendarDays,
      type: "modal",
      description: "View academic calendar, exam dates, and holiday schedule",
    },
    {
      id: "assignment",
      label: "Assignment & DPP",
      icon: CheckSquare,
      type: "modal",
      badge: "6 pending",
      description: "Daily Practice Problem sheets and conceptual questions",
    },
    {
      id: "announcement",
      label: "Announcement",
      icon: Megaphone,
      type: "modal",
      badge: "New",
      description: "University notifications, semester timetables, and academic circulars",
    },
    {
      id: "assessment",
      label: "Student Assessment",
      icon: BarChart3,
      type: "modal",
      description: "In-depth score breakdown, study hours, and weak chapter analysis",
    },
    {
      id: "syllabus",
      label: "Syllabus Tracker",
      icon: BookMarked,
      type: "modal",
      description: "Interactive chapter checklists and exam weightage milestones",
    },
    {
      id: "session_plan",
      label: "Session Plan",
      icon: Timer,
      type: "route",
      target: "/focus",
      badge: "Live",
      description: "Launch Focus Shield with Pomodoro timer & ambient sounds",
    },
    {
      id: "simulator",
      label: "Concept Simulator",
      icon: Activity,
      type: "route",
      target: "/simulator",
      badge: "Code",
      description: "Interactive physics & math simulations with real-time Python/MATLAB code",
    },
    {
      id: "document",
      label: "Formula Sheets",
      icon: FileText,
      type: "route",
      target: "/library",
      description: "Searchable formula cards, short revision notes, and definitions",
    },
    {
      id: "library",
      label: "Library & PYQ",
      icon: Library,
      type: "route",
      target: "/library",
      description: "Past year papers, markdown guides, and subject archives",
    },
    {
      id: "attendance",
      label: "Attendance Log",
      icon: Flame,
      type: "modal",
      badge: `${profile.streak_count}d streak`,
      description: "Study streak calendar, active days, and discipline records",
    },
    {
      id: "leave",
      label: "Streak Freeze",
      icon: Snowflake,
      type: "modal",
      description: "Apply for 1-day study leave or protective streak freeze",
    },
    {
      id: "placement",
      label: "Placement Hub",
      icon: Briefcase,
      type: "route",
      target: "/placement",
      badge: "Jobs",
      description: "Company cutoffs, hiring rounds, ATS resume scanner, and OA questions",
    },
    {
      id: "project",
      label: "Project Lab",
      icon: Rocket,
      type: "route",
      target: "/projects",
      badge: "AI",
      description: "Mini project suggestions, step-by-step build plans, and starter code",
    },
    {
      id: "exam",
      label: "Mock Exam Arena",
      icon: FileSignature,
      type: "route",
      target: "/quiz",
      description: "Full-length simulated mock tests with instant answer keys",
    },
  ];

  const handleModuleClick = (mod: HubModule) => {
    if (mod.type === "route" && mod.target) {
      router.push(mod.target);
    } else if (mod.type === "modal") {
      setActiveModal(mod.id);
    } else if (mod.type === "action") {
      openBot();
    }
  };

  const toggleSyllabusItem = (id: string) => {
    setSyllabusItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
    toast.success("Progress saved!");
  };

  const applyStreakFreeze = () => {
    if (profile.credit_points < 100) {
      toast.error("You need at least 100 credits for a Streak Freeze.");
      return;
    }
    updateCredits(-100);
    setFreezeApplied(true);
    toast.success("❄️ Streak Freeze activated! Your streak is shielded for tomorrow.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner & Apple Lockscreen Header (Photo aesthetic) */}
      <div className="apple-glass-card relative overflow-hidden p-6 sm:p-7 text-[#FDF5EC] shadow-2xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-[#D97D29]/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 h-40 w-40 rounded-full bg-[#2B1810]/60 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-1.5 flex-1">
            {/* Apple lockscreen status pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#E8D6C4] backdrop-blur-md border border-white/20">
                <span className="h-2 w-2 rounded-full bg-[#D97D29] animate-pulse" />
                <span>Engineering: {profile.target_exam}</span>
                {daysUntilExam !== null && (
                  <>
                    <span className="text-[#E8D6C4]/40">•</span>
                    <span>{daysUntilExam} days left</span>
                  </>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#E8D6C4] backdrop-blur-md border border-white/20">
                <Sun className="h-3.5 w-3.5 text-[#E3A354]" />
                <span>{liveDate || "Wed 16 Oct"} • 23°C Golden Hour Study Desk</span>
              </div>
            </div>

            {/* Greeting with Live Apple Lockscreen Clock */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-poppins">
                {getGreeting()},{" "}
                <span className="text-[#D97D29]">
                  {profile.full_name?.split(" ")[0] || "Scholar"}
                </span>
              </h1>
              {liveTime && (
                <span className="text-sm sm:text-base font-light text-[#E8D6C4]/75 tracking-widest font-mono">
                  [{liveTime}]
                </span>
              )}
            </div>

            {/* Motivational Quote placed directly below greeting, rotates every 10-15 seconds */}
            <div className="min-h-[1.75rem] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex items-center gap-2 text-xs sm:text-sm text-[#E8D6C4] font-medium italic"
                >
                  <Quote className="h-3.5 w-3.5 shrink-0 text-[#E3A354] rotate-180" />
                  <span className="leading-snug">&ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="text-xs sm:text-sm text-[#E8D6C4]/85 max-w-md font-medium leading-relaxed">
              {targetHoursReached
                ? "You've crushed today's study target! Outstanding consistency. 🎉"
                : `${formatDuration(
                    Math.max(0, profile.daily_target_hours * 60 - todayMinutes)
                  )} remaining to reach today's ${profile.daily_target_hours}h focus goal.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => startFocus("General Study", 25)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D97D29] to-[#BE6017] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#D97D29]/35 transition-all hover:brightness-110 active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              Start Focus
            </button>
            <button
              onClick={openBot}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-[#FDF5EC] border border-white/20 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <Bot className="h-4 w-4 text-[#E3A354]" />
              AI Tutor
            </button>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="apple-glass-icon flex h-9 w-9 items-center justify-center text-[#E3A354]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[#E8D6C4]/80">Today's Focus</div>
              <div className="text-sm font-bold text-white">{formatDuration(todayMinutes)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="apple-glass-icon flex h-9 w-9 items-center justify-center text-orange-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[#E8D6C4]/80">Streak</div>
              <div className="text-sm font-bold text-white">{profile.streak_count} days</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="apple-glass-icon flex h-9 w-9 items-center justify-center text-[#E3A354]">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[#E8D6C4]/80">Wallet</div>
              <div className="text-sm font-bold text-white">
                {profile.credit_points.toLocaleString()} cr
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="apple-glass-icon flex h-9 w-9 items-center justify-center text-amber-300">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[#E8D6C4]/80">Semester Exam</div>
              <div className="text-sm font-bold text-white">
                {daysUntilExam !== null ? `${daysUntilExam}d` : "Set in profile"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher: Campus Hub (Photo 1) vs Analytics */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("hub")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeView === "hub"
                ? "bg-[#D97D29] text-white shadow-md shadow-[#D97D29]/30"
                : "bg-white/10 text-[#E8D6C4] hover:text-white border border-white/15 backdrop-blur-md"
            )}
          >
            Campus Hub (18 Modules)
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeView === "analytics"
                ? "bg-[#D97D29] text-white shadow-md shadow-[#D97D29]/30"
                : "bg-white/10 text-[#E8D6C4] hover:text-white border border-white/15 backdrop-blur-md"
            )}
          >
            Study Charts & Schedule
          </button>
        </div>

        <span className="hidden sm:inline-flex text-xs font-medium text-[#E8D6C4]/80">
          Apple Frosted Glass • 3-Column
        </span>
      </div>

      {/* VIEW 1: THE 3-COLUMN ICON GRID DASHBOARD (Exact Match to Photo 2 Apple Glassy Grid) */}
      {activeView === "hub" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="apple-glass-card p-5 sm:p-7 shadow-2xl relative overflow-hidden"
        >
          <div className="mb-6 flex items-center justify-between px-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-poppins">
                Academic & Campus Services
              </h2>
              <p className="text-xs text-[#E8D6C4]/80 mt-0.5">
                Quick launchers for campus tools, course portals, and academic resources.
              </p>
            </div>
            <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-bold text-[#E8D6C4] backdrop-blur-md">
              {HUB_MODULES.length} Apps
            </span>
          </div>

          {/* THE 3-COLUMN APPLE SQUIRCLE GRID */}
          <div className="grid grid-cols-3 gap-y-5 sm:gap-y-8 gap-x-1.5 sm:gap-x-4">
            {HUB_MODULES.map((mod) => (
              <motion.button
                key={mod.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleModuleClick(mod)}
                className="group relative flex flex-col items-center text-center p-2 sm:p-3.5 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:bg-white/[0.08]"
              >
                {/* Apple Squircle Glass Icon Container */}
                <div className="relative mb-2">
                  {/* Apple Notification Badge (Photo 2 style) */}
                  {mod.badge && (
                    <span className="apple-badge absolute -top-1.5 -right-2 z-20 rounded-full px-1.5 py-0.2 text-[9px]">
                      {mod.badge}
                    </span>
                  )}

                  {/* Glassy Squircle Icon with specular sheen */}
                  <div className="apple-glass-icon flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center text-white">
                    <mod.icon className="h-6 w-6 sm:h-8 sm:w-8 stroke-[1.75] text-[#E3A354] group-hover:text-white transition-colors duration-200" />
                  </div>
                </div>

                {/* Centered label matching Photo 1 & 2 style */}
                <span className="text-[11px] sm:text-[13px] font-semibold text-[#FDF5EC] leading-tight group-hover:text-[#D97D29] transition-colors line-clamp-2">
                  {mod.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Floating Apple Dock at bottom of Hub (Photo 2 match) */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
            <div className="apple-dock px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-around gap-2 sm:gap-4 max-w-full overflow-x-auto no-scrollbar">
              {[
                { label: "Focus Shield", icon: Timer, action: () => startFocus("General Study", 25), badge: "Live" },
                { label: "StudyBot AI", icon: Bot, action: openBot, badge: "2" },
                { label: "Quick Quiz", icon: Trophy, action: () => router.push("/quiz"), badge: "10cr" },
                { label: "Formulas", icon: FileText, action: () => router.push("/library") },
                { label: "Settings", icon: Sliders, action: () => router.push("/settings") },
              ].map((dockItem, i) => (
                <button
                  key={i}
                  onClick={dockItem.action}
                  className="group relative flex flex-col items-center select-none"
                  title={dockItem.label}
                >
                  {dockItem.badge && (
                    <span className="apple-badge absolute -top-1.5 -right-1 z-20 rounded-full px-1 py-0.1 text-[8px]">
                      {dockItem.badge}
                    </span>
                  )}
                  <div className="apple-glass-icon flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center text-white">
                    <dockItem.icon className="h-5 w-5 text-[#E3A354] group-hover:text-white transition-colors" />
                  </div>
                  <span className="hidden sm:block text-[9px] font-semibold text-[#E8D6C4]/70 mt-1">
                    {dockItem.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: DETAILED ANALYTICS, 7-DAY STUDY CHART & TODAY'S SCHEDULE */}
      {activeView === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* 7-Day Chart */}
          <div className="card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#D97D29]" />
                  7-Day Study Hours Trend
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Your daily focus time in hours compared across the week.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D97D29]/15 text-[#D97D29]">
                Target: {profile.daily_target_hours}h/day
              </span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,125,41,0.15)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                  unit="h"
                />
                <Tooltip
                  contentStyle={{
                    background: "#1C120C",
                    border: "1px solid #442D1F",
                    borderRadius: "14px",
                    color: "#FDF5EC",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(217,125,41,0.08)" }}
                  formatter={(val: any) => [`${val ?? 0} hours`, "Focus Time"]}
                />
                <Bar dataKey="hours" fill="#D97D29" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Today's Timetable */}
          <div className="card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#D97D29]" />
                Today's Scheduled Slots
              </h3>
              <button
                onClick={() => router.push("/planner")}
                className="text-xs font-semibold text-[#D97D29] hover:underline"
              >
                Full Timetable →
              </button>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
                <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
                  No slots scheduled for today.
                </p>
                <button
                  onClick={() => router.push("/planner")}
                  className="mt-3 btn-primary text-xs py-2"
                >
                  Add Study Slot
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-3.5 transition hover:border-[#D97D29]/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: slot.color || "#D97D29" }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {slot.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {slot.subject} · {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startFocus(slot.subject, 45)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#D97D29] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#BE6017]"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      Focus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* INTERACTIVE MODALS FOR MODULE TILES */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-[var(--text-secondary)] hover:bg-[#D97D29]/15 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* MODAL 1: HOLIDAYS & ACADEMIC DATES */}
              {activeModal === "holidays" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97D29]/15 text-[#D97D29]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Holidays & Exam Schedule
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Upcoming competitive examination timeline
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { date: "May 12, 2026", event: "Semester End Theory Examinations", tag: "University" },
                      { date: "April 20, 2026", event: "Mid-Term / In-Semester Assessments", tag: "Department" },
                      { date: "May 2, 2026", event: "Practical Viva & Term-Work Submission", tag: "Lab Board" },
                      { date: "June 1, 2026", event: "Engineering Internship & Capstone Sprint", tag: "Academic" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 text-xs"
                      >
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{item.event}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{item.date}</div>
                        </div>
                        <span className="rounded-md bg-[#D97D29]/20 px-2 py-0.5 text-[10px] font-bold text-[#D97D29]">
                          {item.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL 2: ASSIGNMENT & DPP */}
              {activeModal === "assignment" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97D29]/15 text-[#D97D29]">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Daily Practice Problems (DPP)
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        6 problems curated for your target exam
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {[
                      { title: "DPP #42: Rigid Body Dynamics (15 Qs)", subject: "Physics", time: "45m" },
                      { title: "DPP #38: Coordination Compounds Isomerism", subject: "Chemistry", time: "30m" },
                      { title: "DPP #51: Definite Integrals Properties", subject: "Mathematics", time: "40m" },
                    ].map((dpp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 text-xs"
                      >
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{dpp.title}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {dpp.subject} · Est. {dpp.time}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveModal(null);
                            router.push("/quiz");
                          }}
                          className="btn-primary py-1.5 px-3 text-xs"
                        >
                          Solve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL 3: ANNOUNCEMENT */}
              {activeModal === "announcement" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97D29]/15 text-[#D97D29]">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Official Announcements
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Latest exam notifications & platform updates
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-[#D97D29]/30 bg-[#D97D29]/10 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#D97D29]">University Semester Exam Timetable Released</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">Today</span>
                      </div>
                      <p className="text-[var(--text-primary)] leading-relaxed">
                        End-semester examination schedule and hall ticket generation portal is now accessible. Please verify your course codes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/40 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[var(--text-primary)]">StudyBuddy AI Tutor 2.0</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">Yesterday</span>
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        Voice reading and instant LaTeX equation rendering now available in StudyBot chat!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 4: SYLLABUS TRACKER */}
              {activeModal === "syllabus" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97D29]/15 text-[#D97D29]">
                      <BookMarked className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Syllabus Milestones Tracker
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Check off completed high-weightage chapters
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {syllabusItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleSyllabusItem(item.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition select-none text-xs",
                          item.done
                            ? "border-[#D97D29]/40 bg-[#D97D29]/10 text-[var(--text-primary)]"
                            : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-5 w-5 rounded-md flex items-center justify-center border transition",
                              item.done
                                ? "bg-[#D97D29] border-[#D97D29] text-white"
                                : "border-[var(--border)] bg-transparent"
                            )}
                          >
                            {item.done && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className={cn("font-bold", item.done && "line-through text-[#D97D29]")}>
                              {item.topic}
                            </div>
                            <div className="text-[10px] opacity-70">{item.subject}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold">
                          {item.done ? "Done" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL 5: STREAK FREEZE / LEAVE */}
              {activeModal === "leave" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
                      <Snowflake className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Streak Freeze & Leave
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Protect your {profile.streak_count}-day study streak during rest or travel
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4 text-xs space-y-2">
                    <p className="text-[var(--text-primary)] leading-relaxed">
                      Activating a Streak Freeze consumes <strong>100 study credits</strong> and ensures your daily streak remains protected even if you cannot log focus hours tomorrow.
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                      <span className="text-[var(--text-secondary)]">Your Balance:</span>
                      <span className="font-bold text-[#D97D29]">{profile.credit_points} credits</span>
                    </div>
                  </div>

                  <button
                    onClick={applyStreakFreeze}
                    disabled={freezeApplied}
                    className="btn-primary w-full justify-center text-xs py-2.5"
                  >
                    {freezeApplied ? "✓ Streak Freeze Active" : "Shield Streak (100 credits)"}
                  </button>
                </div>
              )}

              {/* MODAL 6: CGPA & HONOURS TARGET */}
              {activeModal === "admissions" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97D29]/15 text-[#D97D29]">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Semester CGPA & Cutoff Benchmark
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Targeting for: {profile.target_exam || "Engineering Year"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    {[
                      { benchmark: "Tier 1 Placements / Top Tech", criteria: "Software & R&D Roles", target: "8.5+ CGPA" },
                      { benchmark: "Honours / Minors Degree", criteria: "AI/ML or Data Science Specialization", target: "8.0+ CGPA" },
                      { benchmark: "Core Engineering Roles", criteria: "Design, Embedded & Core Systems", target: "7.5+ CGPA" },
                      { benchmark: "University First Class with Distinction", criteria: "All Semesters All Clear", target: "7.75+ CGPA" },
                    ].map((pred, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{pred.benchmark}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{pred.criteria}</div>
                        </div>
                        <span className="font-bold text-[#D97D29]">{pred.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL 7: STUDENT ASSESSMENT */}
              {activeModal === "assessment" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97D29]/15 text-[#D97D29]">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Performance Assessment
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Summary of quiz attempts and focus efficiency
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 p-3 text-center">
                      <div className="text-xl font-bold text-[#D97D29]">
                        {quizAttempts.length > 0
                          ? `${Math.round(
                              (quizAttempts.filter((a) => a.score >= 50).length /
                                quizAttempts.length) *
                                100
                            )}%`
                          : "82%"}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Quiz Accuracy
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 p-3 text-center">
                      <div className="text-xl font-bold text-[var(--text-primary)]">
                        {profile.total_focus_minutes > 0
                          ? `${(profile.total_focus_minutes / 60).toFixed(1)}h`
                          : "14.5h"}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Total Focus Logged
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveModal(null);
                      router.push("/quiz");
                    }}
                    className="btn-primary w-full justify-center text-xs py-2.5 mt-2"
                  >
                    Take Benchmark Quiz
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
