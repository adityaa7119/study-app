// components/settings/CommunitySupport.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  HelpCircle,
  Send,
  ExternalLink,
  Sparkles,
  Bot,
  Copy,
  Check,
  Mail,
  ChevronDown,
  Plus,
  ThumbsUp,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
  BookOpen,
  Award,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

interface DoubtPost {
  id: string;
  author: string;
  avatarSeed: string;
  exam: string;
  subject: string;
  title: string;
  content: string;
  upvotes: number;
  hasUpvoted?: boolean;
  repliesCount: number;
  timeAgo: string;
  isResolved?: boolean;
  replies?: {
    id: string;
    author: string;
    avatarSeed: string;
    content: string;
    timeAgo: string;
    isMentor?: boolean;
  }[];
}

const INITIAL_DOUBTS: DoubtPost[] = [
  {
    id: "d1",
    author: "Aarav Sharma",
    avatarSeed: "aarav-eng",
    exam: "First Year (FE)",
    subject: "Engineering Mathematics",
    title: "Tips for Linear Differential Equations & Laplace Transforms?",
    content:
      "Struggling with finding particular integrals for non-homogeneous second-order ODEs. Any standard shortcut table?",
    upvotes: 24,
    repliesCount: 3,
    timeAgo: "2 hours ago",
    isResolved: true,
    replies: [
      {
        id: "r1",
        author: "Priya Nair",
        avatarSeed: "priya-mentor",
        content:
          "For f(x) = e^(ax) * V, use the shifting property D -> D + a! Also practice B.S. Grewal Chapter 13 solved examples.",
        timeAgo: "1 hour ago",
        isMentor: true,
      },
    ],
  },
  {
    id: "d2",
    author: "Sneha Patel",
    avatarSeed: "sneha-eng",
    exam: "Second Year (SE)",
    subject: "Data Structures",
    title: "AVL Tree Rotations: Intuitive trick to remember LL vs LR?",
    content:
      "Can someone share a clear visual way to handle double rotations in height-balanced binary search trees?",
    upvotes: 38,
    repliesCount: 5,
    timeAgo: "5 hours ago",
    isResolved: true,
    replies: [
      {
        id: "r2",
        author: "Rohan Gupta",
        avatarSeed: "rohan-senior",
        content:
          "Remember: An LR rotation is simply a Left rotation on the left child followed by a Right rotation on the root!",
        timeAgo: "3 hours ago",
        isMentor: true,
      },
    ],
  },
  {
    id: "d3",
    author: "Vikram Sengupta",
    avatarSeed: "vikram-eng",
    exam: "Third Year (TE)",
    subject: "Operating Systems",
    title: "Banker's Algorithm Safety State verification shortcut",
    content:
      "Need a fast matrix computation framework for Banker's Algorithm safety checking under semester exam time limits.",
    upvotes: 19,
    repliesCount: 2,
    timeAgo: "1 day ago",
  },
];

const COMMUNITY_CHANNELS = [
  {
    name: "Discord Campus",
    tagline: "Live Voice Study Rooms & Sprints",
    members: "18,400+ aspirants",
    active: "1,420 online",
    badge: "24/7 Voice Rooms",
    url: "https://discord.gg",
    actionText: "Join Server",
  },
  {
    name: "Telegram Quiz Drills",
    tagline: "Daily High-Yield Polls & Notes",
    members: "24,800+ subscribers",
    active: "Daily 9 PM drills",
    badge: "Daily PYQs",
    url: "https://t.me",
    actionText: "Open Channel",
  },
  {
    name: "WhatsApp Study Pods",
    tagline: "Peer Accountability (15 students/pod)",
    members: "420+ active pods",
    active: "Streak verification",
    badge: "Peer Pods",
    url: "#whatsapp-pods",
    actionText: "Request Pod",
  },
  {
    name: "Reddit /r/StudyBuddy",
    tagline: "Strategy Guides & Experience Logs",
    members: "9,200+ members",
    active: "Weekly AMA",
    badge: "Strategy AMAs",
    url: "https://reddit.com",
    actionText: "Visit Subreddit",
  },
];

