"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Sparkles, Brain, RotateCcw, Menu, X, LayoutDashboard, BookOpen, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";

type SessionListItem = {
  id: string;
  sessionName: string;
  createdAt: string;
};

type Question = {
  id: string;
  question: string;
  userAnswer?: string;
  isCorrect?: boolean;
  correctAnswerIndex?: number;
};

type Session = {
  id: string;
  topic: string;
  questions: Question[];
  currentQuestionIndex: number;
  completed: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  type?: "question" | "result" | "normal";
};

export default function AIQuizChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: "Olá! 👋 Envie um texto sobre qualquer assunto e vou gerar 10 questões para você responder.",
      sender: "bot",
      type: "normal",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateQuestions = async (topic: string) => {
    setIsGenerating(true);

    const userId = Number(sessionStorage.getItem("userId"));

    try {
      const response = await api.post(
        `/session/generateIa?userId=${userId}`,
        { prompt: topic },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const questionsData = Array.isArray(response.data?.questions)
        ? response.data.questions
        : [];

      const sessionId = crypto.randomUUID();

      const questions: Question[] = questionsData.map((q: any) => ({
        id: q.id,
        question: `${q.statement}\n\n${q.options.join("\n")}`,
        userAnswer: undefined,
        isCorrect: undefined,
        correctAnswerIndex: q.correctAnswerIndex,
      }));

      const session: Session = {
        id: sessionId,
        topic,
        questions,
        currentQuestionIndex: 0,
        completed: false,
      };

      setCurrentSession(session);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: `✅ Perfeito! Gerei 10 questões sobre "${topic}". Vamos começar!\n\nQuestão 1 de 10:`,
        sender: "bot",
        type: "normal",
      };

      const questionMessage: Message = {
        id: crypto.randomUUID(),
        text: questions[0].question,
        sender: "bot",
        type: "question",
      };

      setMessages((prev) => [...prev, botMessage, questionMessage]);
    } catch (error) {
      console.error("Erro ao gerar questões:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: "❌ Desculpe, ocorreu um erro ao gerar as questões. Por favor, tente novamente.",
          sender: "bot",
          type: "normal",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSessions = async () => {
    try {
      const userId = Number(sessionStorage.getItem("userId"));

      const { data } = await api.get<SessionListItem[]>(
        `/session/${userId}`
      );

      setSessions(data);
    } catch (err) {
      console.error("Erro ao carregar sessões", err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const processAnswer = async (answer: string) => {
    if (!currentSession) return;

    const currentQuestion =
      currentSession.questions[currentSession.currentQuestionIndex];

    if (currentQuestion.correctAnswerIndex == null) return;

    const userLetter = answer.toUpperCase().trim();
    const optionIndex = userLetter.charCodeAt(0) - 65;

    if (optionIndex < 0 || optionIndex > 3) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        text: "❗ Resposta inválida. Digite apenas A, B, C ou D.",
        sender: "bot",
        type: "normal",
      }]);
      return;
    }

    await api.put("/question/user/response", {
      questionId: currentQuestion.id,
      selectedOptionIndex: optionIndex,
    });

    const correctLetter = String.fromCharCode(
      65 + currentQuestion.correctAnswerIndex
    );

    const isCorrect = userLetter === correctLetter;

    const updatedQuestions = [...currentSession.questions];
    updatedQuestions[currentSession.currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: userLetter,
      isCorrect,
    };

    const nextIndex = currentSession.currentQuestionIndex + 1;
    const completed = nextIndex >= updatedQuestions.length;

    setCurrentSession({
      ...currentSession,
      questions: updatedQuestions,
      currentQuestionIndex: nextIndex,
      completed,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: isCorrect
          ? `✅ Correto! A resposta é ${correctLetter}.`
          : `❌ Incorreto. A resposta correta é ${correctLetter}.`,
        sender: "bot",
        type: "result",
      },
    ]);

    if (completed) {
      const correctCount = updatedQuestions.filter((q) => q.isCorrect).length;
      const percentage = (correctCount / updatedQuestions.length) * 100;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: `🎉 Questionário finalizado!\n\n✅ Acertos: ${correctCount}/10\n📈 Aproveitamento: ${percentage.toFixed(0)}%`,
          sender: "bot",
          type: "result",
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: `Questão ${nextIndex + 1} de 10:`,
          sender: "bot",
          type: "normal",
        },
        {
          id: crypto.randomUUID(),
          text: updatedQuestions[nextIndex].question,
          sender: "bot",
          type: "question",
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
      type: "normal",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (!currentSession || currentSession.completed) {
      generateQuestions(input);
    } else {
      processAnswer(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isGenerating) handleSend();
  };

  const resetChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        text: "Olá! 👋 Envie um texto sobre qualquer assunto e vou gerar 10 questões para você responder.",
        sender: "bot",
        type: "normal",
      },
    ]);
    setCurrentSession(null);
    setInput("");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Brain, label: "Chat", path: "/chat", active: true },
    { icon: BookOpen, label: "Sessões", path: "/sessions" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Quiz AI</h1>
                <p className="text-xs text-gray-500">Gerador de questões</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2 border-b">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={resetChat}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Nova sessão</span>
            </button>

            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                }}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm transition ${
                  activeSessionId === session.id
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium truncate">{session.sessionName || "Chat Sem Título"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* Progress Footer */}
          <div className="p-4 border-t">
            {currentSession && !currentSession.completed && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600 mb-2">Sessão ativa</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    Questão {currentSession.currentQuestionIndex + 1}/10
                  </span>
                  <div className="h-2 flex-1 ml-3 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${((currentSession.currentQuestionIndex + 1) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <button className="flex items-center w-full px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-600 hover:text-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">Chat Quiz</h2>
            </div>
            
            {currentSession && !currentSession.completed && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                <span className="text-sm font-medium">
                  Questão {currentSession.currentQuestionIndex + 1}/10
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[85%] items-start gap-3">
                  {msg.sender === "bot" && (
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 shadow-sm transition-all ${
                      msg.sender === "user"
                        ? "rounded-tr-none bg-blue-600 text-white"
                        : msg.type === "result"
                        ? "rounded-tl-none bg-white border-2 border-blue-200 text-gray-800"
                        : msg.type === "question"
                        ? "rounded-tl-none border-l-4 border-blue-600 bg-white text-gray-800"
                        : "rounded-tl-none bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
                      U
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl rounded-tl-none bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Gerando questões</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4 md:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder={
                  !currentSession || currentSession.completed
                    ? "Digite um texto para gerar questões..."
                    : "Digite sua resposta (A, B, C ou D)..."
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Enviar</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}