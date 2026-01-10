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
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";

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

export default function AIQuizChat() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
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

  useEffect(() => {
    loadSessions();
  }, []);

  const generateQuestions = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    const userId = Number(sessionStorage.getItem("userId"));

    try {
      const response = await api.post(
        `/session/generateIa?userId=${userId}`,
        { prompt: topic },
        { headers: { "Content-Type": "application/json" } }
      );

      const questions: Question[] = response.data.questions.map((q: any) => ({
        id: q.id,
        statement: q.statement,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
      }));

      setCurrentSession({
        id: crypto.randomUUID(),
        topic,
        questions,
        completed: false,
      });

      setTopic("");
    } catch (error) {
      console.error("Erro ao gerar questões", error);
    } finally {
      setIsGenerating(false);
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
    setTopic("");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat", active: true },
    { icon: BookOpen, label: "Sessões", path: "/sessions" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${item.active
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
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left text-gray-800 px-4 py-3 rounded-lg 
      border border-gray-300
      ${activeSessionId === s.id
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

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* INPUT */}
        {!currentSession && (
          <div className="max-w-2xl mx-auto mb-6 flex gap-3 text-gray-900">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Digite um texto para gerar questões..."
              className="flex-1 border rounded-lg px-4 py-3"
            />
            <button
              onClick={generateQuestions}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 rounded-lg"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : "Gerar"}
            </button>
          </div>
        )}

        {/* QUESTIONS */}
        {currentSession && (
          <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
            {currentSession.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 rounded-xl border">
                <h3 className="font-semibold mb-4">
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
                  w-full text-left px-4 py-3 rounded-lg border
                  transition-all duration-200
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

      </div>
    </div>
  );
}
