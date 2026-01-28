"use client";

import { Brain, X, LogOut, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/src/utils/logout";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  active?: boolean;
};

type ListItem = {
  id: string;
  title?: string;
  sessionName?: string;
  createdAt: string;
};

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuItems: MenuItem[];
  subtitle?: string;
  listItems?: ListItem[];
  activeItemId?: string | null;
  onItemSelect?: (id: string) => void;
  onNewItem?: () => void;
  newItemLabel?: string;
  newItemIcon?: LucideIcon;
  showListSection?: boolean;
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  menuItems,
  subtitle = "Assistente inteligente",
  listItems = [],
  activeItemId = null,
  onItemSelect,
  onNewItem,
  newItemLabel = "Nova sessão",
  newItemIcon: NewItemIcon,
  showListSection = false,
}: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">BrainlyAI</h1>
                <p className="text-xs text-gray-700">{subtitle}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 border-b">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  item.active
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* List Section */}
          {showListSection && (
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {onNewItem && (
                <button
                  onClick={onNewItem}
                  className="w-full flex items-center gap-2 border rounded-lg px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 border-gray-300"
                >
                  {NewItemIcon && <NewItemIcon className="w-4 h-4" />}
                  {newItemLabel}
                </button>
              )}

              {listItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemSelect && onItemSelect(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border border-gray-300 ${
                    activeItemId === item.id
                      ? "bg-blue-50 border-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium truncate text-gray-800">
                    {item.title || item.sessionName || "Sem título"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!showListSection && <div className="flex-1"></div>}

          {/* Logout */}
          <div className="p-4 border-t mt-auto" onClick={logout}>
            <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}