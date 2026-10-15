// components/planner/PlannerClient.tsx
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Check, Trash2, X, Clock } from "lucide-react";
import type { Schedule, Subject } from "@/lib/types/database";
import { SUBJECTS, SUBJECT_COLORS } from "@/lib/types/database";
import { getDaysOfWeek, getMondayOfCurrentWeek, timeToMinutes } from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

interface Props {
  initialSchedules: Schedule[];
  weekStartDate: string;
  userId: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface SlotForm {
  title: string;
  subject: Subject;
  start_time: string;
  end_time: string;
  color: string;
}

const DEFAULT_FORM: SlotForm = {
  title: "",
  subject: "Physics",
  start_time: "09:00",
  end_time: "10:00",
  color: SUBJECT_COLORS.Physics,
};

export default function PlannerClient({ initialSchedules, weekStartDate, userId }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [showForm, setShowForm] = useState(false);
  const [formDay, setFormDay] = useState(0);
  const [form, setForm] = useState<SlotForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const { startFocus } = useAppStore();
  const supabase = createClient();

  const days = getDaysOfWeek(getMondayOfCurrentWeek());

  const openForm = (dayIndex: number) => {
    setFormDay(dayIndex);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const handleSubjectChange = (subject: Subject) => {
    setForm((f) => ({ ...f, subject, color: SUBJECT_COLORS[subject] ?? "#6366f1" }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (timeToMinutes(form.end_time) <= timeToMinutes(form.start_time)) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("schedules")
        .insert({
          user_id: userId,
          title: form.title.trim(),
          subject: form.subject,
          day_of_week: formDay,
          start_time: form.start_time,
          end_time: form.end_time,
          color: form.color,
          is_completed: false,
          week_start_date: weekStartDate,
        })
        .select()
        .single();

      if (error) throw error;
      setSchedules((prev) => [...prev, data]);
      setShowForm(false);
      toast.success("Slot added!");
    } catch {
      toast.error("Failed to save slot");
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = useCallback(
    async (slot: Schedule) => {
      const newVal = !slot.is_completed;
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === slot.id
            ? { ...s, is_completed: newVal, completed_at: newVal ? new Date().toISOString() : null }
            : s
        )
      );
      const { error } = await supabase
        .from("schedules")
        .update({
          is_completed: newVal,
          completed_at: newVal ? new Date().toISOString() : null,
        })
        .eq("id", slot.id);
      if (error) toast.error("Update failed");
    },
    [supabase]
  );

  const deleteSlot = useCallback(
    async (slotId: string) => {
      setSchedules((prev) => prev.filter((s) => s.id !== slotId));
      const { error } = await supabase.from("schedules").delete().eq("id", slotId);
      if (error) toast.error("Delete failed");
      else toast.success("Slot removed");
    },
    [supabase]
  );

  // Progress for each day
  const getDayProgress = (dayIdx: number) => {
    const daySlots = schedules.filter((s) => s.day_of_week === dayIdx);
    if (daySlots.length === 0) return null;
    const completed = daySlots.filter((s) => s.is_completed).length;
    return { completed, total: daySlots.length };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Planner</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Week of {new Date(weekStartDate).toLocaleDateString("en", { month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {DAYS.map((dayName, dayIdx) => {
          const date = days[dayIdx];
          const daySlots = schedules
            .filter((s) => s.day_of_week === dayIdx)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
          const progress = getDayProgress(dayIdx);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={dayIdx}
              className={cn(
                "card min-h-[200px] p-3",
                isToday && "ring-2 ring-indigo-500"
              )}
            >
              {/* Day header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className={cn("text-sm font-semibold", isToday ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300")}>
                    {dayName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {date.getDate()}
                  </div>
                </div>
                {progress && (
                  <span className="text-xs text-slate-400">
                    {progress.completed}/{progress.total}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {progress && (
                <div className="progress-bar mb-2">
                  <div
                    className="progress-fill bg-indigo-500"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
              )}

              {/* Slots */}
              <div className="space-y-2">
                {daySlots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "group relative rounded-lg p-2 text-xs",
                      slot.is_completed
                        ? "bg-slate-100 opacity-60 dark:bg-slate-700"
                        : "bg-white shadow-sm dark:bg-slate-800"
                    )}
                    style={{ borderLeft: `3px solid ${slot.color}` }}
                  >
                    <div className={cn("font-medium truncate", slot.is_completed && "line-through")}>
                      {slot.title}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                    </div>

                    {/* Actions */}
                    <div className="absolute right-1 top-1 hidden items-center gap-0.5 group-hover:flex">
                      <button
                        onClick={() => startFocus(slot.subject, 25)}
                        title="Start Focus"
                        className="rounded p-0.5 text-indigo-500 hover:bg-indigo-50"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => toggleComplete(slot)}
                        title="Toggle complete"
                        className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        title="Delete"
                        className="rounded p-0.5 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add slot button */}
              <button
                onClick={() => openForm(dayIdx)}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-1.5 text-xs text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-600 dark:hover:border-indigo-500"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          );
        })}
      </div>

      {/* Slot Creator Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Add Slot — {DAYS[formDay]}
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Title
                  </label>
                  <input
                    className="input"
                    placeholder="e.g., Kinematics Chapter 2"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Subject
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSubjectChange(s)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                          form.subject === s
                            ? "text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        )}
                        style={form.subject === s ? { background: SUBJECT_COLORS[s] } : undefined}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? "Saving..." : "Add Slot"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
