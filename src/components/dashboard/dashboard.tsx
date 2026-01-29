"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { DashboardDTO } from "@/src/types/DashboardDTO";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Info,
  ClipboardCheck
} from "lucide-react";
import Sidebar from "../ui/sidebar";
import Header from "../ui/header";

type SessionListItem = {
  id: string;
  sessionName: string;
  createdAt: string;
};

type ResumeTitleList = {
  id: string;
  title: string;
  createdAt: string;
};

export default function DashboardView() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [resumes, setResumes] = useState<ResumeTitleList[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await api.get("/dashboard");
        setDashboard(dashboardResponse.data);

        const resumesResponse = await api.get(`/resume`);
        setResumes(resumesResponse.data);

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
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: FileText, label: "Resumos", path: "/resume" },
    { icon: Info, label: "Sobre", path: "/about" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menuItems={menuItems}
        subtitle="Dashboard de controle"
        showListSection={true}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Dashboard"
        />

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

          {/* LISTAGEM DE RESUMOS E SIMULADOS */}
          <div className="w-full bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* SESSÕES */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-800">
                    Simulados Gerados
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
                            <ClipboardCheck className="w-5 h-5 text-blue-600 mr-3" />
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

              {/* RESUMOS */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-800">
                    Resumos de Estudos
                  </h3>
                </div>

                <div className="p-6">
                  {loading ? (
                    <p className="text-gray-500 text-center py-8">
                      Carregando resumos...
                    </p>
                  ) : resumes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum resumo encontrado
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          onClick={() => router.push(`/resume?id=${resume.id}`)}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 mr-3" />
                            <span className="font-medium text-gray-800">
                              {resume.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}