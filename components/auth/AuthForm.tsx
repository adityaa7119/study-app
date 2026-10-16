// components/auth/AuthForm.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-glass-card p-6 sm:p-8 relative overflow-hidden text-[#FDF5EC] shadow-2xl">
      {/* Ambient background light spot */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#D97D29]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#2B1810]/60 blur-3xl pointer-events-none" />

      {/* Header & Apple Glass Squircle Icon */}
      <div className="mb-6 text-center relative z-10">
        <div className="apple-glass-icon mx-auto mb-3.5 flex h-14 w-14 items-center justify-center text-[#D97D29]">
          <GraduationCap className="h-7 w-7 text-[#E3A354]" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-poppins">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="mt-1 text-xs text-[#E8D6C4] font-medium">
          {mode === "login"
            ? "Sign in to access your engineering dashboard"
            : "Start your structured engineering study journey"}
        </p>

        {/* Apple Segmented Switch */}
        <div className="mt-5 grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              mode === "login"
                ? "bg-[#D97D29] text-white shadow-md shadow-[#D97D29]/30"
                : "text-[#E8D6C4]/70 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              mode === "register"
                ? "bg-[#D97D29] text-white shadow-md shadow-[#D97D29]/30"
                : "text-[#E8D6C4]/70 hover:text-white"
            }`}
          >
            New Account
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {mode === "register" && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label className="mb-1.5 block text-xs font-semibold text-[#E8D6C4]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E8D6C4]/60" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full rounded-2xl border border-white/20 bg-black/35 py-3 pl-10 pr-4 text-sm text-[#FDF5EC] placeholder:text-[#E8D6C4]/40 outline-none backdrop-blur-md transition-all focus:border-[#D97D29] focus:bg-black/50 focus:ring-2 focus:ring-[#D97D29]/30"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#E8D6C4]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E8D6C4]/60" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="student@college.edu"
              className="w-full rounded-2xl border border-white/20 bg-black/35 py-3 pl-10 pr-4 text-sm text-[#FDF5EC] placeholder:text-[#E8D6C4]/40 outline-none backdrop-blur-md transition-all focus:border-[#D97D29] focus:bg-black/50 focus:ring-2 focus:ring-[#D97D29]/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#E8D6C4]">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E8D6C4]/60" />
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/20 bg-black/35 py-3 pl-10 pr-4 text-sm text-[#FDF5EC] placeholder:text-[#E8D6C4]/40 outline-none backdrop-blur-md transition-all focus:border-[#D97D29] focus:bg-black/50 focus:ring-2 focus:ring-[#D97D29]/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-2xl bg-gradient-to-r from-[#D97D29] to-[#BE6017] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D97D29]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "login" ? "Authenticating..." : "Creating Account..."}
            </span>
          ) : (
            <>
              <span>{mode === "login" ? "Sign In to Campus" : "Get Started Free"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-[#E8D6C4]/80 relative z-10">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => setMode("register")}
              className="font-bold text-[#FDF5EC] hover:underline underline-offset-4 decoration-[#D97D29]"
            >
              Sign up free
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="font-bold text-[#FDF5EC] hover:underline underline-offset-4 decoration-[#D97D29]"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
