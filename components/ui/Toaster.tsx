// components/ui/Toaster.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toast: Toast) => void;

const listeners: ToastListener[] = [];

export const toast = {
  success: (message: string) => emit({ message, type: "success" }),
  error: (message: string) => emit({ message, type: "error" }),
  warning: (message: string) => emit({ message, type: "warning" }),
  info: (message: string) => emit({ message, type: "info" }),
};

function emit(data: Omit<Toast, "id">) {
  const t: Toast = { ...data, id: Math.random().toString(36).slice(2) };
  listeners.forEach((l) => l(t));
}

const icons = {
  success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
  info: <AlertCircle className="h-4 w-4 text-blue-500" />,
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            {icons[t.type]}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {t.message}
            </span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