const FAQS = [
  {
    q: "How do I earn and redeem study credit points?",
    a: "You earn credits by completing focus sessions (+1.5 cr per minute), maintaining daily streaks (+20 cr bonus), and answering quizzes correctly (+10 cr each). You can redeem them in the Settings Credit Shop for Streak Freezes, bonus practice sets, and XP boosts.",
  },
  {
    q: "How does the Focus Shield anti-distraction feature work?",
    a: "When you launch Focus Shield, StudyBuddy detects browser tab switching and window unfocus events. If you switch tabs during a locked session, a penalty warning triggers to keep you disciplined.",
  },
  {
    q: "Can I study together with peer aspirants in a shared room?",
    a: "Yes! Our Discord campus has round-the-clock silent video/voice study rooms sorted by engineering year (FE, SE, TE, BE). You can also apply for a WhatsApp Study Pod to be matched with 10-15 students in your exact engineering year.",
  },
  {
    q: "How fast are community doubts answered?",
    a: "Most doubts receive answers within 30–60 minutes from peer aspirants or community mentors. For instant step-by-step solutions with 0 wait time, you can also use StudyBot AI Tutor right inside the app.",
  },
  {
    q: "How do I report an error in a quiz question or formula card?",
    a: "Click 'Submit Support Ticket' below and select 'Question / Content Error'. Our academic subject experts review and patch question discrepancies within 24 hours.",
  },
];

