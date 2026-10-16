// app/(app)/focus/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, Zap, AlertTriangle, Sliders, Plus, Minus, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { SUBJECTS } from "@/lib/types/database";

const PRESET_DURATIONS = [
  { label: "25 min", value: 25, desc: "Classic Pomodoro" },
  { label: "50 min", value: 50, desc: "Deep work" },
  { label: "90 min", value: 90, desc: "Flow state" },
];

const QUICK_CUSTOM_CHIPS = [15, 30, 45, 60, 75, 120];

export default function FocusPage() {
  const { startFocus } = useAppStore();

  const [subject, setSubject] = useState<string>("Physics");
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(25);
  const [customInputMinutes, setCustomInputMinutes] = useState<number>(45);

  const handleSelectPreset = (val: number) => {
    setIsCustomDuration(false);
    setDuration(val);
  };

  const handleSelectCustom = () => {
    setIsCustomDuration(true);
    setDuration(customInputMinutes);
  };

  const handleCustomChange = (val: number) => {
    const clamped = Math.max(1, Math.min(240, val));
    setCustomInputMinutes(clamped);
    if (isCustomDuration) {
      setDuration(clamped);
    }
  };

  const handleAdjustCustom = (delta: number) => {
    handleCustomChange(customInputMinutes + delta);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#D97D29]" />
          <span>Focus Shield</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter distraction-free deep work mode. Earn credits for completing sessions.
        </p>
      </div>

      <div className="card p-6 sm:p-7 space-y-6">
        {/* Session Duration Picker */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#D97D29]" />
              <span>Session Duration</span>
            </label>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D97D29]/15 text-[#D97D29]">
              {duration} Minutes Selected
            </span>
          </div>

          {/* 4 Duration Cards (3 Presets + 1 Custom) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_DURATIONS.map((d) => {
              const isSelected = !isCustomDuration && duration === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleSelectPreset(d.value)}
                  className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-[#D97D29] bg-[#D97D29]/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-white/5"
                  }`}
                >
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {d.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {d.desc}
                  </div>
                </button>
              );
            })}

            {/* Custom Option Card */}
            <button
              type="button"
              onClick={handleSelectCustom}
              className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                isCustomDuration
                  ? "border-[#D97D29] bg-[#D97D29]/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isCustomDuration ? `${customInputMinutes} min` : "Custom"}
                </span>
                <Sliders className="h-4 w-4 text-[#D97D29]" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set custom time
              </div>
            </button>
          </div>

          {/* Expanded Custom Duration Controller */}
          <AnimatePresence>
            {isCustomDuration && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 sm:p-5 rounded-2xl border border-[#D97D29]/30 bg-[#D97D29]/5 dark:bg-[#D97D29]/10 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Custom Study Time Controller
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Choose any duration between 1 and 240 minutes.
                    </p>
                  </div>

                  {/* Stepper with Number Input */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleAdjustCustom(-5)}
                      disabled={customInputMinutes <= 5}
                      className="p-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition"
                      title="-5 minutes"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D97D29] bg-white dark:bg-black/50">
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={customInputMinutes}
                        onChange={(e) => handleCustomChange(parseInt(e.target.value) || 1)}
                        className="w-12 text-center font-bold text-base bg-transparent text-[#D97D29] focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        min
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdjustCustom(5)}
                      disabled={customInputMinutes >= 240}
                      className="p-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition"
                      title="+5 minutes"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={customInputMinutes}
                    onChange={(e) => handleCustomChange(parseInt(e.target.value))}
                    className="w-full accent-[#D97D29] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    <span>5 min</span>
                    <span>45 min</span>
                    <span>90 min</span>
                    <span>180 min</span>
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">
                    Quick set:
                  </span>
                  {QUICK_CUSTOM_CHIPS.map((chipVal) => (
                    <button
                      key={chipVal}
                      type="button"
                      onClick={() => handleCustomChange(chipVal)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        customInputMinutes === chipVal
                          ? "bg-[#D97D29] text-white shadow-sm"
                          : "bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-[#D97D29]/15"
                      }`}
                    >
                      {chipVal}m
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subject Picker & Manual Subject Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#D97D29]" />
            <span>Subject or Topic</span>
          </label>

          {/* Preset Subject Chips */}
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const isSelected = subject.toLowerCase() === s.toLowerCase();
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                    isSelected
                      ? "bg-[#D97D29] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Manual Subject Typing Input */}
          <div className="relative mt-2">
            <Sparkles className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Or type custom subject / chapter (e.g. Thermodynamics, Data Structures)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/70 dark:bg-black/30 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D97D29]"
            />
          </div>
        </div>

        {/* Penalty Warning Card */}
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            Quitting early deducts up to <strong>20 credits</strong>. Tab switches are tracked and shown in your session report.
          </p>
        </div>

        {/* Main Focus Action Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => startFocus(subject.trim() || "General Study", duration)}
          className="btn-primary w-full justify-center py-4 text-base font-bold shadow-lg"
        >
          <Shield className="h-5 w-5" />
          <span>Start {duration}-Minute Focus Session</span>
        </motion.button>
      </div>
    </div>
  );
}
