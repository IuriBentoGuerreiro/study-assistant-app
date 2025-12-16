"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

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
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10 transition">
            Meus Estudos
          </button>
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10 transition">
            PDFs & Uploads
          </button>
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10 transition">
            Simulados
          </button>
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10 transition">
            Configurações
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
            <button className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">
              Novo Estudo
            </button>
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm">
              IA
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-sm text-gray-400">PDFs Enviados</h3>
            <p className="mt-2 text-3xl font-semibold">12</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-sm text-gray-400">Questões Geradas</h3>
            <p className="mt-2 text-3xl font-semibold">248</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-sm text-gray-400">Horas Estudadas</h3>
            <p className="mt-2 text-3xl font-semibold">34h</p>
          </div>
        </section>

        <section className="mt-10">
          <h3 className="mb-4 text-lg font-medium">Atividades Recentes</h3>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl divide-y divide-white/10">
            <div className="p-4 text-sm flex justify-between">
              <span>Resumo gerado — Direito Constitucional</span>
              <span className="text-gray-400">há 2h</span>
            </div>
            <div className="p-4 text-sm flex justify-between">
              <span>Simulado criado — Matemática</span>
              <span className="text-gray-400">ontem</span>
            </div>
            <div className="p-4 text-sm flex justify-between">
              <span>PDF enviado — Administração Pública</span>
              <span className="text-gray-400">2 dias atrás</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
