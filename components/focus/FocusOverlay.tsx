// components/focus/FocusOverlay.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Volume2, VolumeX, AlertTriangle, CheckCircle, Minus,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatTime, getRandomQuote } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";

const AMBIENT_SOUNDS = [
  { label: "Rain", emoji: "🌧️", src: "https://www.soundjay.com/nature/sounds/rain-01.mp3" },
  { label: "Forest", emoji: "🌲", src: "" }, // browser-generated
  { label: "White Noise", emoji: "📻", src: "" },
];

export default function FocusOverlay() {
  const {
    endFocus,
    tickFocus,
    focusSubject,
    focusDurationMinutes,
    focusSecondsRemaining,
    focusTabSwitches,
    incrementTabSwitch,
    updateCredits,
    profile,
  } = useAppStore();

  const [quote] = useState(() => getRandomQuote());
  const [ambientOn, setAmbientOn] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [sessionOver, setSessionOver] = useState(false);
  const [sessionStarted] = useState(() => new Date().toISOString());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const supabase = createClient();

  // Register focus session in DB
  useEffect(() => {
    if (!profile) return;
    supabase
      .from("focus_sessions")
      .insert({
        user_id: profile.id,
        subject: focusSubject,
        duration_minutes: focusDurationMinutes,
        actual_minutes: 0,
        completed: false,
        quit_early: false,
        penalty_points: 0,
        tab_switches: 0,
      })
      .select()
      .single()
      .then(({ data }) => {
        if (data) sessionIdRef.current = data.id;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      tickFocus();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tickFocus]);

  // Detect when timer hits 0
  useEffect(() => {
    if (focusSecondsRemaining === 0 && !sessionOver) {
      setSessionOver(true);
      if (timerRef.current) clearInterval(timerRef.current);
      handleSessionComplete(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSecondsRemaining, sessionOver]);

  // Tab visibility warning
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        incrementTabSwitch();
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [incrementTabSwitch]);

  const handleSessionComplete = useCallback(
    async (completed: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const actualMinutes = Math.floor(
        (focusDurationMinutes * 60 - focusSecondsRemaining) / 60
      );
      const penaltyPoints = completed ? 0 : Math.min(20, Math.floor(actualMinutes / 5) * 5);
      const earnedPoints = completed ? Math.floor(focusDurationMinutes * 1.5) : 0;

      if (sessionIdRef.current) {
        await supabase
          .from("focus_sessions")
          .update({
            actual_minutes: actualMinutes,
            completed,
            quit_early: !completed,
            penalty_points: penaltyPoints,
            tab_switches: focusTabSwitches,
            ended_at: new Date().toISOString(),
          })
          .eq("id", sessionIdRef.current);
      }

      if (profile) {
        if (completed) {
          updateCredits(earnedPoints);
          await supabase.from("transactions").insert({
            user_id: profile.id,
            amount: earnedPoints,
            balance_after: profile.credit_points + earnedPoints,
            description: `Focus session: ${focusSubject} (${focusDurationMinutes}min)`,
            transaction_type: "focus_complete",
          });
          toast.success(`+${earnedPoints} credits earned!`);
        } else if (penaltyPoints > 0) {
          updateCredits(-penaltyPoints);
          await supabase.from("transactions").insert({
            user_id: profile.id,
            amount: -penaltyPoints,
            balance_after: Math.max(0, profile.credit_points - penaltyPoints),
            description: `Early quit penalty: ${focusSubject}`,
            transaction_type: "focus_quit_penalty",
          });
          toast.warning(`-${penaltyPoints} credits penalty`);
        }
      }
      endFocus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusSecondsRemaining, focusDurationMinutes, focusTabSwitches, focusSubject, profile]
  );

  const pct = Math.round(
    ((focusDurationMinutes * 60 - focusSecondsRemaining) / (focusDurationMinutes * 60)) * 100
  );
  const circumference = 2 * Math.PI * 90;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="focus-overlay"
    >
      {/* Tab switch warning */}
      <AnimatePresence>
        {tabWarning && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
          >
            <AlertTriangle className="h-4 w-4" />
            Tab switch #{focusTabSwitches} detected! Stay focused.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-sm font-medium text-slate-400">Focus Shield Active</div>
        <div className="mt-1 text-xl font-bold text-white">{focusSubject}</div>
      </div>

      {/* Circular timer */}
      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="208" height="208">
          <circle
            cx="104" cy="104" r="90"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <motion.circle
            cx="104" cy="104" r="90"
            fill="none"
            stroke="#6366f1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * pct) / 100}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="text-center">
          <div className="text-5xl font-mono font-bold text-white">
            {formatTime(focusSecondsRemaining)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{pct}% complete</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 flex gap-8 text-center text-sm">
        <div>
          <div className="text-lg font-bold text-white">{focusTabSwitches}</div>
          <div className="text-xs text-slate-400">Tab switches</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">{focusDurationMinutes}m</div>
          <div className="text-xs text-slate-400">Session length</div>
        </div>
      </div>

      {/* Quote */}
      <div className="mt-8 max-w-sm px-4 text-center text-sm italic text-slate-400">
        &ldquo;{quote}&rdquo;
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center gap-4">
        {/* Ambient sound toggle */}
        <button
          onClick={() => setAmbientOn(!ambientOn)}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-indigo-500"
        >
          {ambientOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {ambientOn ? "Rain sounds" : "Ambient off"}
        </button>

        {/* Quit early */}
        <button
          onClick={() => handleSessionComplete(false)}
          className="flex items-center gap-2 rounded-xl border border-red-700 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
        >
          <Minus className="h-4 w-4" />
          Quit (penalty)
        </button>

        {/* Complete early */}
        <button
          onClick={() => handleSessionComplete(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <CheckCircle className="h-4 w-4" />
          Mark Done
        </button>
      </div>

      {/* Dismiss (escape) */}
      <button
        onClick={() => handleSessionComplete(false)}
        className="absolute right-5 top-5 rounded-xl p-2 text-slate-500 hover:text-slate-300"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
}
