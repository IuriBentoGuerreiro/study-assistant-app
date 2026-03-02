"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { DashboardDTO } from "@/src/types/DashboardDTO";
import {
  FileText,
  ClipboardCheck
} from "lucide-react";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";

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

        const resumesResponse = await api.get("summaries");
        setResumes(resumesResponse.data);

          const sessionsResponse = await api.get("/session");
          setSessions(sessionsResponse.data);
        
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950">

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        subtitle="Dashboard de controle"
        showListSection={true}
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Dashboard"
        />

        <main className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-2">
                Questões Geradas
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : dashboard?.questionsGenerated}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-2">
                Acertos
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {loading ? "--" : dashboard?.correctQuestions}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-2">
                Porcentagem de Acertos
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? "--" : `${dashboard?.accuracyPercentage.toFixed(1)}%`}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-100 dark:bg-zinc-900 p-4 rounded-lg">
            <div className="max-w-6xl mx-auto space-y-6">

              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Simulados Gerados
                  </h3>
                </div>

                <div className="p-6">
                  {loading ? (
                    <p className="text-gray-500 dark:text-zinc-400 text-center py-8">
                      Carregando sessões...
                    </p>
                  ) : sessions.length === 0 ? (
                    <p className="text-gray-500 dark:text-zinc-400 text-center py-8">
                      Nenhuma sessão encontrada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => router.push(`/practice-tests/${session.id}`)}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center">
                            <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                            <span className="font-medium text-gray-800 dark:text-zinc-100">
                              {session.sessionName}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-zinc-400">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Resumos de Estudos
                  </h3>
                </div>

                <div className="p-6">
                  {loading ? (
                    <p className="text-gray-500 dark:text-zinc-400 text-center py-8">
                      Carregando resumos...
                    </p>
                  ) : resumes.length === 0 ? (
                    <p className="text-gray-500 dark:text-zinc-400 text-center py-8">
                      Nenhum resumo encontrado
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          onClick={() => router.push(`/summaries/${resume.id}`)}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                            <span className="font-medium text-gray-800 dark:text-zinc-100">
                              {resume.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-zinc-400">
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