"use client";

import { useState } from "react";
import {
  Brain,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  FileText,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  CheckCircle,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/components/ui/sidebar";
import Header from "@/src/components/ui/header";

export default function AboutPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: FileText, label: "Resumos", path: "/resume" },
    { icon: Info, label: "Sobre", path: "/about", active: true },
  ];

  const features = [
    {
      icon: Target,
      title: "Geração de Questões Inteligentes",
      description:
        "Crie questões personalizadas com base em temas específicos, escolha a banca organizadora e defina a quantidade ideal para seus estudos.",
    },
    {
      icon: BookOpen,
      title: "Resumos Automáticos",
      description:
        "Transforme conteúdos extensos em resumos claros e objetivos. Basta colar o texto ou descrever o tema desejado.",
    },
    {
      icon: Zap,
      title: "Feedback Instantâneo",
      description:
        "Receba correções imediatas das questões respondidas, identifique acertos e erros para otimizar seu aprendizado.",
    },
    {
      icon: Sparkles,
      title: "Histórico Completo",
      description:
        "Acesse suas sessões anteriores de questões e resumos salvos a qualquer momento para revisão.",
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
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar*/}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menuItems={menuItems}
        subtitle="Assistente inteligente"
        showListSection={true}
      />

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">

        {/* HEADER */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Dashboard"
        />

        {/* CONTENT */}
        <div className="p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">

            {/* Header Text */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl shadow-lg">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Sobre o BrainlyAI
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Seu assistente inteligente para estudos e preparação para
                concursos, potencializado por inteligência artificial.
              </p>
            </div>

            {/* O que é */}
            <div className="bg-white rounded-xl border p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                O que é o BrainlyAI?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O BrainlyAI é uma plataforma inovadora que utiliza inteligência
                artificial para auxiliar estudantes e concurseiros em sua
                jornada de aprendizado. Com recursos avançados de geração de
                conteúdo, oferecemos ferramentas práticas para otimizar seus
                estudos.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nossa missão é tornar o estudo mais eficiente, personalizado e
                acessível, economizando seu tempo e maximizando seus
                resultados.
              </p>
            </div>

            {/* Funcionalidades */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Principais Funcionalidades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Como funciona - Chat */}
            <div className="from-blue-50 to-white rounded-xl border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Gerador de Questões
                </h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-gray-900">1. Escolha o tema:</strong>{" "}
                  Digite o assunto que deseja estudar ou cole o conteúdo de um
                  PDF.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900">
                    2. Selecione a banca:
                  </strong>{" "}
                  Escolha entre as principais bancas organizadoras de concursos
                  (Cespe, FGV, FCC, etc).
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900">
                    3. Defina a quantidade:
                  </strong>{" "}
                  Selecione de 5 a 50 questões para sua sessão de estudos.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900">
                    4. Pratique e receba feedback:
                  </strong>{" "}
                  Responda as questões e veja instantaneamente seus acertos e
                  erros.
                </p>
              </div>
            </div>

            {/* Como funciona - Resumos */}
            <div className="from-blue-50 to-white rounded-xl border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Gerador de Resumos
                </h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-gray-900">1. Insira o conteúdo:</strong>{" "}
                  Digite ou cole o texto que deseja resumir.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900">2. Gere o resumo:</strong>{" "}
                  Nossa IA analisa o conteúdo e cria um resumo estruturado e
                  objetivo.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900">3. Revise e salve:</strong>{" "}
                  Acesse seus resumos salvos a qualquer momento para revisão.
                </p>
              </div>
            </div>

            {/* Benefícios */}
            <div className="bg-white rounded-xl border p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Por que usar o BrainlyAI?
              </h2>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-linear-to-r
 from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">
                Pronto para otimizar seus estudos?
              </h2>
              <p className="mb-6 text-blue-50">
                Comece agora a usar o BrainlyAI e transforme sua forma de
                estudar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/chat")}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Gerar Questões
                </button>
                <button
                  onClick={() => router.push("/resume")}
                  className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                >
                  Criar Resumo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}