// lib/constants/avatars.ts

export interface PresetAvatar {
  id: string;
  name: string;
  category: "Student Avatars" | "Academic Badges";
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "avatar-1", name: "Book Scholar", category: "Student Avatars", url: "/avatars/avatar-1.png" },
  { id: "avatar-2", name: "Deep Focus Hoodie", category: "Student Avatars", url: "/avatars/avatar-2.png" },
  { id: "avatar-3", name: "Coding & Research", category: "Student Avatars", url: "/avatars/avatar-3.png" },
  { id: "avatar-4", name: "Audio Study Flow", category: "Student Avatars", url: "/avatars/avatar-4.png" },
  { id: "avatar-5", name: "Warm Reading", category: "Student Avatars", url: "/avatars/avatar-5.png" },
  { id: "avatar-6", name: "Campus Stride", category: "Student Avatars", url: "/avatars/avatar-6.png" },
  { id: "avatar-7", name: "Quiet Study", category: "Student Avatars", url: "/avatars/avatar-7.png" },
  { id: "avatar-8", name: "Graduation Cap", category: "Academic Badges", url: "/avatars/avatar-8.png" },
  { id: "avatar-9", name: "Engineering Thinker", category: "Student Avatars", url: "/avatars/avatar-9.png" },
  { id: "avatar-10", name: "Morning Lecture", category: "Student Avatars", url: "/avatars/avatar-10.png" },
  { id: "avatar-11", name: "Semester Notes", category: "Student Avatars", url: "/avatars/avatar-11.png" },
  { id: "avatar-12", name: "Weekend Scholar", category: "Student Avatars", url: "/avatars/avatar-12.png" },
  { id: "avatar-13", name: "Lo-Fi Music Focus", category: "Student Avatars", url: "/avatars/avatar-13.png" },
  { id: "avatar-14", name: "White Hoodie", category: "Student Avatars", url: "/avatars/avatar-14.png" },
  { id: "avatar-15", name: "Book Stacks", category: "Academic Badges", url: "/avatars/avatar-15.png" },
  { id: "avatar-16", name: "Minimalist Scholar", category: "Academic Badges", url: "/avatars/avatar-16.png" },
];

/**
 * Universal Avatar URL resolver. Supports:
 * - Local preset avatars (/avatars/avatar-1.png ... avatar-16.png)
 * - Base64 data URLs for user custom uploads (data:image/...)
 * - Web URLs (https://...)
 * - Preset IDs ('avatar-1' ... 'avatar-16')
 * - Legacy DiceBear seed fallback
 */
export function getAvatarUrl(seedOrUrl?: string | null, nameFallback = "Student"): string {
  if (!seedOrUrl || seedOrUrl.trim() === "") {
    return "/avatars/avatar-1.png";
  }

  const trimmed = seedOrUrl.trim();

  // Preset ID directly provided
  const matched = PRESET_AVATARS.find((a) => a.id === trimmed);
  if (matched) return matched.url;

  // Custom data URI or web link or static path
  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/avatars/") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  // Fallback for legacy text seeds (like "siddhi" or "studybuddy")
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmed || nameFallback)}&backgroundColor=D97D29&textColor=fff`;
}
