"use client";

import { logout } from "@/src/utils/logout";
import {
  Brain,
  X,
  LogOut,
  LucideIcon,
  Trash2,
  LayoutDashboard,
  MessageSquare,
  FileText,
  CalendarIcon,
  Info,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";

type ListItem = {
  id: number;
  title?: string;
  sessionName?: string;
  createdAt: string;
};

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  subtitle?: string;
  listItems?: ListItem[];
  activeItemId?: number | null;
  onItemSelect?: (id: number) => void;
  onNewItem?: () => void;
  newItemLabel?: string;
  newItemIcon?: LucideIcon;
  showListSection?: boolean;
  onItemDelete?: (id: number) => void;
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  subtitle = "Assistente inteligente",
  listItems = [],
  activeItemId = null,
  onItemSelect,
  onNewItem,
  newItemLabel = "Nova sessão",
  newItemIcon: NewItemIcon,
  showListSection = false,
  onItemDelete,
}: SidebarProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: FileText, label: "Resumos", path: "/resume" },
    { icon: CalendarIcon, label: "Calendário", path: "/study-calendar" },
    { icon: Info, label: "Sobre", path: "/about" },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="h-16 px-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-md">
                <Brain className="text-white" />
              </div>
              <div>
                <h1 className="font-bold" style={{ color: "var(--text)" }}>
                  BrainlyAI
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ color: "var(--text-muted)" }}
            >
              <X />
            </button>
          </div>

          <nav
            className="p-4 space-y-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {menuItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: isActive
                      ? "var(--bg-active)"
                      : "transparent",
                    color: isActive
                      ? "var(--text-active)"
                      : "var(--text-muted)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background =
                        "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {showListSection && (
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {onNewItem && (
                <button
                  onClick={onNewItem}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {NewItemIcon && <NewItemIcon className="w-4 h-4" />}
                  {newItemLabel}
                </button>
              )}

              {listItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative w-full rounded-lg transition-colors hover:bg-(--bg-hover)"
                  style={{
                    border: `1px solid ${activeItemId === item.id
                      ? "var(--border-active)"
                      : "var(--border)"
                      }`,
                    background:
                      activeItemId === item.id
                        ? "var(--bg-active)"
                        : "transparent",
                  }}
                >
                  <button
                    onClick={() =>
                      onItemSelect && onItemSelect(item.id)
                    }
                    className="w-full text-left px-4 py-3 pr-12"
                  >
                    <p
                      className="font-medium truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {item.title ||
                        item.sessionName ||
                        "Sem título"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </button>

                  {(
                    <button
                      type="button"
                      onClick={() => {
                        setItemToDelete(item.id); setIsDeleteModalOpen(true);
                      }}
                      className="
      absolute right-2 top-1/2 -translate-y-1/2
      p-1.5 rounded-md
      opacity-100 md:opacity-0 md:group-hover:opacity-100
      transition-opacity duration-200
      hover:bg-red-100 dark:hover:bg-red-900/40
    "
                      aria-label="Excluir item"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showListSection && <div className="flex-1" />}

          <div
            className="p-4 mt-auto"
            style={{ borderTop: "1px solid var(--border)" }}
            onClick={logout}
          >
            <button
              className="w-full flex items-center px-4 py-3 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Excluir Sessão"
        message="Tem certeza que deseja apagar este registro de estudo? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onCancel={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={() => {
          if (itemToDelete !== null && onItemDelete) {
            onItemDelete(itemToDelete);
            setIsDeleteModalOpen(false);
          }
        }} />
    </>
  );
}