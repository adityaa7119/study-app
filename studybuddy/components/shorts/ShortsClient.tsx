// components/shorts/ShortsClient.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  HelpCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  Coins,
  Send,
  X,
  Film,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Layers,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  Youtube,
  GraduationCap,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { EDUCATIONAL_SHORTS } from "@/lib/data/educationalShorts";
import { extractYouTubeId, type EducationalShort, type ShortSubject } from "@/lib/types/shorts";

const SUBJECT_FILTERS: (ShortSubject | "My Linked Videos" | "Saved")[] = [
  "All",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Biology & Medical",
  "Study Hacks",
  "My Linked Videos",
  "Saved",
];

export default function ShortsClient() {
  const { updateCredits, openBot, profile } = useAppStore();

  // Custom User-Linked Shorts (persisted in localStorage)
  const [customShorts, setCustomShorts] = useState<EducationalShort[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("studybuddy_custom_shorts");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // State
  const [activeSubject, setActiveSubject] = useState<ShortSubject | "My Linked Videos" | "Saved">("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [savedShorts, setSavedShorts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    EDUCATIONAL_SHORTS.forEach((s) => {
      counts[s.id] = s.likes;
    });
    return counts;
  });

  // Drawers & Modals
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<Record<string, number>>({});
  const [quizRewardsClaimed, setQuizRewardsClaimed] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [commentsByShort, setCommentsByShort] = useState(() => {
    const map: Record<string, typeof EDUCATIONAL_SHORTS[0]["comments"]> = {};
    EDUCATIONAL_SHORTS.forEach((s) => {
      map[s.id] = s.comments;
    });
    return map;
  });

  // Add YouTube Short Form State
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addSubject, setAddSubject] = useState<EducationalShort["subject"]>("Computer Science");
  const [addSummary, setAddSummary] = useState("");
  const [addFormula, setAddFormula] = useState("");
  const [addQuizQ, setAddQuizQ] = useState("");
  const [addQuizCorrect, setAddQuizCorrect] = useState("");
  const [addQuizWrong1, setAddQuizWrong1] = useState("");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // Combined shorts list (User linked videos first)
  const allShorts = useMemo(() => {
    return [...customShorts, ...EDUCATIONAL_SHORTS];
  }, [customShorts]);

  // Filtered list based on active tab
  const filteredShorts = useMemo(() => {
    return allShorts.filter((short) => {
      if (activeSubject === "Saved") return savedShorts[short.id];
      if (activeSubject === "My Linked Videos") return short.isCustom;
      if (activeSubject === "All") return true;
      return short.subject === activeSubject;
    });
  }, [allShorts, activeSubject, savedShorts]);

  const activeShort = filteredShorts[currentIndex] || filteredShorts[0] || allShorts[0];

  // Auto-reset index if filtered list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeSubject]);

  // Up/Down Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < filteredShorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info("You've reached the end of this educational playlist! 🎓");
    }
  }, [currentIndex, filteredShorts.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard Navigation: Up/Down arrow keys or W/S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isQuizOpen || isAddModalOpen) return;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, isCommentsOpen, isQuizOpen, isAddModalOpen]);

  // Like Toggle
  const handleToggleLike = (shortId: string) => {
    setLikedShorts((prev) => {
      const isLiked = !prev[shortId];
      setLikeCounts((c) => ({
        ...c,
        [shortId]: (c[shortId] || 100) + (isLiked ? 1 : -1),
      }));
      if (isLiked) {
        toast.success("Added to liked educational shorts!");
      }
      return { ...prev, [shortId]: isLiked };
    });
  };

  // Save/Bookmark Toggle
  const handleToggleSave = (shortId: string) => {
    setSavedShorts((prev) => {
      const isSaved = !prev[shortId];
      toast.success(
        isSaved ? "Saved to My Revision List! 📖" : "Removed from Revision List"
      );
      return { ...prev, [shortId]: isSaved };
    });
  };

  // Share
  const handleShare = (short: EducationalShort) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://www.youtube.com/watch?v=${short.youtubeId}`
      );
      toast.success("YouTube link copied to clipboard!");
    }
  };

  // Post comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      user: profile?.full_name ? `${profile.full_name} (Student)` : "You (Student)",
      avatar: profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "Y",
      time: "Just now",
      text: newCommentText.trim(),
      likes: 1,
    };

    setCommentsByShort((prev) => ({
      ...prev,
      [activeShort.id]: [newComment, ...(prev[activeShort.id] || [])],
    }));

    setNewCommentText("");
    toast.success("Your peer note / question was posted!");
  };

  // Quiz Answer Select
  const handleAnswerQuiz = (optionIdx: number) => {
    if (quizAnswered[activeShort.id] !== undefined) return;

    setQuizAnswered((prev) => ({
      ...prev,
      [activeShort.id]: optionIdx,
    }));

    const isCorrect = optionIdx === activeShort.quickQuiz.correctIndex;
    if (isCorrect && !quizRewardsClaimed[activeShort.id]) {
      setQuizRewardsClaimed((prev) => ({ ...prev, [activeShort.id]: true }));
      updateCredits(activeShort.quickQuiz.rewardCredits);
      toast.success(
        `Correct! +${activeShort.quickQuiz.rewardCredits} Academic Credits earned! 🎓`
      );
    } else if (!isCorrect) {
      toast.error("Not quite! Check the concept explanation below.");
    }
  };

  // Auto-fetch YouTube title via oEmbed
  const handleUrlBlur = async () => {
    const ytid = extractYouTubeId(addUrl);
    if (!ytid || addTitle) return;

    setIsFetchingMeta(true);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytid}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.title && !addTitle) {
          setAddTitle(data.title);
        }
        if (data.author_name && !addSummary) {
          setAddSummary(`Educational video lesson by ${data.author_name}`);
        }
      }
    } catch {}
    setIsFetchingMeta(false);
  };

  // Add Custom Educational Video Form Submit
  const handleAddCustomShort = (e: React.FormEvent) => {
    e.preventDefault();
    const ytid = extractYouTubeId(addUrl);

    if (!ytid) {
      toast.error("Please enter a valid YouTube Short or Video URL.");
      return;
    }

    const newShort: EducationalShort = {
      id: `custom-short-${Date.now()}`,
      title: addTitle.trim() || "Educational Concept Lesson",
      subject: addSubject,
      creator: {
        name: profile?.full_name ? `${profile.full_name} (Shared)` : "Peer Student",
        handle: `@${profile?.full_name?.toLowerCase().replace(/\s+/g, "") || "student"}`,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        verified: false,
      },
      summary: addSummary.trim() || "High-yield educational video lesson.",
      formula: addFormula.trim() || null,
      conceptExplanation: addSummary.trim() || "Student recommended concept breakdown.",
      youtubeId: ytid,
      isCustom: true,
      duration: "0:59",
      likes: 1,
      views: "1",
      saves: 0,
      tags: [`#${addSubject.replace(/\s+/g, "")}`, "#PeerCurated", "#STEM"],
      quickQuiz: {
        question: addQuizQ.trim() || `What is the core takeaway of this ${addSubject} concept?`,
        options: [
          addQuizCorrect.trim() || "Key fundamental law or formula demonstrated in this video",
          addQuizWrong1.trim() || "An unproven speculation without empirical evidence",
          "Irrelevant assumption not discussed in the lesson",
          "A legacy formula deprecated in modern engineering",
        ],
        correctIndex: 0,
        explanation: "Consistent with the educational concept demonstrated in this video.",
        rewardCredits: 10,
      },
      comments: [
        {
          id: `c-init-${Date.now()}`,
          user: profile?.full_name || "You",
          avatar: profile?.full_name?.charAt(0).toUpperCase() || "Y",
          time: "Just now",
          text: "Linked this educational short for quick exam preparation!",
          likes: 1,
        },
      ],
    };

    const updated = [newShort, ...customShorts];
    setCustomShorts(updated);
    try {
      localStorage.setItem("studybuddy_custom_shorts", JSON.stringify(updated));
    } catch {}

    // Reset Form
    setAddUrl("");
    setAddTitle("");
    setAddSummary("");
    setAddFormula("");
    setAddQuizQ("");
    setAddQuizCorrect("");
    setAddQuizWrong1("");
    setIsAddModalOpen(false);

    // Switch to All or My Linked Videos and play the new video
    setActiveSubject("All");
    setCurrentIndex(0);
    toast.success("Educational YouTube video linked successfully! 🎬");
  };

  return (
    <div className="relative flex flex-col h-[calc(100dvh-8.5rem)] sm:h-[calc(100vh-6rem)] max-w-5xl mx-auto overflow-hidden font-poppins text-white">
      {/* ========================================================================= */}
      {/* 1. TOP CURATED EDUCATIONAL SUBJECT CHIPS & ADD SHORT BUTTON */}
      {/* ========================================================================= */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-black/30 backdrop-blur-md z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D97D29]/20 border border-[#D97D29]/30 text-[#E3A354] text-xs font-semibold shrink-0">
            <Film className="h-3.5 w-3.5" />
            StudyShorts
          </div>

          {SUBJECT_FILTERS.map((subj) => (
            <button
              key={subj}
              onClick={() => setActiveSubject(subj)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition shrink-0 whitespace-nowrap",
                activeSubject === subj
                  ? "bg-[#D97D29] text-white font-semibold shadow-sm"
                  : "bg-white/10 text-[#E8D6C4] hover:bg-white/20 hover:text-white"
              )}
            >
              {subj}
              {subj === "Saved" && ` (${Object.values(savedShorts).filter(Boolean).length})`}
              {subj === "My Linked Videos" && ` (${customShorts.length})`}
            </button>
          ))}
        </div>

        {/* Link YouTube Short Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white text-xs font-semibold shadow-md transition active:scale-95"
            title="Link an educational YouTube Short"
          >
            <Plus className="h-3.5 w-3.5" />
            <Youtube className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Link YouTube Short</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-[#E3A354] bg-[#D97D29]/15 border border-[#D97D29]/25 rounded-full px-2.5 py-1">
            <Sparkles className="h-3 w-3" />
            <span>100% Educational Only</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SHORTS PLAYER VIEWPORT (ACTUAL YOUTUBE VIDEO PLAYER) */}
      {/* ========================================================================= */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4">
        {filteredShorts.length === 0 ? (
          <div className="text-center p-8 text-[#E8D6C4] apple-glass-card max-w-md mx-auto rounded-3xl">
            <Film className="h-12 w-12 mx-auto text-[#E3A354] mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white font-poppins">No Shorts Found</h3>
            <p className="text-xs text-[#E8D6C4] mt-1">
              {activeSubject === "Saved"
                ? "Bookmark any educational short to save key formulas and notes for quick revision."
                : "No educational videos linked yet in this category. Click '+ Link YouTube Short' to add one!"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setActiveSubject("All")}
                className="btn-primary text-xs"
              >
                Browse All Educational Shorts
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15"
              >
                + Link a Video
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[420px] h-full max-h-[740px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black flex flex-col justify-between select-none">
            {/* Real Playable YouTube Video Layer (Iframe Embed) */}
            <div className="absolute inset-0 bg-black overflow-hidden">
              <iframe
                key={activeShort.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${activeShort.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&loop=1&playlist=${activeShort.youtubeId}&rel=0&modestbranding=1&playsinline=1`}
                title={activeShort.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>

            {/* TOP HEADER OVERLAY INSIDE REEL */}
            <div className="relative z-20 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
              <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E3A354] animate-pulse" />
                {activeShort.subject}
              </span>

              <div className="flex items-center gap-2">
                {/* Mute/Unmute audio button */}
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition"
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-[#E3A354]" />
                  )}
                </button>

                {/* Index counter */}
                <span className="font-mono text-xs text-white/90 bg-black/60 px-2.5 py-1 rounded-full border border-white/15">
                  {currentIndex + 1}/{filteredShorts.length}
                </span>
              </div>
            </div>

            {/* RIGHT SIDE VERTICAL ACTION RAIL */}
            <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-3.5 pointer-events-auto">
              {/* Like Button */}
              <button
                onClick={() => handleToggleLike(activeShort.id)}
                className="group flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition"
                title="Like this concept"
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition shadow-lg",
                    likedShorts[activeShort.id]
                      ? "bg-red-500 text-white border-red-400"
                      : "bg-black/60 text-white group-hover:bg-black/80"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition",
                      likedShorts[activeShort.id] ? "fill-white" : ""
                    )}
                  />
                </div>
                <span className="text-[10px] font-semibold text-white/90">
                  {(likeCounts[activeShort.id] || activeShort.likes).toLocaleString()}
                </span>
              </button>

              {/* Discussion / Comments Drawer Trigger */}
              <button
                onClick={() => setIsCommentsOpen(true)}
                className="group flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition"
                title="Peer Notes & Questions"
              >
                <div className="h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-black/80 transition shadow-lg">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-white/90">
                  {commentsByShort[activeShort.id]?.length || 0}
                </span>
              </button>

              {/* Quick Concept Quiz ("Test Yourself" +10cr) */}
              <button
                onClick={() => setIsQuizOpen(true)}
                className="group flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition relative"
                title="10-Second Concept Quiz (+10 credits)"
              >
                <div className="h-11 w-11 rounded-full bg-[#D97D29] backdrop-blur-md border border-[#E3A354]/60 flex items-center justify-center text-white group-hover:bg-[#b8631b] shadow-lg shadow-[#D97D29]/40 transition">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-[9px] font-bold text-[#E3A354] tracking-wider uppercase">
                  Quiz
                </span>
                {quizRewardsClaimed[activeShort.id] && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
              </button>

              {/* Ask StudyBot AI About This Short */}
              <button
                onClick={() => openBot()}
                className="group flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition"
                title="Ask AI Tutor about this concept"
              >
                <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-[#E3A354] group-hover:bg-white/30 transition shadow-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold text-[#E8D6C4] tracking-wider uppercase">
                  AI Tutor
                </span>
              </button>

              {/* Save to Revision List */}
              <button
                onClick={() => handleToggleSave(activeShort.id)}
                className="group flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition"
                title={savedShorts[activeShort.id] ? "Saved in Revision List" : "Save to Revision List"}
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition shadow-lg",
                    savedShorts[activeShort.id]
                      ? "bg-[#E3A354] text-black border-[#E3A354]"
                      : "bg-black/60 text-white group-hover:bg-black/80"
                  )}
                >
                  <Bookmark
                    className={cn(
                      "h-5 w-5 transition",
                      savedShorts[activeShort.id] ? "fill-black" : ""
                    )}
                  />
                </div>
                <span className="text-[10px] font-semibold text-white/90">Save</span>
              </button>

              {/* Share */}
              <button
                onClick={() => handleShare(activeShort)}
                className="group flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition"
                title="Share video link"
              >
                <div className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-black/80 transition">
                  <Share2 className="h-4 w-4" />
                </div>
              </button>
            </div>

            {/* BOTTOM OVERLAY: TITLE, CREATOR & FORMULA */}
            <div className="relative z-20 p-4 pt-10 pb-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-auto">
              {/* Creator info */}
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={activeShort.creator.avatar}
                  alt={activeShort.creator.name}
                  className="h-7 w-7 rounded-full object-cover border border-[#E3A354]"
                />
                <span className="text-xs font-bold text-white drop-shadow">
                  {activeShort.creator.name}
                </span>
                {activeShort.creator.verified && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
                )}
                {activeShort.creator.subscribers && (
                  <span className="text-[10px] text-white/60">
                    · {activeShort.creator.subscribers}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
                {activeShort.title}
              </h2>

              {/* Formula Badge (if available) */}
              {activeShort.formula && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-md px-2.5 py-1 border border-white/20 text-xs font-mono font-semibold text-[#E3A354] shadow-sm">
                  <span>📐</span>
                  <span>{activeShort.formula}</span>
                </div>
              )}

              {/* Concept summary toggle */}
              <p className="text-xs text-[#E8D6C4]/90 mt-1 line-clamp-2 leading-relaxed">
                {activeShort.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeShort.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-medium text-[#E3A354] drop-shadow">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* NEXT / PREV FLOATING NAVIGATION BUTTONS */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none shadow-xl"
                title="Previous Short (Up Arrow / W)"
              >
                <ChevronUp className="h-5 w-5" />
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === filteredShorts.length - 1}
                className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none shadow-xl"
                title="Next Short (Down Arrow / S)"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PEER DISCUSSION / COMMENTS SLIDE-UP DRAWER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCommentsOpen && activeShort && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg h-[80vh] sm:h-[650px] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/20 bg-[#1D1612]/95 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#E3A354]" />
                  <h3 className="text-sm font-bold text-white">
                    Peer Discussion & Notes ({commentsByShort[activeShort.id]?.length || 0})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-xl text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {(commentsByShort[activeShort.id] || []).map((comm) => (
                  <div key={comm.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#D97D29]/30 border border-[#E3A354]/40 flex items-center justify-center font-bold text-[10px] text-[#E3A354]">
                          {comm.avatar}
                        </div>
                        <span className="font-semibold text-white">{comm.user}</span>
                      </div>
                      <span className="text-[10px] text-white/50">{comm.time}</span>
                    </div>
                    <p className="text-[#E8D6C4]/90 pl-8 leading-relaxed">{comm.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="border-t border-white/10 p-3 bg-black/40 flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share an exam tip, question, or note..."
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E3A354]"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#D97D29] hover:bg-[#b8631b] disabled:opacity-40 text-white font-semibold text-xs transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. QUICK CONCEPT QUIZ MODAL ("TEST YOURSELF" +10 CR) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isQuizOpen && activeShort && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#1D1612]/95 shadow-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#D97D29]/20 border border-[#D97D29]/40 flex items-center justify-center text-[#E3A354]">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">10-Second Concept Check</h3>
                    <span className="text-[10px] text-[#E3A354] font-semibold">
                      Earn +{activeShort.quickQuiz.rewardCredits} Academic Credits
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsQuizOpen(false)} className="p-1 text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs font-semibold text-white/90 mb-4 leading-relaxed">
                {activeShort.quickQuiz.question}
              </p>

              <div className="space-y-2 mb-4">
                {activeShort.quickQuiz.options.map((opt, idx) => {
                  const answeredIdx = quizAnswered[activeShort.id];
                  const hasAnswered = answeredIdx !== undefined;
                  const isSelected = answeredIdx === idx;
                  const isCorrectOption = idx === activeShort.quickQuiz.correctIndex;

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleAnswerQuiz(idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-start gap-2.5",
                        !hasAnswered && "border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#E3A354]",
                        hasAnswered && isCorrectOption && "border-emerald-500 bg-emerald-500/20 text-emerald-200",
                        hasAnswered && isSelected && !isCorrectOption && "border-red-500 bg-red-500/20 text-red-200"
                      )}
                    >
                      <span className="h-5 w-5 rounded-full border border-white/30 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {quizAnswered[activeShort.id] !== undefined && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold text-[#E3A354] block mb-1">Concept Takeaway:</span>
                  <p className="text-white/80 leading-relaxed">{activeShort.quickQuiz.explanation}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#D97D29] hover:bg-[#b8631b] text-white text-xs font-semibold"
                >
                  Close Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. LINK YOUTUBE SHORT / VIDEO MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#1D1612]/95 shadow-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Youtube className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Link Educational YouTube Short</h3>
                    <p className="text-[11px] text-[#E8D6C4]/80">
                      Strictly educational content (STEM, Engineering, Study Techniques)
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomShort} className="space-y-3.5">
                {/* YouTube URL input */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                    YouTube Short / Video URL or ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={addUrl}
                      onChange={(e) => setAddUrl(e.target.value)}
                      onBlur={handleUrlBlur}
                      placeholder="https://www.youtube.com/shorts/... or https://youtu.be/..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E3A354]"
                    />
                    {isFetchingMeta && (
                      <span className="absolute right-3 top-2.5 text-[10px] text-[#E3A354] animate-pulse">
                        Fetching title...
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                      Concept Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      placeholder="e.g. Bernoulli Principle in Aviation"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E3A354]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                      Academic Subject *
                    </label>
                    <select
                      value={addSubject}
                      onChange={(e) => setAddSubject(e.target.value as EducationalShort["subject"])}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E3A354]"
                    >
                      <option value="Computer Science">Computer Science & Algorithms</option>
                      <option value="Mathematics">Mathematics & Calculus</option>
                      <option value="Physics">Physics & Engineering Mechanics</option>
                      <option value="Chemistry">Chemistry & Material Science</option>
                      <option value="Biology & Medical">Biology & Medical</option>
                      <option value="Study Hacks">Study Hacks & Cognitive Techniques</option>
                    </select>
                  </div>
                </div>

                {/* Key Formula (optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                    Key Formula or Law (Optional)
                  </label>
                  <input
                    type="text"
                    value={addFormula}
                    onChange={(e) => setAddFormula(e.target.value)}
                    placeholder="e.g. P + 1/2 ρ v² + ρ g h = constant"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-white/40 focus:outline-none focus:border-[#E3A354]"
                  />
                </div>

                {/* Summary / Takeaway */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#E8D6C4] mb-1">
                    Concept Summary & Key Takeaway
                  </label>
                  <textarea
                    rows={2}
                    value={addSummary}
                    onChange={(e) => setAddSummary(e.target.value)}
                    placeholder="Brief 1-2 sentence explanation of why this concept matters..."
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E3A354] resize-none"
                  />
                </div>

                {/* Policy Warning */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                  ⚠️ <strong>Academic Policy:</strong> Only link verified educational lessons, scientific demos, or study techniques. Non-educational entertainment will be rejected.
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg transition active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Study Shorts</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