export default function CommunitySupport() {
  const { openBot, profile } = useAppStore();

  const [examFilter, setExamFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [doubts, setDoubts] = useState<DoubtPost[]>(INITIAL_DOUBTS);
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>("d1");
  const [newReplyText, setNewReplyText] = useState<{ [key: string]: string }>({});

  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [newDoubt, setNewDoubt] = useState({
    title: "",
    exam: profile?.target_exam ?? "First Year (FE)",
    subject: "Engineering Mathematics",
    content: "",
  });

  const [ticket, setTicket] = useState({
    category: "Question / Content Error",
    priority: "Normal",
    subject: "",
    description: "",
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleUpvote = (id: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const hasUpvoted = d.hasUpvoted;
          return {
            ...d,
            upvotes: hasUpvoted ? d.upvotes - 1 : d.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return d;
      })
    );
    toast.success("Feedback recorded!");
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubt.title.trim() || !newDoubt.content.trim()) {
      toast.error("Please fill in both title and doubt description.");
      return;
    }

    const created: DoubtPost = {
      id: "d-" + Date.now(),
      author: profile?.full_name?.trim() || "Aspirant",
      avatarSeed: profile?.avatar_seed || "buddy-" + Date.now(),
      exam: newDoubt.exam,
      subject: newDoubt.subject,
      title: newDoubt.title,
      content: newDoubt.content,
      upvotes: 1,
      hasUpvoted: true,
      repliesCount: 0,
      timeAgo: "Just now",
      replies: [],
    };

    setDoubts([created, ...doubts]);
    setExpandedDoubtId(created.id);
    setIsAskModalOpen(false);
    setNewDoubt({
      title: "",
      exam: profile?.target_exam ?? "First Year (FE)",
      subject: "Engineering Mathematics",
      content: "",
    });
    toast.success("🎉 Doubt published to community! Fellow aspirants will be notified.");
  };

  const handleAddReply = (doubtId: string) => {
    const text = newReplyText[doubtId]?.trim();
    if (!text) return;

    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          const currentReplies = d.replies || [];
          return {
            ...d,
            repliesCount: d.repliesCount + 1,
            replies: [
              ...currentReplies,
              {
                id: "r-" + Date.now(),
                author: profile?.full_name?.trim() || "You",
                avatarSeed: profile?.avatar_seed || "peer",
                content: text,
                timeAgo: "Just now",
              },
            ],
          };
        }
        return d;
      })
    );

    setNewReplyText((prev) => ({ ...prev, [doubtId]: "" }));
    toast.success("Reply added! Thanks for supporting a fellow student.");
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.subject.trim() || !ticket.description.trim()) {
      toast.error("Please complete the subject and description fields.");
      return;
    }

    setTicketSubmitting(true);
    setTimeout(() => {
      const ticketId = "SB-" + Math.floor(10000 + Math.random() * 90000);
      setTicketSubmitting(false);
      setSubmittedTicketId(ticketId);
      toast.success(`Support Ticket #${ticketId} created!`);
    }, 800);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("support@studybuddy.io");
    setCopiedEmail(true);
    toast.success("Email copied to clipboard: support@studybuddy.io");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const filteredDoubts = doubts.filter((d) => {
    const matchExam = examFilter === "All" || d.exam.toLowerCase().includes(examFilter.toLowerCase());
    const matchQuery =
      searchQuery === "" ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchExam && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Community Banner (Warm Golden Hour Study Haven aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2B1810] via-[#3E2216] to-[#1C120C] p-6 text-[#FDF8F2] shadow-xl border border-[#4A2C1C]">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-[#D97D29]/20 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D97D29]/25 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md border border-[#D97D29]/40 text-[#F6ECE0]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#E3A354]" />
                3,842 Aspirants Online
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md text-[#FDF8F2]">
                <Sparkles className="h-3 w-3 text-[#E3A354]" />
                Peer & AI Support
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl font-poppins">
              Community & Peer Support
            </h2>
            <p className="mt-1 text-sm text-[#E8D6C4] max-w-xl font-medium">
              Study together, resolve exam doubts, exchange high-yield notes, and get 24/7 assistance from peers, mentors, and the official StudyBuddy team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D97D29] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#BE6017] active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Ask a Doubt
            </button>
            <button
              onClick={openBot}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white border border-[#E8D6C4]/30 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <Bot className="h-4 w-4 text-[#E3A354]" />
              Ask AI Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Official Community Channels */}
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#D97D29]" />
              Study Circles & Channels
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Connect with fellow aspirants preparing for your target exam.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D97D29]" />
            Verified Student Communities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {COMMUNITY_CHANNELS.map((ch) => (
            <div
              key={ch.name}
              className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4 transition-all hover:border-[#D97D29]/50 hover:bg-[var(--bg-card)] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#D97D29]/15 text-[#D97D29] dark:text-[#E3A354]">
                    {ch.badge}
                  </span>
                  <span className="text-[11px] font-medium text-[#D97D29]">
                    {ch.active}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-[var(--text-primary)] group-hover:text-[#D97D29] transition-colors">
                  {ch.name}
                </h4>
                <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {ch.tagline}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                <span className="text-[11px] text-[var(--text-secondary)] font-medium">{ch.members}</span>
                {ch.url.startsWith("http") ? (
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97D29] hover:underline"
                  >
                    {ch.actionText}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      toast.success(
                        `Match request registered for your engineering year (${profile?.target_exam ?? "First Year (FE)"}). An invitation will be sent to your email!`
                      );
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97D29] hover:underline"
                  >
                    {ch.actionText}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Peer Doubt Forum & Discussions */}
      <section className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#D97D29]" />
              Peer Doubt Arena
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ask doubts, review step-by-step solutions, and collaborate with peers.
            </p>
          </div>

          <button
            onClick={() => setIsAskModalOpen(true)}
            className="btn-primary py-2 text-xs self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Post Doubt
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search doubts by keyword or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["All", "First Year", "Second Year", "Third Year", "Fourth Year"].map((exam) => (
              <button
                key={exam}
                onClick={() => setExamFilter(exam)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition shrink-0",
                  examFilter === exam
                    ? "bg-[#D97D29] text-white shadow-sm"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                )}
              >
                {exam}
              </button>
            ))}
          </div>
        </div>

        {/* Doubts List */}
        <div className="space-y-3">
          {filteredDoubts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
              <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
                No questions found matching your search.
              </p>
              <button
                onClick={() => setIsAskModalOpen(true)}
                className="mt-3 text-xs font-semibold text-[#D97D29] hover:underline"
              >
                Be the first to ask this question →
              </button>
            </div>
          ) : (
            filteredDoubts.map((doubt) => {
              const isExpanded = expandedDoubtId === doubt.id;
              return (
                <div
                  key={doubt.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-[#D97D29]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${doubt.avatarSeed}&backgroundColor=D97D29&textColor=fff`}
                        alt={doubt.author}
                        className="h-8 w-8 shrink-0 rounded-full border border-[#D97D29]/30"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            {doubt.author}
                          </span>
                          <span className="rounded-md bg-[#D97D29]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#D97D29] dark:text-[#E3A354]">
                            {doubt.exam}
                          </span>
                          <span className="rounded-md bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                            {doubt.subject}
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)]">· {doubt.timeAgo}</span>
                        </div>

                        <h4 className="mt-1.5 text-sm font-semibold text-[var(--text-primary)] leading-snug">
                          {doubt.title}
                        </h4>
                        <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                          {doubt.content}
                        </p>
                      </div>
                    </div>

                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(doubt.id)}
                      className={cn(
                        "flex shrink-0 flex-col items-center rounded-xl px-2.5 py-1.5 transition active:scale-90",
                        doubt.hasUpvoted
                          ? "bg-[#D97D29]/20 text-[#D97D29] font-bold"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[#D97D29]"
                      )}
                      title="Upvote / Helpful"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="mt-0.5 text-xs">{doubt.upvotes}</span>
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2.5">
                    <button
                      onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[#D97D29]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {doubt.repliesCount} {doubt.repliesCount === 1 ? "answer" : "answers"}
                      <ChevronDown
                        className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")}
                      />
                    </button>

                    <button
                      onClick={openBot}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97D29] hover:underline"
                    >
                      <Bot className="h-3 w-3" />
                      Solve with StudyBot
                    </button>
                  </div>

                  {/* Expanded Replies & Reply Input */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-3 pt-2 overflow-hidden border-t border-[var(--border)]"
                      >
                        {doubt.replies && doubt.replies.length > 0 ? (
                          <div className="space-y-2">
                            {doubt.replies.map((r) => (
                              <div
                                key={r.id}
                                className="rounded-lg bg-[var(--bg-secondary)]/50 p-3 text-xs"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[var(--text-primary)]">
                                      {r.author}
                                    </span>
                                    {r.isMentor && (
                                      <span className="rounded bg-[#E8D6C4] px-1 py-0.2 text-[9px] font-bold text-[#2B1810]">
                                        MENTOR
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[var(--text-secondary)]">{r.timeAgo}</span>
                                </div>
                                <p className="text-[var(--text-primary)]">{r.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[var(--text-secondary)] italic">
                            No answers yet. Be the first to share an explanation!
                          </p>
                        )}

                        {/* Reply Form */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write an explanation or tip..."
                            value={newReplyText[doubt.id] || ""}
                            onChange={(e) =>
                              setNewReplyText({ ...newReplyText, [doubt.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddReply(doubt.id);
                            }}
                            className="input py-1.5 text-xs flex-1"
                          />
                          <button
                            onClick={() => handleAddReply(doubt.id)}
                            className="btn-primary py-1.5 px-3 text-xs shrink-0"
                          >
                            <Send className="h-3 w-3" />
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Official Helpdesk, Direct Contact & FAQs */}
      <section className="card p-6">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1">
          <HelpCircle className="h-4 w-4 text-[#D97D29]" />
          Helpdesk & Official Support
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Need assistance with your account, app features, or study credits? Our support team is here to help.
        </p>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="flex flex-col items-start p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-card)] hover:border-[#D97D29]/50 transition text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-[#D97D29]/15 text-[#D97D29] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Submit Ticket
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Bug report or feature inquiry
            </span>
          </button>

          <button
            onClick={copyEmail}
            className="flex flex-col items-start p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-card)] hover:border-[#D97D29]/50 transition text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-[#D97D29]/15 text-[#D97D29] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Email Support
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              support@studybuddy.io
            </span>
          </button>

          <button
            onClick={openBot}
            className="flex flex-col items-start p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-card)] hover:border-[#D97D29]/50 transition text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-[#D97D29]/15 text-[#D97D29] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Bot className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              AI Tutor Support
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Instant 24/7 AI assistance
            </span>
          </button>
        </div>

        {/* FAQs Accordion */}
        <div className="border-t border-[var(--border)] pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
            Frequently Asked Questions
          </h4>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-[var(--text-primary)] hover:text-[#D97D29] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3.5 pb-3.5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-2.5"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Guidelines footer */}
        <div className="mt-5 rounded-xl bg-[#D97D29]/10 p-3.5 text-xs text-[var(--text-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#D97D29] shrink-0" />
            <span className="text-[var(--text-primary)]">Community Honor Code: Academic integrity, constructive peer feedback & mutual respect.</span>
          </div>
          <span className="text-[10px] font-semibold text-[#D97D29] shrink-0 ml-2">
            v2.4 Active
          </span>
        </div>
      </section>

      {/* MODAL: Ask a Doubt */}
      <AnimatePresence>
        {isAskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[#D97D29]/15"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#D97D29]" />
                Ask the Aspirant Community
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Post your conceptual doubt or question. Verified aspirants & mentors will respond.
              </p>

              <form onSubmit={handleCreateDoubt} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Question Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How to quickly solve Kirchoff laws loop equations?"
                    value={newDoubt.title}
                    onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Engineering Year
                    </label>
                    <select
                      value={newDoubt.exam}
                      onChange={(e) => setNewDoubt({ ...newDoubt, exam: e.target.value })}
                      className="input text-xs"
                    >
                      <option value="First Year (FE)">First Year (FE)</option>
                      <option value="Second Year (SE)">Second Year (SE)</option>
                      <option value="Third Year (TE)">Third Year (TE)</option>
                      <option value="Fourth Year (BE)">Fourth Year (BE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Subject
                    </label>
                    <select
                      value={newDoubt.subject}
                      onChange={(e) => setNewDoubt({ ...newDoubt, subject: e.target.value })}
                      className="input text-xs"
                    >
                      <option value="Engineering Mathematics">Engineering Mathematics</option>
                      <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                      <option value="Operating Systems & Networks">Operating Systems & Networks</option>
                      <option value="Database Management (DBMS)">Database Management (DBMS)</option>
                      <option value="Digital Electronics">Digital Electronics</option>
                      <option value="Engineering Mechanics / Thermo">Engineering Mechanics / Thermo</option>
                      <option value="Core Engineering / Other">Core Engineering / Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Detailed Explanation or Problem Statement
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mention the specific question, formula, or concept you're stuck on..."
                    value={newDoubt.content}
                    onChange={(e) => setNewDoubt({ ...newDoubt, content: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAskModalOpen(false)}
                    className="btn-secondary text-xs py-2"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2">
                    <Send className="h-3.5 w-3.5" />
                    Publish Question
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Support Ticket */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsTicketModalOpen(false);
                  setSubmittedTicketId(null);
                }}
                className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[#D97D29]/15"
              >
                <X className="h-4 w-4" />
              </button>

              {submittedTicketId ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-[#D97D29]/20 text-[#D97D29] flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Ticket Submitted Successfully!
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    Your reference number is{" "}
                    <span className="font-mono font-bold text-[#D97D29]">
                      #{submittedTicketId}
                    </span>
                    . We have notified our engineering team and will follow up at {profile?.email || "your registered email"}.
                  </p>
                  <button
                    onClick={() => {
                      setIsTicketModalOpen(false);
                      setSubmittedTicketId(null);
                    }}
                    className="btn-primary text-xs py-2 px-5 mx-auto"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-[#D97D29]" />
                    Submit Support Request
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Direct ticket to the StudyBuddy engineering & academic content team.
                  </p>

                  <form onSubmit={handleTicketSubmit} className="mt-4 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                          Category
                        </label>
                        <select
                          value={ticket.category}
                          onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                          className="input text-xs"
                        >
                          <option value="Question / Content Error">Question / Content Error</option>
                          <option value="Bug Report">Bug Report</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Credits & Shop Issue">Credits & Shop Issue</option>
                          <option value="Other">Other Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                          Priority
                        </label>
                        <select
                          value={ticket.priority}
                          onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                          className="input text-xs"
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of the issue..."
                        value={ticket.subject}
                        onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                        className="input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                        Description & Details
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Please describe what happened, expected behavior, or steps to reproduce..."
                        value={ticket.description}
                        onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                        className="input text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsTicketModalOpen(false)}
                        className="btn-secondary text-xs py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={ticketSubmitting}
                        className="btn-primary text-xs py-2"
                      >
                        {ticketSubmitting ? "Submitting..." : "Send Ticket"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
