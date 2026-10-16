// lib/types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_seed: string;
          target_exam: string;
          daily_target_hours: number;
          exam_date: string | null;
          streak_count: number;
          longest_streak: number;
          credit_points: number;
          total_focus_minutes: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          color: string;
          is_completed: boolean;
          completed_at: string | null;
          week_start_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schedules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["schedules"]["Insert"]>;
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          schedule_id: string | null;
          subject: string;
          duration_minutes: number;
          actual_minutes: number;
          completed: boolean;
          quit_early: boolean;
          penalty_points: number;
          tab_switches: number;
          started_at: string;
          ended_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["focus_sessions"]["Row"], "id" | "started_at">;
        Update: Partial<Database["public"]["Tables"]["focus_sessions"]["Insert"]>;
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          subject: string;
          quiz_type: "daily" | "weekly" | "duel" | "practice";
          difficulty: "easy" | "medium" | "hard";
          questions: QuizQuestion[];
          created_at: string;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["quizzes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Insert"]>;
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          answers: number[];
          score: number;
          total_questions: number;
          time_taken_seconds: number;
          credits_wagered: number;
          credits_won: number;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_attempts"]["Row"], "id" | "completed_at">;
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          title: string;
          subject: string;
          chapter: string;
          tags: string[];
          content: string;
          note_type: "markdown" | "formula" | "concept" | "summary";
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          balance_after: number;
          description: string;
          transaction_type: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
export type FocusSession = Database["public"]["Tables"]["focus_sessions"]["Row"];
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export type Subject = "Physics" | "Chemistry" | "Mathematics" | "Biology" | "English" | "History" | "Other";
export const SUBJECTS: Subject[] = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "History", "Other"];

export const SUBJECT_COLORS: Record<string, string> = {
  Physics: "#6366f1",
  Chemistry: "#f59e0b",
  Mathematics: "#10b981",
  Biology: "#3b82f6",
  English: "#ec4899",
  History: "#8b5cf6",
  Other: "#6b7280",
};
