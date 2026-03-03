"use client";

import { useState } from "react";
import { Brain, MessageSquare, FileText, Sparkles, Target, BookOpen, Zap, CheckCircle, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/components/ui/Sidebar";
import Header from "@/src/components/ui/Header";

export default function AboutPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    { icon: Target, title: "Geração de Questões Inteligentes", description: "Crie questões personalizadas com base em temas específicos, escolha a banca organizadora e defina a quantidade ideal para seus estudos." },
    { icon: BookOpen, title: "Resumos Automáticos", description: "Transforme conteúdos extensos em resumos claros e objetivos. Basta colar o texto ou descrever o tema desejado." },
    { icon: Zap, title: "Feedback Instantâneo", description: "Receba correções imediatas das questões respondidas, identifique acertos e erros para otimizar seu aprendizado." },
    { icon: Sparkles, title: "Histórico Completo", description: "Acesse suas sessões anteriores de questões e resumos salvos a qualquer momento para revisão." },
    {
      icon: CalendarIcon,
      title: "Cronograma Inteligente",
      description: "Organize seus estudos com um calendário personalizado. Defina metas diárias, acompanhe seu progresso e mantenha consistência na preparação."
    },
  ];

  const benefits = [
    "Estude de forma mais eficiente com conteúdo personalizado",
    "Economize tempo na preparação para concursos e provas",
    "Pratique com questões no estilo das principais bancas",
    "Organize seus estudos com histórico de sessões",
    "Revise conteúdos complexos com resumos objetivos",
  ];

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)" }}>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} subtitle="Assistente inteligente" showListSection={true} />

      <div className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Sobre o BrainlyAi" />

        <div className="p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">

            {/* Hero */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl shadow-lg">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--text)" }}>
                Sobre o BrainlyAI
              </h1>
              <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Seu assistente inteligente para estudos e preparação para concursos, potencializado por inteligência artificial.
              </p>
            </div>

            {/* O que é */}
            <div className="rounded-xl p-6 sm:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text)" }}>O que é o BrainlyAI?</h2>
              <p className="leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                O BrainlyAI é uma plataforma inovadora que utiliza inteligência artificial para auxiliar estudantes e concurseiros em sua jornada de aprendizado. Com recursos avançados de geração de conteúdo, oferecemos ferramentas práticas para otimizar seus estudos.
              </p>
              <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Nossa missão é tornar o estudo mais eficiente, personalizado e acessível, economizando seu tempo e maximizando seus resultados.
              </p>
            </div>

            {/* Funcionalidades */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: "var(--text)" }}>Principais Funcionalidades</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="rounded-xl p-6 hover:shadow-lg transition-shadow" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg shrink-0">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>{feature.title}</h3>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-6 sm:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>Gerador de Questões</h2>
              </div>
              <div className="space-y-3" style={{ color: "var(--text-muted)" }}>
                {[
                  ["1. Escolha o tema:", "Digite o assunto que deseja estudar ou cole o conteúdo de um PDF."],
                  ["2. Selecione a banca:", "Escolha entre as principais bancas organizadoras de concursos (Cespe, FGV, FCC, etc)."],
                  ["3. Defina a quantidade:", "Selecione de 5 a 50 questões para sua sessão de estudos."],
                  ["4. Pratique e receba feedback:", "Responda as questões e veja instantaneamente seus acertos e erros."],
                ].map(([label, desc]) => (
                  <p key={label} className="leading-relaxed">
                    <strong style={{ color: "var(--text)" }}>{label}</strong> {desc}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-6 sm:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
                  Cronograma de Estudos
                </h2>
              </div>

              <div className="space-y-3" style={{ color: "var(--text-muted)" }}>
                {[
                  ["1. Defina sua meta diária:", "Escolha quantas questões deseja resolver por dia ou quanto tempo quer estudar."],
                  ["2. Acompanhe seu progresso:", "Visualize no calendário os dias concluídos e mantenha sua consistência."],
                  ["3. Analise seu desempenho:", "Veja estatísticas semanais e mensais para ajustar sua rotina."],
                  ["4. Crie disciplina:", "Transforme o hábito de estudar em um compromisso diário organizado."],
                ].map(([label, desc]) => (
                  <p key={label} className="leading-relaxed">
                    <strong style={{ color: "var(--text)" }}>{label}</strong> {desc}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-6 sm:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>Gerador de Resumos</h2>
              </div>
              <div className="space-y-3" style={{ color: "var(--text-muted)" }}>
                {[
                  ["1. Insira o conteúdo:", "Digite ou cole o texto que deseja resumir."],
                  ["2. Gere o resumo:", "Nossa IA analisa o conteúdo e cria um resumo estruturado e objetivo."],
                  ["3. Revise e salve:", "Acesse seus resumos salvos a qualquer momento para revisão."],
                ].map(([label, desc]) => (
                  <p key={label} className="leading-relaxed">
                    <strong style={{ color: "var(--text)" }}>{label}</strong> {desc}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-6 sm:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--text)" }}>Por que usar o BrainlyAI?</h2>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <p style={{ color: "var(--text-muted)" }}>{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Pronto para otimizar seus estudos?</h2>
              <p className="mb-6 text-blue-100">Comece agora a usar o BrainlyAI e transforme sua forma de estudar.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => router.push("/practice-tests")} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Gerar Questões
                </button>
                <button onClick={() => router.push("/summaries")} className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
                  Criar Resumo
                </button>
                <button
                  onClick={() => router.push("/calendar")}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Ver Cronograma
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}