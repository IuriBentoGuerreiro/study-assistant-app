"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { DashboardDTO } from "@/src/types/DashboardDTO";
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  LogOut,
  Menu,
  X,
  Brain
} from "lucide-react";

type SessionListItem = {
  id: string;
  sessionName: string;
  createdAt: string;
};

export default function DashboardView() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleClickChat = () => {
    router.push("/chat");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await api.get("/dashboard");
        setDashboard(dashboardResponse.data);

        const userId = Number(sessionStorage.getItem("userId"));
        if (userId) {
          const sessionsResponse = await api.get(`/session/${userId}`);
          setSessions(sessionsResponse.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: true },
    { icon: MessageSquare, label: "Chat", path: "/chat", active: false },
    { icon: BookOpen, label: "Sessões", path: "/sessions", active: false },
    { icon: Settings, label: "Configurações", path: "/settings", active: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
                    <div className="p-6 border-b flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Quiz AI</h1>
                <p className="text-xs text-gray-700">Gerador de questões</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X />
            </button>
          </div>


          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-600 hover:text-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            </div>
            
            <button
              onClick={handleClickChat}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Ir para Chat
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Questões Geradas
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "--" : dashboard?.questionsGenerated}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Acertos
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {loading ? "--" : dashboard?.correctQuestions}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Porcentagem de Acertos
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? "--" : `${dashboard?.accuracyPercentage.toFixed(1)}%`}
              </p>
            </div>
          </div>

          {/* SESSÕES */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                Sessões de Estudo
              </h3>
            </div>

            <div className="p-6">
              {loading ? (
                <p className="text-gray-500 text-center py-8">
                  Carregando sessões...
                </p>
              ) : sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma sessão encontrada
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/chat?session=${session.id}`)}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-800">
                          {session.sessionName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}