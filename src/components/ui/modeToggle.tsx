"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className="
        relative w-16 h-8 rounded-full
        transition-all duration-300 ease-in-out
        bg-linear-to-r 
        from-yellow-300 to-yellow-400
        dark:from-zinc-700 dark:to-zinc-800
        shadow-inner
        hover:scale-105
      "
    >
      <Sun className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 dark:opacity-40 transition-opacity" />
      <Moon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 opacity-40 dark:opacity-100 transition-opacity" />

      <span
        className={`
          absolute top-1 left-1
          w-6 h-6 rounded-full
          flex items-center justify-center
          bg-white dark:bg-zinc-900
          shadow-md
          transition-all duration-300 ease-in-out
          ${isDark ? "translate-x-8" : "translate-x-0"}
        `}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-zinc-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-yellow-500" />
        )}
      </span>
    </button>
  );
}