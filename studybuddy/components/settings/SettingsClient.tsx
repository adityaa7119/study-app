// components/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Sun, Moon, Zap, Coins, GraduationCap, Calendar,
  Clock, Loader2, Trash2, Mail, Shield,
} from "lucide-react";
import type { Profile, Transaction } from "@/lib/types/database";
import { useAppStore, type Theme } from "@/lib/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

interface Props {
  profile: Profile;
  transactions: Transaction[];
}

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "amoled", label: "AMOLED", icon: Zap },
];

const SHOP_ITEMS = [
  {
    id: "streak_freeze",
    name: "Streak Freeze",
    desc: "Protect your streak for 1 day",
    cost: 100,
    emoji: "🧊",
  },
  {
    id: "bonus_quiz",
    name: "Bonus Practice Set",
    desc: "Unlock 20 extra practice questions",
    cost: 150,
    emoji: "📝",
  },
  {
    id: "xp_boost",
    name: "Double XP Boost",
    desc: "2× credits for next 3 focus sessions",
    cost: 200,
    emoji: "⚡",
  },
];

const EXAMS = ["JEE Main", "JEE Advanced", "NEET", "UPSC", "CAT", "GATE", "Other"];

export default function SettingsClient({ profile: initial, transactions }: Props) {
  const { theme, setTheme, profile: storeProfile, updateCredits } = useAppStore();
  const credits = storeProfile?.credit_points ?? initial.credit_points;

  const [form, setForm] = useState({
    full_name: initial.full_name,
    target_exam: initial.target_exam,
    daily_target_hours: initial.daily_target_hours,
    exam_date: initial.exam_date ?? "",
    avatar_seed: initial.avatar_seed,
  });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          target_exam: form.target_exam,
          daily_target_hours: form.daily_target_hours,
          exam_date: form.exam_date || null,
          avatar_seed: form.avatar_seed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initial.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const redeemItem = (item: (typeof SHOP_ITEMS)[0]) => {
    if (credits < item.cost) {
      toast.error(`Not enough credits (need ${item.cost})`);
      return;
    }
    updateCredits(-item.cost);
    toast.success(`${item.emoji} ${item.name} redeemed!`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your profile, preferences, and credit wallet.
        </p>
      </div>

      {/* Theme Selector */}
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
          <Moon className="mr-2 inline h-4 w-4" />
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition",
                theme === t.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
              )}
            >
              <t.icon className={cn("h-5 w-5", theme === t.value ? "text-indigo-500" : "text-slate-400")} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Profile */}
      <section className="card p-6">
        <h2 className="mb-5 font-semibold text-slate-800 dark:text-slate-100">
          <User className="mr-2 inline h-4 w-4" />
          Student Profile
        </h2>

        {/* Avatar */}
        <div className="mb-5 flex items-center gap-4">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${form.avatar_seed}&backgroundColor=6366f1&textColor=fff`}
            alt="avatar"
            className="h-16 w-16 rounded-2xl"
          />
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Avatar seed (any text)</label>
            <input
              className="input"
              value={form.avatar_seed}
              onChange={(e) => setForm({ ...form, avatar_seed: e.target.value })}
              placeholder="your name, emoji, etc."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Full Name</label>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
              Target Exam
            </label>
            <select
              className="input"
              value={form.target_exam}
              onChange={(e) => setForm({ ...form, target_exam: e.target.value })}
            >
              {EXAMS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Daily Target (hours)
              </label>
              <input
                type="number"
                min={1}
                max={16}
                className="input"
                value={form.daily_target_hours}
                onChange={(e) => setForm({ ...form, daily_target_hours: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                Exam Date
              </label>
              <input
                type="date"
                className="input"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="btn-primary mt-5 w-full justify-center"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
        </button>
      </section>

      {/* Credit Shop */}
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            <Coins className="mr-2 inline h-4 w-4 text-amber-500" />
            Credit Shop
          </h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            {credits.toLocaleString()} cr
          </span>
        </div>
        <div className="space-y-3">
          {SHOP_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-100">{item.name}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
              <button
                onClick={() => redeemItem(item)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  credits >= item.cost
                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700"
                )}
                disabled={credits < item.cost}
              >
                {item.cost} cr
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Transaction History */}
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
          <Shield className="mr-2 inline h-4 w-4" />
          Credit History
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.description}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(t.created_at).toLocaleDateString()} · Balance: {t.balance_after}
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  t.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                )}>
                  {t.amount >= 0 ? `+${t.amount}` : t.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Support & Data */}
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Account</h2>
        <div className="space-y-3">
          <button className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">Contact Support</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Reset all your data? This cannot be undone.")) {
                toast.warning("Data reset is disabled in demo mode.");
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Reset All Data
          </button>
        </div>
      </section>
    </div>
  );
}
