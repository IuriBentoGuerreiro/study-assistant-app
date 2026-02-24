"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  RotateCcw,
  Loader2,
  Trophy,
  CheckCircle2,
  XCircle,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import Select from "../ui/select";
import Tooltip from "../ui/tooltip";
import Sidebar from "../ui/sidebar";
import Header from "../ui/header";
import { ibgeApi } from "@/src/lib/ibgeApi";

type ApiQuestionOption = {
  id: number;
  options: string;
};

type ApiQuestion = {
  id: number;
  statement: string;
  type: keyof typeof QuestionType;
  correctAnswerIndex: number;
  studyAnswer?: number | null;
  options: ApiQuestionOption[];
};

type QuestionDTO = {
  id: string;
  type: keyof typeof QuestionType;
  statement: string;
  correctAnswerIndex: number;
  studyAnswer?: number | null;
  options?: string[];
};

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

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
}

type AIQuizChatProps = {
  initialSessionId?: string;
};

export default function AIQuizChat({ initialSessionId }: AIQuizChatProps) {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [banca, setBanca] = useState<string>("");
  const [cargo, setCargo] = useState<string>("");
  const [orgao, setOrgao] = useState<string>("");
  const [nivel, setNivel] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [estados, setEstados] = useState<string[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const questionTypeOptions = [
    { label: "Múltipla escolha", value: "MULTIPLE_CHOICE" },
    { label: "Certo / Errado", value: "TRUE_FALSE" },
  ];

  const loadSessions = async () => {
    try {
      const { data } = await api.get<SessionListItem[]>(`/session`);
      setSessions(data);
    } catch (err) {
      console.error("Erro ao carregar sessões", err);
    }
  };

const goToSession = (sessionId: string | null) => {
  if (sessionId) {
    router.push(`/chat/${sessionId}`, { scroll: false });
  } else {
    router.push("/chat", { scroll: false });
  }
};

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { carregarEstados().then(setEstados); }, []);
  useEffect(() => {
    if (!estado) { setCidades([]); setCidade(""); return; }
    carregarCidades(estado).then(setCidades);
  }, [estado]);

  const generateQuestions = async () => {
    if (!topic.trim()) return;
    if (Number(quantity) > 50) { setErrorMessage("O limite máximo de questões é 50"); return; }
    setErrorMessage(null);
    setIsGenerating(true);
    const userId = Number(sessionStorage.getItem("userId"));
    try {
      const payload = {
        prompt: topic, banca: banca || undefined, quantidade: Number(quantity),
        type: questionType, orgao: orgao || undefined, cargo: cargo || undefined,
        cidade: cidade || undefined, estado: estado || undefined, nivel: nivel || undefined,
      };
      const response = await api.post(`/session/generateIa`, payload, {
        params: { userId },
        headers: { "Content-Type": "application/json" },
      });
      const questions: Question[] = response.data.questions.map((q: QuestionDTO) => ({
        id: q.id, type: QuestionType[q.type], statement: q.statement,
        options: q.options ?? [], correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex: q.studyAnswer === null || q.studyAnswer === undefined ? undefined : q.studyAnswer,
      }));
      const newSessionId = response.data.id;
      setCurrentSession({ id: newSessionId, topic, questions, completed: false });
      setActiveSessionId(newSessionId);
      goToSession(newSessionId);
      setTopic(""); setQuantity(""); setBanca(""); setSidebarOpen(false);
      await loadSessions();
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.response?.data || "Erro inesperado ao gerar questões";
      setErrorMessage(status === 400 ? message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  async function carregarEstados() {
    const { data } = await ibgeApi.get("/estados", { params: { orderBy: "nome" } });
    return data.map((estado: any) => estado.sigla);
  }

  async function carregarCidades(uf: string) {
    const { data } = await ibgeApi.get(`/estados/${uf}/municipios`, { params: { orderBy: "nome" } });
    return data.map((cidade: any) => cidade.nome);
  }

  const loadSessionQuestions = async (sessionId: string) => {
    try {
      const { data } = await api.get<ApiQuestion[]>(`/question/${sessionId}`);
      const normalizedQuestions: Question[] = data.map(q => ({
        id: String(q.id), type: QuestionType[q.type], statement: q.statement,
        options: q.options?.map(opt => opt.options) ?? [], correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex: q.studyAnswer === null || q.studyAnswer === undefined ? undefined : q.studyAnswer,
      }));
      setCurrentSession({
        id: sessionId,
        topic: sessions.find(s => s.id === sessionId)?.sessionName ?? "Sessão",
        questions: normalizedQuestions,
        completed: normalizedQuestions.every(q => q.userAnswerIndex !== undefined),
      });
      setSidebarOpen(false);
    } catch (err) {
      console.error("Erro ao carregar questões da sessão", err);
    }
  };

  const handleAnswer = async (questionId: string, optionIndex: number) => {
    if (!currentSession) return;
    await api.put("/question/user/response", { questionId, selectedOptionIndex: optionIndex });
    setCurrentSession((prev) => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map((q) =>
        q.id === questionId ? { ...q, userAnswerIndex: optionIndex } : q
      );
      const completed = updatedQuestions.every((q) => q.userAnswerIndex !== undefined);
      if (completed && !prev.completed) setTimeout(() => setShowResultsModal(true), 500);
      return { ...prev, questions: updatedQuestions, completed };
    });
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await api.delete(`/session/${sessionId}`);
      if (sessionId === activeSessionId) { setCurrentSession(null); setActiveSessionId(null); goToSession(null); }
      await loadSessions();
    } catch (err) {
      console.error("Erro ao deletar sessão", err);
    }
  };

  const resetQuiz = () => {
    setCurrentSession(null); setActiveSessionId(null); setTopic("");
    goToSession(null); setSidebarOpen(false); setShowResultsModal(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId); loadSessionQuestions(sessionId);
    goToSession(sessionId); setShowResultsModal(false);
  };

  const totalQuestions = currentSession?.questions.length ?? 0;
  const answeredQuestions = currentSession?.questions.filter(q => q.userAnswerIndex !== undefined).length ?? 0;
  const correctAnswers = currentSession?.questions.filter(q => q.userAnswerIndex === q.correctAnswerIndex).length ?? 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const sessionName = useMemo(() => sessions.find(s => s.id === activeSessionId)?.sessionName ?? "Sessão", [sessions, activeSessionId]);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: "Excelente! Você está dominando o conteúdo! 🎉", color: "text-green-600" };
    if (percentage >= 70) return { text: "Muito bom! Continue assim! 👏", color: "text-blue-600" };
    if (percentage >= 50) return { text: "Bom trabalho! Revise os pontos fracos. 📚", color: "text-yellow-600" };
    return { text: "Continue estudando! A prática leva à perfeição. 💪", color: "text-orange-600" };
  };

  // Estilos reutilizáveis para opções de questão
  const getOptionStyle = (answered: boolean, isCorrect: boolean, isSelected: boolean) => {
    if (!answered) return {
      border: "2px solid var(--border)",
      background: "var(--bg-card)",
      color: "var(--text)",
      cursor: "pointer",
    };
    if (isCorrect) return { border: "2px solid #22c55e", background: "#f0fdf4", color: "var(--text)", cursor: "default" };
    if (isSelected) return { border: "2px solid #ef4444", background: "#fef2f2", color: "var(--text)", cursor: "default" };
    return { border: "2px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-muted)", opacity: "0.6", cursor: "default" };
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)" }}>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        subtitle="Gerador de questões"
        listItems={sessions}
        activeItemId={activeSessionId}
        onItemSelect={handleSessionSelect}
        onNewItem={resetQuiz}
        newItemLabel="Nova sessão"
        newItemIcon={RotateCcw}
        showListSection={true}
        onItemDelete={handleDelete}
      />

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Gerar Questões" />

        <div className="p-4 sm:p-6">

          {/* FORMULÁRIO */}
          {!currentSession && (
            <div className="max-w-3xl mx-auto mb-6 flex flex-col gap-4" style={{ color: "var(--text)" }}>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Banca</label>
                    <Tooltip content="Selecione a instituição organizadora do concurso." position="bottom" />
                  </div>
                  <Select value={banca} onChange={setBanca} options={["Cespe/CEBRASPE", "Consulpam", "FGV", "FCC", "Vunesp", "IBFC", "FUNCAB", "AOCP", "Quadrix"]} placeholder="Selecione a banca" className="w-full" allowCustomValue />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Tipo de Questões</label>
                    <Tooltip content="Selecione o formato das questões." position="bottom" />
                  </div>
                  <Select value={questionType ?? ""} onChange={(value) => setQuestionType(value as QuestionType)} options={questionTypeOptions} placeholder="Selecione o tipo" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Quantidade</label>
                    <Tooltip content="Número de questões (5 a 50)." position="bottom" />
                  </div>
                  <Select value={quantity} onChange={setQuantity} options={["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"]} placeholder="Quantidade" className="w-full" allowCustomValue />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Orgão (opcional)</label>
                    <Tooltip content="Selecione o órgão do concurso." position="bottom" />
                  </div>
                  <Select value={orgao} onChange={setOrgao} options={["INSS", "Receita Federal do Brasil (RFB)", "Polícia Federal (PF)", "Polícia Rodoviária Federal (PRF)", "ABIN", "BACEN", "CGU", "TCU", "STF", "STJ", "TSE", "TST", "CNJ", "MPU", "DPU", "AGU", "Ministério da Fazenda", "Ministério da Justiça", "IBGE", "ANVISA", "ANATEL", "ANEEL", "ANP", "Caixa Econômica Federal", "Banco do Brasil", "Correios", "Universidades Federais", "Institutos Federais"]} placeholder="Selecione o órgão" className="w-full" allowCustomValue />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Cargo (opcional)</label>
                    <Tooltip content="Selecione o cargo." position="bottom" />
                  </div>
                  <Select value={cargo} onChange={setCargo} options={["Analista Administrativo", "Técnico Administrativo", "Assistente Administrativo", "Agente Administrativo", "Auxiliar Administrativo", "Analista do Seguro Social", "Técnico do Seguro Social", "Auditor-Fiscal", "Analista Tributário", "Analista Judiciário", "Técnico Judiciário", "Oficial de Justiça", "Analista de TI", "Técnico de TI", "Agente de Polícia Federal", "Delegado de Polícia Federal", "Perito Criminal Federal", "Policial Rodoviário Federal", "Professor", "Escriturário", "Analista Bancário"]} placeholder="Selecione o cargo" allowCustomValue />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Estado (opcional)</label>
                    <Tooltip content="Filtre por estado." position="bottom" />
                  </div>
                  <Select value={estado} onChange={setEstado} options={estados} placeholder="Estado" className="w-full" allowCustomValue />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Cidade (opcional)</label>
                    <Tooltip content="Filtre por cidade." position="bottom" />
                  </div>
                  <Select value={cidade} onChange={setCidade} options={cidades} placeholder="Cidade" className="w-full" allowCustomValue />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Nível (opcional)</label>
                    <Tooltip content="Nível do concurso." position="bottom" />
                  </div>
                  <Select value={nivel} onChange={setNivel} options={["Médio", "Superior"]} placeholder="Selecione o nível" />
                </div>
              </div>

              {/* Tema */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Tema</label>
                  <Tooltip content="Digite o assunto ou cole o conteúdo de um PDF." position="bottom" />
                </div>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Digite um tema para gerar questões... Você pode colar um texto extenso ou conteúdo de um PDF aqui."
                  className="rounded-lg px-4 py-3 w-full min-h-30 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text)",
                  }}
                />
              </div>

              {errorMessage && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c" }}>
                  {errorMessage}
                </div>
              )}

              <button
                onClick={generateQuestions}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin w-5 h-5" /><span>Gerando...</span></>
                ) : (
                  <><Brain className="w-5 h-5" /><span>Gerar Questões</span></>
                )}
              </button>

              {/* Boas-vindas */}
              <div className="mt-6 sm:mt-10 text-center px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xl sm:text-2xl font-semibold" style={{ color: "var(--text)" }}>Bem-vindo ao BrainlyAI!</p>
                <p className="mt-2 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
                  Digite um tema, escolha a quantidade de questões e a banca para gerar suas questões personalizadas.
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
                      <p className="text-lg font-semibold">{sessionName}</p>
                    </div>
                    <p className="text-blue-100 text-sm mb-3">
                      Aqui estão <strong>{totalQuestions}</strong> questões geradas{currentSession.topic && ` sobre: ${currentSession.topic}`}
                    </p>
                    <p className="text-white font-medium">Boa sorte! 🍀 Leia com atenção e faça o seu melhor!</p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-xs text-blue-100">Progresso</p>
                      <p className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-full transition-all duration-500 ease-out" style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* QUESTÕES */}
          {currentSession && (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {currentSession.questions.map((q, idx) => {
                const isAnswered = q.userAnswerIndex !== undefined;
                const isCorrect = q.userAnswerIndex === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-xl shadow-sm transition-all duration-300"
                    style={{
                      background: "var(--bg-card)",
                      border: `2px solid ${isAnswered ? (isCorrect ? "#bbf7d0" : "#fecaca") : "var(--border)"}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: "var(--text)" }}>
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-3">
                          {idx + 1}
                        </span>
                        {q.statement}
                      </h3>
                      {isAnswered && (
                        <div className="ml-3">
                          {isCorrect
                            ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                            : <XCircle className="w-6 h-6 text-red-500" />
                          }
                        </div>
                      )}
                    </div>

                    {/* MULTIPLE CHOICE */}
                    {q.type === "MULTIPLE_CHOICE" && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => {
                          const answered = q.userAnswerIndex !== undefined;
                          const optCorrect = i === q.correctAnswerIndex;
                          const isSelected = i === q.userAnswerIndex;
                          const s = getOptionStyle(answered, optCorrect, isSelected);
                          return (
                            <button
                              key={i}
                              disabled={answered}
                              onClick={() => handleAnswer(q.id, i)}
                              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 hover:shadow-md"
                              style={s as React.CSSProperties}
                            >
                              <span className="flex-1">{opt}</span>
                              {answered && optCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                              {answered && isSelected && !optCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
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
                          const optCorrect = i === q.correctAnswerIndex;
                          const isSelected = i === q.userAnswerIndex;
                          const s = getOptionStyle(answered, optCorrect, isSelected);
                          return (
                            <button
                              key={i}
                              disabled={answered}
                              onClick={() => handleAnswer(q.id, i)}
                              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between hover:shadow-md"
                              style={s as React.CSSProperties}
                            >
                              <span>{label}</span>
                              {answered && optCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                              {answered && isSelected && !optCorrect && <XCircle className="w-5 h-5 text-red-600" />}
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

          {/* RESUMO DE RESULTADOS */}
          {currentSession && answeredQuestions > 0 && (
            <div
              className="max-w-3xl mx-auto mt-6 sm:mt-8 rounded-xl p-4 sm:p-5 shadow-sm"
              style={{ background: "var(--bg-card)", border: "2px solid var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span><strong style={{ color: "var(--text)" }}>Respondidas:</strong> {answeredQuestions} / {totalQuestions}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span><strong style={{ color: "var(--text)" }}>Acertos:</strong> {correctAnswers}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span><strong style={{ color: "var(--text)" }}>Erros:</strong> {answeredQuestions - correctAnswers}</span>
                  </div>
                </div>
                {answeredQuestions === totalQuestions && (
                  <div className="text-center sm:text-right">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
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
          <div
            className="rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scaleIn"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>Parabéns! 🎉</h2>
              <p className="mb-6" style={{ color: "var(--text-muted)" }}>Você completou todas as questões!</p>

              <div className="rounded-xl p-6 mb-6" style={{ background: "var(--bg-subtle)" }}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Acertos</p>
                    <p className="text-3xl font-bold text-green-500">{correctAnswers}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Erros</p>
                    <p className="text-3xl font-bold text-red-500">{totalQuestions - correctAnswers}</p>
                  </div>
                </div>
                <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Aproveitamento</p>
                  <p className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</p>
                  <p className={`text-sm font-medium ${getPerformanceMessage().color}`}>{getPerformanceMessage().text}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{ background: "var(--bg-hover)", color: "var(--text)" }}
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}