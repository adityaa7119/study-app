// components/library/LibraryClient.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Pin, Tag, X, BookMarked, FileText, Lightbulb } from "lucide-react";
import type { Note } from "@/lib/types/database";
import { SUBJECTS } from "@/lib/types/database";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Props {
  notes: Note[];
}

const NOTE_TYPE_ICONS = {
  markdown: FileText,
  formula: BookMarked,
  concept: Lightbulb,
  summary: BookOpen,
};

const NOTE_TYPE_COLORS = {
  markdown: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  formula: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  concept: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  summary: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

export default function LibraryClient({ notes }: Props) {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.chapter.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        n.content.toLowerCase().includes(q);
      const matchSubject = subjectFilter === "All" || n.subject === subjectFilter;
      const matchType = typeFilter === "All" || n.note_type === typeFilter;
      return matchQuery && matchSubject && matchType;
    });
  }, [notes, query, subjectFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          <BookOpen className="mr-2 inline h-6 w-6 text-indigo-500" />
          Concept Library
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Searchable formula cards, markdown notes, and concept summaries.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-11"
          placeholder="Search by title, subject, chapter, tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Subject filter */}
        {["All", ...SUBJECTS].map((s) => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              subjectFilter === s
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {s}
          </button>
        ))}
        <div className="mx-2 self-center border-l border-slate-200 dark:border-slate-700 h-5" />
        {/* Type filter */}
        {["All", "formula", "markdown", "concept", "summary"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              typeFilter === t
                ? "bg-violet-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">{filtered.length} resource{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((note) => {
          const TypeIcon = NOTE_TYPE_ICONS[note.note_type];
          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-hover p-5"
              onClick={() => setActiveNote(note)}
            >
              <div className="mb-3 flex items-start justify-between">
                <span className={cn("badge", NOTE_TYPE_COLORS[note.note_type])}>
                  <TypeIcon className="h-3 w-3" />
                  {note.note_type}
                </span>
                {note.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{note.title}</h3>
              <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">{note.subject}</p>
              {note.chapter && (
                <p className="text-xs text-slate-400">{note.chapter}</p>
              )}

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs text-slate-400">+{note.tags.length - 3}</span>
                )}
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">No resources match your search</p>
          </div>
        )}
      </div>

      {/* Note Viewer Modal */}
      <AnimatePresence>
        {activeNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
            onClick={(e) => e.target === e.currentTarget && setActiveNote(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeNote.title}</h2>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {activeNote.subject} · {activeNote.chapter}
                  </p>
                </div>
                <button onClick={() => setActiveNote(null)}>
                  <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
                <ReactMarkdown>{activeNote.content}</ReactMarkdown>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {activeNote.tags.map((tag) => (
                  <span key={tag} className="badge bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
