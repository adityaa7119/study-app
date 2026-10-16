// components/settings/AvatarPickerModal.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Check,
  Sparkles,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { PRESET_AVATARS, getAvatarUrl, type PresetAvatar } from "@/lib/constants/avatars";
import { useAppStore } from "@/lib/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelect: (newAvatar: string) => void;
  studentName?: string;
}

export default function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar,
  onSelect,
  studentName = "Student",
}: AvatarPickerModalProps) {
  const { profile, setProfile } = useAppStore();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filtered preset list
  const filteredAvatars = PRESET_AVATARS.filter((avatar) => {
    if (filterCategory === "All") return true;
    return avatar.category === filterCategory;
  });

  // Handle local image file upload & resize via HTML5 canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large (max 5MB).");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to 320x320 max for optimal database & rendering performance
        const canvas = document.createElement("canvas");
        const maxDim = 320;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/png", 0.92);
          setSelectedAvatar(dataUrl);
          setIsProcessing(false);
          toast.success("Custom photo loaded! Click 'Save Profile Picture' to apply.");
        } else {
          setSelectedAvatar(event.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        toast.error("Failed to process the uploaded photo.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setSelectedAvatar(url);
    setIsUrlInputOpen(false);
    toast.success("Custom photo link applied! Click 'Save' to finalize.");
  };

  // Save selected avatar
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      if (profile) {
        // Update Supabase if authenticated
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from("profiles")
            .update({ avatar_seed: selectedAvatar, updated_at: new Date().toISOString() })
            .eq("id", user.id);
        }

        // Update local app state
        setProfile({
          ...profile,
          avatar_seed: selectedAvatar,
        });
      }

      onSelect(selectedAvatar);
      toast.success("Profile picture updated successfully! ✨");
      onClose();
    } catch {
      // Fallback
      onSelect(selectedAvatar);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const isCustomPhoto =
    selectedAvatar.startsWith("data:image/") ||
    (selectedAvatar.startsWith("http") && !selectedAvatar.includes("dicebear.com"));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-white/20 bg-[#1D1612]/95 text-white shadow-2xl overflow-hidden font-poppins"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/30">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-[#D97D29]/20 border border-[#D97D29]/30 flex items-center justify-center text-[#E3A354]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Choose Profile Picture
                </h2>
                <p className="text-[11px] text-[#E8D6C4]/80">
                  Select an academic illustrated avatar or upload your own photo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 1. Current Live Preview Banner */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="relative group shrink-0">
                <img
                  src={getAvatarUrl(selectedAvatar, studentName)}
                  alt="Avatar Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-[#E3A354] shadow-lg shadow-[#D97D29]/20 bg-black/40"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-medium transition"
                  title="Upload New Photo"
                >
                  <Upload className="h-4 w-4 mb-0.5" />
                  Replace
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-sm font-semibold text-white">{studentName}</h3>
                  {isCustomPhoto ? (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Custom Photo
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#D97D29]/20 border border-[#D97D29]/30 px-2 py-0.5 text-[10px] font-bold text-[#E3A354]">
                      Illustrated Avatar
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#E8D6C4]/80 mt-1">
                  This picture appears on your dashboard, study streaks, discussions, and quiz leaderboard.
                </p>

                {/* Upload Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#E3A354]" />
                    <span>Upload Custom Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-[#E8D6C4] transition"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Paste Image Link</span>
                  </button>

                  {isCustomPhoto && (
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar("/avatars/avatar-1.png")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/15 transition"
                      title="Reset to default preset avatar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Custom URL Drawer */}
            {isUrlInputOpen && (
              <form onSubmit={handleApplyUrl} className="flex gap-2 p-3 rounded-2xl bg-black/40 border border-white/10">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E3A354]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#D97D29] hover:bg-[#b8631b] text-white text-xs font-semibold transition"
                >
                  Apply
                </button>
              </form>
            )}

            {/* 2. Preset Avatars Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#E8D6C4] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#E3A354]" />
                  <span>Choose from Academic Avatars (16)</span>
                </h3>

                {/* Categories */}
                <div className="flex gap-1">
                  {["All", "Student Avatars", "Academic Badges"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterCategory(cat)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition",
                        filterCategory === cat
                          ? "bg-[#D97D29] text-white"
                          : "bg-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4x4 Grid of Avatars */}
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4 p-2 rounded-2xl bg-black/25 border border-white/10">
                {filteredAvatars.map((avatar) => {
                  const isSelected =
                    selectedAvatar === avatar.id ||
                    selectedAvatar === avatar.url ||
                    (!isCustomPhoto && selectedAvatar.endsWith(avatar.id + ".png"));

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={cn(
                        "group relative flex flex-col items-center p-2 rounded-2xl transition duration-200",
                        isSelected
                          ? "bg-[#D97D29]/25 ring-2 ring-[#E3A354] shadow-md shadow-[#D97D29]/20"
                          : "hover:bg-white/10"
                      )}
                    >
                      <div className="relative">
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="h-16 w-16 sm:h-18 sm:w-18 rounded-full object-cover transition-transform group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#E3A354] border-2 border-[#1D1612] flex items-center justify-center text-black shadow-sm">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="mt-1.5 text-[10px] font-medium text-white/80 group-hover:text-white truncate max-w-[80px]">
                        {avatar.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-black/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D97D29] to-[#E3A354] hover:opacity-95 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-[#D97D29]/30 transition disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Profile Picture</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
