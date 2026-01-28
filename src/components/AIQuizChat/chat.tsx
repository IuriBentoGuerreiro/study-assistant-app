"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  RotateCcw,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Loader2,
  MessageSquare,
  FileText,
  Info,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import Select from "../ui/select";
import Tooltip from "../ui/tooltip";
import Sidebar from "../ui/sidebar";

type SessionListItem = {
  id: string;
  sessionName: string;
  createdAt: string;
};

type Question = {
  id: string;
  statement: string;
  options: string[];
  userAnswerIndex?: number;
  correctAnswerIndex: number;
};

type Session = {
  id: string;
  topic: string;
  questions: Question[];
  completed: boolean;
};

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
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadSessionQuestions(sessionId);
    updateURL(sessionId);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat", active: true },
    { icon: FileText, label: "Resumos", path: "/resume" },
    { icon: Info, label: "Sobre", path: "/about"},
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
        <div className="p-4 sm:p-6">

          {/* INPUT */}
          {!currentSession && (
            <div className="max-w-2xl mx-auto mb-6 flex flex-col gap-4 sm:gap-6 text-gray-900">

              {/* Prompt */}
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="w-full sm:flex-2 sm:min-w-60">
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
                  />
                </div>

                <div className="w-full sm:flex-1 sm:min-w-40">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">Quantidade</label>
                    <Tooltip content="Número de questões a serem geradas (1 a 50)."
                      position="bottom" />
                  </div>
                  <Select
                    value={quantity}
                    onChange={setQuantity}
                    options={["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"]}
                    placeholder="Quantidade"
                    className="w-full"
                  />
                </div>

                <div className="w-full sm:flex-2 sm:min-w-70">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">Tema</label>
                    <Tooltip
                      content="Digite o assunto sobre o qual deseja gerar questões (ex: Direito Constitucional), você também pode copiar o conteudo de um PDF e colar aqui!"
                      position="bottom"
                    />
                  </div>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Digite um tema para gerar questões..."
                    className="border rounded-lg px-4 py-3 w-full"
                  />
                </div>

                {errorMessage && (
                  <div className="w-full">
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  </div>
                )}

                <button
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full sm:w-auto sm:min-w-36 flex items-center justify-center mt-auto"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : "Gerar"}
                </button>
              </div>
              
              {/* TEXTO DE BOAS-VINDAS */}
              <div className="mt-6 sm:mt-10 text-center text-gray-900 px-4">
                <p className="text-xl sm:text-2xl font-semibold">Bem-vindo ao BrainlyAI!</p>
                <p className="mt-2 text-base sm:text-lg">
                  Digite um tema, escolha a quantidade de questões e a banca para gerar suas questões personalizadas.
                  Você também pode selecionar uma sessão existente na barra lateral para revisar suas questões anteriores.
                </p>
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {currentSession && (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 text-gray-600">
              {currentSession.questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-4 sm:p-5 rounded-xl border">
                  <h3 className="font-semibold mb-4 text-sm sm:text-base">
                    {idx + 1}. {q.statement}
                  </h3>

                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const answered = q.userAnswerIndex !== undefined;
                      const isCorrect = i === q.correctAnswerIndex;
                      const isSelected = i === q.userAnswerIndex;

                      let style =
                        "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400";

                      if (answered) {
                        if (isCorrect)
                          style = "border-green-500 bg-green-50";
                        else if (isSelected)
                          style = "border-red-500 bg-red-50";
                        else
                          style = "border-gray-200 bg-gray-100";
                      }

                      return (
                        <button
                          key={i}
                          disabled={answered}
                          onClick={() => handleAnswer(q.id, i)}
                          className={`
                            w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border
                            transition-all duration-200 text-sm sm:text-base
                            ${style}
                            ${answered ? "cursor-default" : "cursor-pointer"}
                          `}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RESULTADO DE QUESTÕES CERTAS AO FINAL DA PÁGINA */}
          {currentSession && (
            <div className="max-w-3xl mx-auto mt-6 sm:mt-8 bg-white border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Respondidas:</strong> {answeredQuestions} / {totalQuestions}
                </p>
                <p>
                  <strong>Acertos:</strong> {correctAnswers}
                </p>
              </div>

              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {answeredQuestions === totalQuestions && (
                  <span>
                    🎯 Resultado: {correctAnswers}/{totalQuestions}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}