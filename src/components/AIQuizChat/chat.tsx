"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Sparkles, Brain, RotateCcw } from "lucide-react";
import { api } from "@/src/lib/api";
import { UserResponse } from "@/src/types/UserResponse";

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


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateQuestions = async (topic: string) => {
    setIsGenerating(true);

    const { data: responseMe } = await api.get<UserResponse>(
      "/auth/me",
    );

    sessionStorage.setItem("userId", String(responseMe.id))

    const userId = sessionStorage.getItem("userId")

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

      const questions: Question[] = questionsData.map((q: any, idx: number) => ({
        id: `${sessionId}-q${idx + 1}`,
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
      const userId = sessionStorage.getItem("userId")

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

    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];

    if (!currentQuestion.correctAnswerIndex) return;

    const correctLetter =
      String.fromCharCode(64 + currentQuestion.correctAnswerIndex);

    const userLetter = answer.toUpperCase().trim();

    const isCorrect = userLetter === correctLetter;

    const updatedQuestions = [...currentSession.questions];
    updatedQuestions[currentSession.currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect,
    };

    const nextIndex = currentSession.currentQuestionIndex + 1;
    const isSessionCompleted = nextIndex >= currentSession.questions.length;

    const updatedSession: Session = {
      ...currentSession,
      questions: updatedQuestions,
      currentQuestionIndex: nextIndex,
      completed: isSessionCompleted,
    };

    setCurrentSession(updatedSession);

    const feedbackMessage: Message = {
      id: crypto.randomUUID(),
      text: isCorrect
        ? `✅ Correto! A resposta é ${correctLetter}.`
        : `❌ Incorreto. A resposta correta é ${correctLetter}.`,
      sender: "bot",
      type: "result",
    };

    setMessages((prev) => [...prev, feedbackMessage]);

    if (isSessionCompleted) {
      const correctCount = updatedQuestions.filter((q) => q.isCorrect).length;
      const percentage = (correctCount / updatedQuestions.length) * 100;

      const finalMessage: Message = {
        id: crypto.randomUUID(),
        text: `🎉 Parabéns! Você completou o questionário!\n\n📊 Resultado:\n✅ Acertos: ${correctCount}/10\n📈 Aproveitamento: ${percentage.toFixed(0)}%\n\nEnvie outro texto para começar um novo questionário!`,
        sender: "bot",
        type: "result",
      };

      setMessages((prev) => [...prev, finalMessage]);
    } else {
      const nextQuestionMessage: Message = {
        id: crypto.randomUUID(),
        text: `Questão ${nextIndex + 1} de 10:`,
        sender: "bot",
        type: "normal",
      };

      const questionMessage: Message = {
        id: crypto.randomUUID(),
        text: updatedSession.questions[nextIndex].question,
        sender: "bot",
        type: "question",
      };

      setMessages((prev) => [...prev, nextQuestionMessage, questionMessage]);
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

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black/40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2">
              <Brain className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Quiz AI</h2>
              <p className="text-xs text-gray-400">Gerador de questões</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={resetChat}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition hover:bg-white/5"
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
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition
      ${activeSessionId === session.id
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black/40 text-white hover:bg-white/5"
                }`}
            >
              <p className="font-medium truncate">{session.sessionName || "Chat Sem Título"}</p>
            </button>
          ))}

        </div>

        <div className="p-4 border-t border-white/10">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-xs text-gray-400">
              Sessão ativa
            </p>
            {currentSession && !currentSession.completed && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Questão {currentSession.currentQuestionIndex + 1}/10
                </span>
                <div className="h-2 flex-1 ml-3 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-300"
                    style={{ width: `${((currentSession.currentQuestionIndex + 1) / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header Mobile */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-4 md:hidden">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2">
              <Brain className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Quiz AI</h2>
            </div>
          </div>
          {currentSession && !currentSession.completed && (
            <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white">
              {currentSession.currentQuestionIndex + 1}/10
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[85%] items-start gap-3">
                  {msg.sender === "bot" && (
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white">
                      <Sparkles className="h-4 w-4 text-black" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 shadow-lg transition-all ${msg.sender === "user"
                      ? "rounded-tr-none bg-white text-black"
                      : msg.type === "result"
                        ? "rounded-tl-none border-2 border-white bg-black/40 text-white"
                        : msg.type === "question"
                          ? "rounded-tl-none border-l-4 border-white bg-black/40 text-white"
                          : "rounded-tl-none border border-white/10 bg-black/40 text-white"
                      }`}
                  >
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                      U
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl rounded-tl-none border border-white/10 bg-black/40 p-4 shadow-md">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-sm text-gray-400">Gerando questões</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-black/40 p-4 md:p-6">
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
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
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