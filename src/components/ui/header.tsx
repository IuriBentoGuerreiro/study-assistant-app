"use client";

import { Menu } from "lucide-react";

type HeaderProps = {
  onMenuClick: () => void;
  title?: string;
};

export default function Header({ onMenuClick, title }: HeaderProps) {
  return (
<div className="sticky top-0 z-30 h-16 bg-white border-b px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        
        {title && (
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center gap-2">
      </div>
    </div>
  );
}