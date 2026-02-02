"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  RotateCcw,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  FileText,
  Info,
  Trophy,
  CheckCircle2,
  XCircle,
  Target,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import Select from "../ui/select";
import Tooltip from "../ui/tooltip";
import Sidebar from "../ui/sidebar";
import Header from "../ui/header";

type SessionListItem = {
  id: string;
  sessionName: string;
  createdAt: string;
};

type Question = {
  id: string;
  type: QuestionType;
  statement: string;
  options?: string[];
  userAnswerIndex?: number;
  correctAnswerIndex: number;
};

type Session = {
  id: string;
  sessionName?: string;
  topic: string;
  questions: Question[];
  completed: boolean;
};

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE";

type AIQuizChatProps = {
  initialSessionId?: string;
};

export default function AIQuizChat({ initialSessionId }: AIQuizChatProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [banca, setBanca] = useState<string>("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [questionType, setQuestionType] =
    useState<QuestionType | null>(null);

  const [showResultsModal, setShowResultsModal] = useState(false);

  const questionTypeOptions = [
    { label: "Múltipla escolha", value: "MULTIPLE_CHOICE" },
    { label: "Certo / Errado", value: "TRUE_FALSE" },
  ];

  const loadSessions = async () => {
    try {
      const userId = Number(sessionStorage.getItem("userId"));
      const { data } = await api.get<SessionListItem[]>(`/session/${userId}`);
      setSessions(data);
    } catch (err) {
      console.error("Erro ao carregar sessões", err);
    }
  };

  const updateURL = (sessionId: string | null) => {
    if (sessionId) {
      router.push(`/chat?session=${sessionId}`, { scroll: false });
    } else {
      router.push("/chat", { scroll: false });
    }
  };

  useEffect(() => {
    const sessionIdFromURL = searchParams.get("session");
    if (sessionIdFromURL) {
      loadSessionQuestions(sessionIdFromURL);
      setActiveSessionId(sessionIdFromURL);
    } else if (initialSessionId) {
      loadSessionQuestions(initialSessionId);
      setActiveSessionId(initialSessionId);
      updateURL(initialSessionId);
    }
  }, [initialSessionId]);

  useEffect(() => {
    loadSessions();
  }, []);

  const generateQuestions = async () => {
    if (!topic.trim()) return;

    if (Number(quantity) > 50) {
      setErrorMessage("O limite máximo de questões é 50");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    const userId = Number(sessionStorage.getItem("userId"));

    try {
      const params = new URLSearchParams({
        userId: userId.toString(),
      });

      if (questionType && questionType.trim()) {
        params.append("type", questionType);
      }

      if (banca && banca.trim()) {
        params.append("banca", banca);
      }

      if (quantity && quantity.trim()) {
        params.append("quantidade", quantity);
      }

      const response = await api.post(
        `/session/generateIa?${params.toString()}`,
        topic,
        {
          headers: {
            "Content-Type": "text/plain"
          }
        }
      );

      const questions: Question[] = response.data.questions.map((q: any) => ({
        id: q.id,
        type: questionType,
        statement: q.statement,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
      }));

      const newSessionId = response.data.id;

      setCurrentSession({
        id: newSessionId,
        topic,
        questions,
        completed: false,
      });

      setActiveSessionId(newSessionId);
      updateURL(newSessionId);

      setTopic("");
      setQuantity("");
      setBanca("");
      setSidebarOpen(false);

      await loadSessions();
    } catch (error: any) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Erro inesperado ao gerar questões";

      if (status === 400) {
        setErrorMessage(message);
      } else {
        setErrorMessage("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSessionQuestions = async (sessionId: string) => {
    try {
      const { data } = await api.get<any[]>(`/question/${sessionId}`);

      const normalizedQuestions: Question[] = data.map(q => ({
        id: String(q.id),
        type: q.type,
        statement: q.statement,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex:
          q.studyAnswer === null || q.studyAnswer === undefined
            ? undefined
            : q.studyAnswer,
      }));

      setCurrentSession({
        id: sessionId,
        topic: "",
        questions: normalizedQuestions,
        completed: normalizedQuestions.every(
          q => q.userAnswerIndex !== undefined
        ),
      });

      setSidebarOpen(false);
    } catch (err) {
      console.error("Erro ao carregar questões da sessão", err);
    }
  };

  const handleAnswer = async (questionId: string, optionIndex: number) => {
    if (!currentSession) return;

    await api.put("/question/user/response", {
      questionId,
      selectedOptionIndex: optionIndex,
    });

    setCurrentSession((prev) => {
      if (!prev) return prev;

      const updatedQuestions = prev.questions.map((q) =>
        q.id === questionId
          ? { ...q, userAnswerIndex: optionIndex }
          : q
      );

      const completed = updatedQuestions.every(
        (q) => q.userAnswerIndex !== undefined
      );

      // Mostra o modal quando todas as questões são respondidas
      if (completed && !prev.completed) {
        setTimeout(() => setShowResultsModal(true), 500);
      }

      return {
        ...prev,
        questions: updatedQuestions,
        completed,
      };
    });
  };

  const resetQuiz = () => {
    setCurrentSession(null);
    setActiveSessionId(null);
    setTopic("");
    updateURL(null);
    setSidebarOpen(false);
    setShowResultsModal(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadSessionQuestions(sessionId);
    updateURL(sessionId);
    setShowResultsModal(false);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat", active: true },
    { icon: FileText, label: "Resumos", path: "/resume" },
    { icon: Info, label: "Sobre", path: "/about" },
  ];

  const totalQuestions = currentSession?.questions.length ?? 0;

  const answeredQuestions =
    currentSession?.questions.filter(
      (q) => q.userAnswerIndex !== undefined
    ).length ?? 0;

  const correctAnswers =
    currentSession?.questions.filter(
      (q) => q.userAnswerIndex === q.correctAnswerIndex
    ).length ?? 0;

  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const sessionName = useMemo(
    () => sessions.find(s => s.id === activeSessionId)?.sessionName ?? "Sessão",
    [sessions, activeSessionId]
  );

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: "Excelente! Você está dominando o conteúdo! 🎉", color: "text-green-600" };
    if (percentage >= 70) return { text: "Muito bom! Continue assim! 👏", color: "text-blue-600" };
    if (percentage >= 50) return { text: "Bom trabalho! Revise os pontos fracos. 📚", color: "text-yellow-600" };
    return { text: "Continue estudando! A prática leva à perfeição. 💪", color: "text-orange-600" };
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menuItems={menuItems}
        subtitle="Gerador de questões"
        listItems={sessions}
        activeItemId={activeSessionId}
        onItemSelect={handleSessionSelect}
        onNewItem={resetQuiz}
        newItemLabel="Nova sessão"
        newItemIcon={RotateCcw}
        showListSection={true}
      />

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Gerar Questões"
        />
        <div className="p-4 sm:p-6">

          {/* INPUT */}
          {!currentSession && (
            <div className="max-w-3xl mx-auto mb-6 flex flex-col gap-4 text-gray-900">

              {/* Banca, Tipo e Quantidade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">Banca</label>
                    <Tooltip content="Selecione a instituição organizadora do concurso. Caso não tenha a banca desejada pode digitar o nome dela e gere as questões normalmente"
                      position="bottom"
                    />
                  </div>
                  <Select
                    value={banca}
                    onChange={setBanca}
                    options={[
                      "Cespe/CEBRASPE",
                      "Consulpam",
                      "FGV",
                      "FCC",
                      "Vunesp",
                      "IBFC",
                      "FUNCAB",
                      "AOCP",
                      "Quadrix",
                    ]}
                    placeholder="Selecione a banca"
                    className="w-full"
                    allowCustomValue
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">Tipo de Questões</label>
                    <Tooltip content="Selecione o formato das questões que deseja gerar."
                      position="bottom" />
                  </div>
                  <Select
                    value={questionType ?? ""}
                    onChange={(value) => setQuestionType(value as QuestionType)}
                    options={questionTypeOptions}
                    placeholder="Selecione o tipo de questão"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">Quantidade</label>
                    <Tooltip content="Número de questões a serem geradas (5 a 50)."
                      position="bottom" />
                  </div>
                  <Select
                    value={quantity}
                    onChange={setQuantity}
                    options={["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"]}
                    placeholder="Quantidade"
                    className="w-full"
                    allowCustomValue
                  />
                </div>
              </div>

              {/* Tema */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">Tema</label>
                  <Tooltip
                    content="Digite o assunto sobre o qual deseja gerar questões (ex: Direito Constitucional), você também pode copiar o conteudo de um PDF e colar aqui!"
                    position="bottom"
                  />
                </div>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Digite um tema para gerar questões... Você pode colar um texto extenso ou conteúdo de um PDF aqui."
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full min-h-30 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Mensagem de erro */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Botão de gerar */}
              <button
                onClick={generateQuestions}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Gerar Questões</span>
                  </>
                )}
              </button>

              {/* TEXTO DE BOAS-VINDAS */}
              <div className="mt-6 sm:mt-10 text-center px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xl sm:text-2xl font-semibold">Bem-vindo ao BrainlyAI!</p>
                <p className="mt-2 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                  Digite um tema, escolha a quantidade de questões e a banca para gerar suas questões personalizadas.
                  Você também pode selecionar uma sessão existente na barra lateral para revisar suas questões anteriores.
                </p>
              </div>
            </div>
          )}

          {/* CABEÇALHO DAS QUESTÕES */}
          {currentSession && (
            <div className="max-w-3xl mx-auto mb-6">
              <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5" />
                      <p className="text-lg font-semibold">
                        {sessionName}
                      </p>
                    </div>
                    <p className="text-blue-100 text-sm mb-3">
                      Aqui estão <strong>{totalQuestions}</strong> questões geradas{currentSession.topic && ` sobre: ${currentSession.topic}`}
                    </p>
                    <p className="text-white font-medium">
                      Boa sorte! 🍀 Leia com atenção e faça o seu melhor!
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-xs text-blue-100">Progresso</p>
                      <p className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</p>
                    </div>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500 ease-out"
                    style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {currentSession && (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 text-gray-600">
              {currentSession.questions.map((q, idx) => {
                const isAnswered = q.userAnswerIndex !== undefined;
                const isCorrect = q.userAnswerIndex === q.correctAnswerIndex;

                return (
                  <div key={q.id} className={`bg-white p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${isAnswered
                    ? isCorrect
                      ? 'border-green-200 shadow-green-100'
                      : 'border-red-200 shadow-red-100'
                    : 'border-gray-200'
                    } shadow-sm`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm sm:text-base flex-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-3">
                          {idx + 1}
                        </span>
                        {q.statement}
                      </h3>
                      {isAnswered && (
                        <div className="ml-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* MULTIPLE CHOICE */}
                    {q.type === "MULTIPLE_CHOICE" && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => {
                          const answered = q.userAnswerIndex !== undefined;
                          const isCorrect = i === q.correctAnswerIndex;
                          const isSelected = i === q.userAnswerIndex;

                          let style = "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400";

                          if (answered) {
                            if (isCorrect) style = "border-green-500 bg-green-50 font-medium";
                            else if (isSelected) style = "border-red-500 bg-red-50";
                            else style = "border-gray-200 bg-gray-50 opacity-60";
                          }

                          return (
                            <button
                              key={i}
                              disabled={answered}
                              onClick={() => handleAnswer(q.id, i)}
                              className={`
                                w-full text-left px-4 py-3 rounded-lg border-2
                                transition-all duration-200
                                ${style}
                                ${answered ? "cursor-default" : "cursor-pointer hover:shadow-md"}
                                flex items-center gap-3
                              `}
                            >
                              <span className="flex-1">{opt}</span>
                              {answered && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                              )}
                              {answered && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TRUE / FALSE */}
                    {q.type === "TRUE_FALSE" && (
                      <div className="space-y-2">
                        {["Certo", "Errado"].map((label, i) => {
                          const answered = q.userAnswerIndex !== undefined;
                          const isCorrect = i === q.correctAnswerIndex;
                          const isSelected = i === q.userAnswerIndex;

                          let style = "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400";

                          if (answered) {
                            if (isCorrect) style = "border-green-500 bg-green-50 font-medium";
                            else if (isSelected) style = "border-red-500 bg-red-50";
                            else style = "border-gray-200 bg-gray-50 opacity-60";
                          }

                          return (
                            <button
                              key={i}
                              disabled={answered}
                              onClick={() => handleAnswer(q.id, i)}
                              className={`
                                w-full text-left px-4 py-3 rounded-lg border-2
                                transition-all duration-200
                                ${style}
                                ${answered ? "cursor-default" : "cursor-pointer hover:shadow-md"}
                                flex items-center justify-between
                              `}
                            >
                              <span>{label}</span>
                              {answered && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                              {answered && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* RESUMO DE RESULTADOS AO FINAL DA PÁGINA */}
          {currentSession && answeredQuestions > 0 && (
            <div className="max-w-3xl mx-auto mt-6 sm:mt-8 bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span><strong>Respondidas:</strong> {answeredQuestions} / {totalQuestions}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Acertos:</strong> {correctAnswers}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span><strong>Erros:</strong> {answeredQuestions - correctAnswers}</span>
                  </div>
                </div>

                {answeredQuestions === totalQuestions && (
                  <div className="text-center sm:text-right">
                    <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-lg">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Resultado Final</p>
                        <p className="text-2xl font-bold text-blue-700">{percentage}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE RESULTADOS */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scaleIn">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Parabéns! 🎉
              </h2>

              <p className="text-gray-600 mb-6">
                Você completou todas as questões!
              </p>

              <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Acertos</p>
                    <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Erros</p>
                    <p className="text-3xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Aproveitamento</p>
                  <p className="text-4xl font-bold text-blue-700 mb-2">{percentage}%</p>
                  <p className={`text-sm font-medium ${getPerformanceMessage().color}`}>
                    {getPerformanceMessage().text}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Revisar
                </button>
                <button
                  onClick={resetQuiz}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nova Sessão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}