// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Zap,
  Trophy,
  Sun,
  Sparkles,
  Compass,
  Calendar,
  CheckSquare,
  Shield,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthForm from "@/components/auth/AuthForm";

const features = [
  {
    icon: Brain,
    title: "AI Concept Tutor",
    description: "StudyBot explains complex engineering proofs & algorithms with LaTeX",
    badge: "v2.0",
    color: "text-[#D97D29]",
  },
  {
    icon: Zap,
    title: "Focus Shield",
    description: "Deep work Pomodoro sessions with tab-switch penalty tracking",
    badge: "Live",
    color: "text-[#E3A354]",
  },
  {
    icon: Trophy,
    title: "Quiz Arena",
    description: "Semester drills, practice question sets & wager credit points",
    badge: "10 cr",
    color: "text-[#D97D29]",
  },
  {
    icon: BookOpen,
    title: "Smart Library",
    description: "Formula sheets, syllabus trackers & solved engineering PYQs",
    badge: "FE-BE",
    color: "text-[#E3A354]",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1C120C]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D97D29] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden forest-wallpaper-clean text-[#FDF5EC] flex flex-col justify-between">
      {/* Ambient gradient layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#1C120C]/40 via-black/45 to-[#0D0805]/80 pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="relative mx-auto max-w-6xl w-full px-4 pt-8 pb-28 sm:px-6 lg:px-8">
        {/* APPLE LOCKSCREEN HEADER (Match to Photo 2) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-2 sm:pt-4"
        >
          {/* Top Date & Lockscreen Indicators */}
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-medium text-[#E8D6C4]/90 tracking-wide">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/15">
              <Sun className="h-3.5 w-3.5 text-[#E3A354]" />
              <span>{currentDate || "Wed 16 Oct"} • 23°C Golden Hour Study Haven</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-[#E3A354]" />
              <span>Engineering Semester Portal</span>
            </span>
          </div>

          {/* Big Sleek Lockscreen Clock (Photo 2 reference) */}
          <h1 className="mt-2 text-7xl sm:text-8xl md:text-9xl font-light tracking-tight text-white/90 drop-shadow-2xl select-none font-poppins">
            {currentTime || "05:49"}
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-[#E8D6C4]/90 font-medium">
            Your Apple-inspired engineering workspace • First Year to Fourth Year
          </p>
        </motion.div>

        {/* Content Layout: Glassy Widgets on Left + Auth on Right */}
        <div className="mt-10 sm:mt-12 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Glassy Apple-Style Widget Cards (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 space-y-4"
          >
            {/* 4 Feature Widgets in 2x2 Glass Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                  className="group apple-glass p-4 sm:p-5 rounded-3xl transition-all duration-300 hover:border-white/40 hover:bg-white/[0.14]"
                >
                  <div className="flex items-start justify-between mb-3">
                    {/* Apple Glassy Squircle Icon */}
                    <div className="apple-glass-icon flex h-12 w-12 items-center justify-center text-white">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>

                    <span className="apple-badge px-2 py-0.5 text-[10px] rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white font-poppins">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#E8D6C4]/85 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Glassy Live Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="apple-glass rounded-3xl p-5"
            >
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/10">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#D97D29]">100%</div>
                  <div className="text-[11px] font-semibold text-[#E8D6C4]/80 mt-0.5">
                    Engineering Focus
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#FDF5EC]">FE to BE</div>
                  <div className="text-[11px] font-semibold text-[#E8D6C4]/80 mt-0.5">
                    All 4 Years
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#D97D29]">24/7</div>
                  <div className="text-[11px] font-semibold text-[#E8D6C4]/80 mt-0.5">
                    AI Study Buddy
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Auth Card (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-5"
          >
            <AuthForm />
          </motion.div>
        </div>
      </div>

      {/* APPLE FLOATING DOCK AT BOTTOM (Exact Match to Photo 2) */}
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="apple-dock pointer-events-auto px-4 py-2.5 flex items-center gap-3 sm:gap-4 shadow-2xl"
        >
          {[
            { icon: Brain, label: "AI Tutor", badge: "2" },
            { icon: Zap, label: "Focus", badge: "Live" },
            { icon: Trophy, label: "Quiz", badge: "11" },
            { icon: BookOpen, label: "Library" },
            { icon: Calendar, label: "Planner" },
            { icon: Compass, label: "CGPA" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center cursor-pointer select-none"
              title={item.label}
            >
              {item.badge && (
                <span className="apple-badge absolute -top-1.5 -right-1 text-[8px] px-1 py-0.1 rounded-full z-20">
                  {item.badge}
                </span>
              )}
              <div className="apple-glass-icon h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-[#FDF5EC]">
                <item.icon className="h-5 w-5 stroke-[1.8] text-[#E3A354] group-hover:text-white transition-colors" />
              </div>
              <span className="hidden sm:block text-[9px] font-medium text-[#E8D6C4]/70 mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
