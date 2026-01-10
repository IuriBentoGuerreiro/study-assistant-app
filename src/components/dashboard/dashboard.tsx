"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";

type DashboardDTO = {
  questionsGenerated: number;
  correctQuestions: number;
  accuracyPercentage: number;
};

export default function DashboardView() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClickChat = () => {
    router.push("/chat");
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get<DashboardDTO>("/dashboard");
        setDashboard(data);
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 border-r border-white/10 bg-black/60 backdrop-blur-xl p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-semibold tracking-tight mb-10">
          Assistente de Estudos
        </h1>

        <nav className="flex-1 space-y-2 text-sm">
          <button className="w-full text-left rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 transition">
            Dashboard
          </button>
        </nav>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition"
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-400">
              Organize seus estudos com inteligência artificial
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleClickChat}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              Novo Estudo
            </button>
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm">
              IA
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-sm text-gray-400">Questões Geradas</h3>
            <p className="mt-2 text-3xl font-semibold">
              {loading ? "--" : dashboard?.questionsGenerated}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-sm text-gray-400">Acertos</h3>
            <p className="mt-2 text-3xl font-semibold">
              {loading ? "--" : dashboard?.correctQuestions}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-sm text-gray-400">Porcentagem de Acertos</h3>
            <p className="mt-2 text-3xl font-semibold">
              {loading
                ? "--"
                : `${dashboard?.accuracyPercentage.toFixed(1)}%`}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
