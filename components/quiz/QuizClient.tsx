// components/quiz/QuizClient.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Zap, Clock, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, Coins, RotateCcw, BookOpen,
} from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store/useAppStore";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Phase = "lobby" | "playing" | "report";

interface Props {
  quizzes: Quiz[];
  userId: string;
  creditPoints: number;
}

const QUIZ_TYPE_STYLES: Record<string, string> = {
  daily: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  weekly: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  duel: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  practice: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
};

const WAGER_AMOUNT = 50;

export default function QuizClient({ quizzes, userId, creditPoints: initialCredits }: Props) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [creditsChange, setCreditsChange] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { updateCredits } = useAppStore();
  const supabase = createClient();

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setCreditsChange(0);
    setPhase("playing");
    const perQuestion = quiz.quiz_type === "duel" ? 15 : 60;
    setTimeLeft(perQuestion * quiz.questions.length);
  };

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishQuiz(answers);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeQuiz]);

  const selectAnswer = (optIdx: number) => {
    if (selected !== null || showExplanation) return;
    setSelected(optIdx);
    setShowExplanation(true);
    const correctIdx = activeQuiz!.questions[currentQ].correct;
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);
    if (optIdx === correctIdx) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQ + 1 >= activeQuiz.questions.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      finishQuiz(answers);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const finishQuiz = useCallback(
    async (finalAnswers: number[]) => {
      if (!activeQuiz) return;
      const finalScore = finalAnswers.reduce((acc, ans, i) => {
        return ans === activeQuiz.questions[i]?.correct ? acc + 1 : acc;
      }, 0);

      const isDuel = activeQuiz.quiz_type === "duel";
      const pct = finalScore / activeQuiz.questions.length;
      let earned = 0;

      if (isDuel) {
        if (pct >= 0.6) {
          earned = WAGER_AMOUNT * 2;
          updateCredits(WAGER_AMOUNT); // net gain
        } else {
          updateCredits(-WAGER_AMOUNT); // lost wager
          earned = -WAGER_AMOUNT;
        }
      } else {
        earned = finalScore * 10;
        updateCredits(earned);
      }

      setCreditsChange(earned);
      setScore(finalScore);
      setPhase("report");

      // Save attempt
      await supabase.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: activeQuiz.id,
        answers: finalAnswers,
        score: finalScore,
        total_questions: activeQuiz.questions.length,
        time_taken_seconds: 0,
        credits_wagered: isDuel ? WAGER_AMOUNT : 0,
        credits_won: isDuel && pct >= 0.6 ? WAGER_AMOUNT * 2 : 0,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeQuiz, userId]
  );

  if (phase === "lobby") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            <Trophy className="mr-2 inline h-6 w-6 text-amber-500" />
            Quiz Arena
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Test your knowledge, earn credits, and challenge yourself daily.
          </p>
        </div>

        {/* Credit balance */}
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
          <Coins className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            {initialCredits.toLocaleString()} credits available
          </span>
          <span className="ml-auto text-xs text-amber-600 dark:text-amber-500">
            Duel wagер: {WAGER_AMOUNT} credits
          </span>
        </div>

        {/* Quiz cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              whileHover={{ scale: 1.01 }}
              className="card-hover p-5"
              onClick={() => startQuiz(quiz)}
            >
              <div className="mb-3 flex items-start justify-between">
                <span className={cn("badge", QUIZ_TYPE_STYLES[quiz.quiz_type])}>
                  {quiz.quiz_type === "duel" ? "⚔️ Duel" : quiz.quiz_type.charAt(0).toUpperCase() + quiz.quiz_type.slice(1)}
                </span>
                <span className="text-xs text-slate-400">{quiz.difficulty}</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{quiz.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{quiz.subject}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{quiz.questions.length} questions</span>
                {quiz.quiz_type === "duel" ? (
                  <span className="font-medium text-red-500">Wager {WAGER_AMOUNT}cr</span>
                ) : (
                  <span className="font-medium text-emerald-600">+{quiz.questions.length * 10}cr max</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "playing" && activeQuiz) {
    const question: QuizQuestion = activeQuiz.questions[currentQ];
    const totalQ = activeQuiz.questions.length;
    const progressPct = ((currentQ) / totalQ) * 100;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {activeQuiz.title}
            </div>
            <div className="text-xs text-slate-400">
              Question {currentQ + 1} of {totalQ}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-mono dark:bg-slate-800">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className={timeLeft < 30 ? "text-red-500 font-bold" : "text-slate-700 dark:text-slate-300"}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          <motion.div
            className="progress-fill bg-indigo-500"
            animate={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="card p-6"
          >
            <p className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
              {question.text}
            </p>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                let variant = "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
                if (selected !== null) {
                  if (idx === question.correct)
                    variant = "bg-emerald-50 border-emerald-500 dark:bg-emerald-500/10";
                  else if (idx === selected && idx !== question.correct)
                    variant = "bg-red-50 border-red-500 dark:bg-red-500/10";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    disabled={selected !== null}
                    className={cn(
                      "w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition",
                      variant
                    )}
                  >
                    <span className="mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-bold dark:bg-slate-700">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                    {selected !== null && idx === question.correct && (
                      <CheckCircle className="ml-2 inline h-4 w-4 text-emerald-500" />
                    )}
                    {selected === idx && idx !== question.correct && (
                      <XCircle className="ml-2 inline h-4 w-4 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10"
                >
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    Concept Explanation
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {question.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {selected !== null && (
          <div className="flex justify-end">
            <button onClick={nextQuestion} className="btn-primary">
              {currentQ + 1 >= totalQ ? "Finish" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Report phase
  if (phase === "report" && activeQuiz) {
    const pct = Math.round((score / activeQuiz.questions.length) * 100);
    const grade =
      pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good Job! 👍" : "Keep Practicing 📚";

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <div className="mb-4 text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "📖"}</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{grade}</h2>
          <div className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {score}/{activeQuiz.questions.length}
          </div>
          <div className="mt-1 text-sm text-slate-500">{pct}% correct</div>

          {/* Credits */}
          <div className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-lg font-bold",
            creditsChange >= 0
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          )}>
            <Coins className="h-5 w-5" />
            {creditsChange >= 0 ? `+${creditsChange}` : creditsChange} credits
          </div>
        </motion.div>

        {/* Per-question breakdown */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Solution Breakdown</h3>
          <div className="space-y-3">
            {activeQuiz.questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correct;
              return (
                <div key={q.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{q.text}</p>
                      {!isCorrect && (
                        <p className="mt-1 text-xs text-slate-500">
                          Your answer: <span className="text-red-500">{q.options[userAns] ?? "—"}</span>
                          {" · "}Correct: <span className="text-emerald-500">{q.options[q.correct]}</span>
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => setPhase("lobby")} className="btn-secondary w-full justify-center">
          <RotateCcw className="h-4 w-4" />
          Back to Quiz Lobby
        </button>
      </div>
    );
  }

  return null;
}
