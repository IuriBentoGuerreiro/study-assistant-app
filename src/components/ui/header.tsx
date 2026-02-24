"use client";
import { Menu } from "lucide-react";
import { ModeToggle } from "./modeToggle";

type HeaderProps = {
  onMenuClick: () => void;
  title?: string;
};

export default function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <div
      className="sticky top-0 z-30 h-16 px-4 flex items-center justify-between shadow-sm"
      style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg lg:hidden transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {title && (
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2" />

      <div className="flex justify-end">
        <ModeToggle />
      </div>
    </div>
  );
}