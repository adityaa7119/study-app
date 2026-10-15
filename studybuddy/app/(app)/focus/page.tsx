// app/(app)/focus/page.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Clock, Zap, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { SUBJECTS } from "@/lib/types/database";
import { useState } from "react";
import type { Subject } from "@/lib/types/database";

const DURATIONS = [
  { label: "25 min", value: 25, desc: "Classic Pomodoro" },
  { label: "50 min", value: 50, desc: "Deep work" },
  { label: "90 min", value: 90, desc: "Flow state" },
];

export default function FocusPage() {
  const { startFocus } = useAppStore();
  const [subject, setSubject] = useState<Subject>("Physics");
  const [duration, setDuration] = useState(25);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          <Shield className="mr-2 inline h-6 w-6 text-indigo-500" />
          Focus Shield
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter distraction-free deep work mode. Earn credits for completing sessions.
        </p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Duration picker */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Clock className="mr-1.5 inline h-4 w-4" />
            Session Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  duration === d.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="text-lg font-bold text-slate-900 dark:text-white">{d.label}</div>
                <div className="text-xs text-slate-500">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Subject picker */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Zap className="mr-1.5 inline h-4 w-4" />
            Subject
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  subject === s
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Quitting early deducts up to <strong>20 credits</strong>. Tab switches are tracked and shown in your session report.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => startFocus(subject, duration)}
          className="btn-primary w-full justify-center py-4 text-base"
        >
          <Shield className="h-5 w-5" />
          Start {duration}-Minute Focus Session
        </motion.button>
      </div>
    </div>
  );
}
