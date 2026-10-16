// components/providers/ThemeInitializer.tsx
"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/useAppStore";

export function ThemeInitializer() {
  const { theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "amoled", "light");
    if (theme === "dark" || theme === "amoled") root.classList.add("dark");
    if (theme === "amoled") root.classList.add("amoled");
  }, [theme]);

  return null;
}
