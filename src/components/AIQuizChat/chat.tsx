"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  RotateCcw,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import Select from "../ui/select";

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
    } catch (error) {
      console.error("Erro ao gerar questões", error);
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
    { icon: BookOpen, label: "Sessões", path: "/sessions" },
    { icon: Settings, label: "Configurações", path: "/settings" },
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
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
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

          <nav className="p-4 space-y-2 border-b">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  item.active
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 flex-1 overflow-y-auto space-y-2">
            <button
              onClick={resetQuiz}
              className="w-full flex items-center gap-2 border rounded-lg px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 border-gray-300"
            >
              <RotateCcw className="w-4 h-4 text-gray-800" />
              Nova sessão
            </button>

            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSessionSelect(s.id)}
                className={`w-full text-left text-gray-800 px-4 py-3 rounded-lg 
                  border border-gray-300
                  ${
                    activeSessionId === s.id
                      ? "bg-blue-50 border-blue-100"
                      : "hover:bg-gray-50"
                  }`}
              >
                <p className="font-medium truncate">
                  {s.sessionName || "Sem título"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          <div className="p-4 border-t">
            <button className="flex gap-3 items-center text-gray-600">
              <LogOut />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para fechar sidebar no mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Mobile com botão menu */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex gap-2 items-center">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Brain className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-gray-800">Quiz AI</h1>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* INPUT */}
          {!currentSession && (
            <div className="max-w-2xl mx-auto mb-6 flex flex-col gap-4 sm:gap-6 text-gray-900">
              {/* Prompt */}
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
                  className="w-full sm:flex-2 sm:min-w-60"
                />

                <Select
                  value={quantity}
                  onChange={setQuantity}
                  options={["5", "10", "15", "20"]}
                  placeholder="Quantidade"
                  className="w-full sm:flex-1 sm:min-w-40"
                />

                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Digite um tema para gerar questões..."
                  className="border rounded-lg px-4 py-3 w-full sm:flex-2 sm:min-w-70"
                />

                <button
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full sm:w-auto sm:min-w-36 flex items-center justify-center"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : "Gerar"}
                </button>
              </div>

              {/* TEXTO DE BOAS-VINDAS */}
              <div className="mt-6 sm:mt-10 text-center text-gray-900 px-4">
                <p className="text-xl sm:text-2xl font-semibold">Bem-vindo ao Quiz AI!</p>
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