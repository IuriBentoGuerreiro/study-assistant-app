"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  RotateCcw,
  Loader2,
  Trophy,
  Target,
  CheckCircle2,
  Trash,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import { ibgeApi } from "@/src/lib/ibgeApi";
import Select from "../ui/Select";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";
import { useToast } from "@/hooks/useToast";
import { QuestionCard } from "../ui/QuestionCard";
import { QuestionType } from "@/src/types/Question";
import { ResultsModal } from "../ui/ResultsModal";
import { LabeledField } from "../ui/LabeledField";
import { ScoreLine } from "../ui/ScoreLine";
import { ContentLoader } from "../ui/ContentLoad";


type ApiQuestion = {
  id: string;
  statement: string;
  type: keyof typeof QuestionType;
  correctAnswerIndex: number;
  studyAnswer?: number | null;
  options: string[];
};

type QuestionDTO = {
  id: string;
  type: keyof typeof QuestionType;
  statement: string;
  correctAnswerIndex: number;
  studyAnswer?: number | null;
  options?: string[];
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

type SessionListItem = {
  id: string;
  sessionName: string;
  createdAt: string;
};

type ApiFullSession = SessionListItem & {
  questions: ApiQuestion[];
};

const QUESTION_TYPE_OPTIONS = [
  { label: "Múltipla escolha", value: "MULTIPLE_CHOICE" },
  { label: "Certo / Errado", value: "TRUE_FALSE" },
];

const QUANTITY_OPTIONS = ["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"];

const BANCA_OPTIONS = [
  "Cespe/CEBRASPE", "Consulpam", "FGV", "FCC", "Vunesp",
  "IBFC", "FUNCAB", "AOCP", "Quadrix",
];

const ORGAO_OPTIONS = [
  "INSS", "Receita Federal do Brasil (RFB)", "Polícia Federal (PF)",
  "Polícia Rodoviária Federal (PRF)", "ABIN", "BACEN", "CGU", "TCU",
  "STF", "STJ", "TSE", "TST", "CNJ", "MPU", "DPU", "AGU",
  "Ministério da Fazenda", "Ministério da Justiça", "IBGE", "ANVISA",
  "ANATEL", "ANEEL", "ANP", "Caixa Econômica Federal", "Banco do Brasil",
  "Correios", "Universidades Federais", "Institutos Federais",
];

const CARGO_OPTIONS = [
  "Analista Administrativo", "Técnico Administrativo", "Assistente Administrativo",
  "Agente Administrativo", "Auxiliar Administrativo", "Analista do Seguro Social",
  "Técnico do Seguro Social", "Auditor-Fiscal", "Analista Tributário",
  "Analista Judiciário", "Técnico Judiciário", "Oficial de Justiça",
  "Analista de TI", "Técnico de TI", "Agente de Polícia Federal",
  "Delegado de Polícia Federal", "Perito Criminal Federal",
  "Policial Rodoviário Federal", "Professor", "Escriturário", "Analista Bancário",
];

const NIVEL_OPTIONS = ["Médio", "Superior"];

function parseQuestionType(type: string): QuestionType {
  if (type === "MULTIPLE_CHOICE") return QuestionType.MULTIPLE_CHOICE;
  if (type === "TRUE_FALSE") return QuestionType.TRUE_FALSE;
  throw new Error(`Tipo de questão inválido: ${type}`);
}

function normalizeStudyAnswer(value?: number | null): number | undefined {
  return value === null || value === undefined ? undefined : value;
}

let estadosCache: string[] | null = null;
const cidadesCache = new Map<string, string[]>();

async function fetchEstados(): Promise<string[]> {
  if (estadosCache) return estadosCache;
  const { data } = await ibgeApi.get("/estados", { params: { orderBy: "nome" } });
  estadosCache = data.map((e: { sigla: string }) => e.sigla);
  return estadosCache!;
}

async function fetchCidades(uf: string): Promise<string[]> {
  if (cidadesCache.has(uf)) return cidadesCache.get(uf)!;
  const { data } = await ibgeApi.get(`/estados/${uf}/municipios`, { params: { orderBy: "nome" } });
  const cidades = data.map((c: { nome: string }) => c.nome);
  cidadesCache.set(uf, cidades);
  return cidades;
}

type AIQuizChatProps = {
  initialSessionId?: string;
};

export default function AIQuizChat({ initialSessionId }: AIQuizChatProps) {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [quantity, setQuantity] = useState("");
  const [banca, setBanca] = useState("");
  const [cargo, setCargo] = useState("");
  const [orgao, setOrgao] = useState("");
  const [nivel, setNivel] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);

  const [estados, setEstados] = useState<string[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const { toasts, showToast, setToasts } = useToast();


  const totalQuestions = currentSession?.questions.length ?? 0;
  const answeredQuestions = currentSession?.questions.filter(q => q.userAnswerIndex !== undefined).length ?? 0;
  const correctAnswers = currentSession?.questions.filter(q => q.userAnswerIndex === q.correctAnswerIndex).length ?? 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const sessionName = useMemo(() => {
    if (currentSession?.sessionName) return currentSession.sessionName;
    if (currentSession?.topic) return currentSession.topic;

    return sessions.find(s => s.id === activeSessionId)?.sessionName ?? "Sessão";
  }, [sessions, activeSessionId, currentSession]);

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => { fetchEstados().then(setEstados); }, []);

  useEffect(() => {
    if (!estado) { setCidades([]); setCidade(""); return; }
    fetchCidades(estado).then(setCidades);
  }, [estado]);

  useEffect(() => {
    if (!initialSessionId) { setActiveSessionId(null); setCurrentSession(null); return; }
    loadFullSession(initialSessionId);
  }, [initialSessionId]);

  const loadSessions = async () => {
    try {
      const { data } = await api.get<SessionListItem[]>("/session");
      setSessions(data);
    } catch (err) {
      showToast("Erro ao carregar sessões:", "error");
    }
  };

  const addSession = (session: SessionListItem) => {
    setSessions(prev => [session, ...prev]);
  };

  const removeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const loadFullSession = async (sessionId: string) => {
    try {
      setIsLoadingSession(true);
      const { data } = await api.get<ApiFullSession>(`/session/${sessionId}/full`);

      const questions: Question[] = data.questions.map(q => ({
        id: q.id,
        type: parseQuestionType(q.type),
        statement: q.statement,
        options: q.options ?? [],
        correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex: normalizeStudyAnswer(q.studyAnswer),
      }));

      setActiveSessionId(sessionId);
      setCurrentSession({
        id: sessionId,
        topic: data.sessionName,
        sessionName: data.sessionName,
        questions,
        completed: questions.every(q => q.userAnswerIndex !== undefined),
      });
      setSidebarOpen(false);
    } catch (err) {
      showToast("Erro ao carregar sessão completa:", "error");
    } finally {
      setIsLoadingSession(false);
    }
  };

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
      const payload = {
        prompt: topic,
        quantidade: Number(quantity),
        type: questionType,
        banca: banca || undefined,
        orgao: orgao || undefined,
        cargo: cargo || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        nivel: nivel || undefined,
      };

      const { data } = await api.post("/session/generateIa", payload, {
        params: { userId },
        headers: { "Content-Type": "application/json" },
      });

      const questions: Question[] = data.questions.map((q: QuestionDTO) => ({
        id: q.id,
        type: QuestionType[q.type],
        statement: q.statement,
        options: q.options ?? [],
        correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex: normalizeStudyAnswer(q.studyAnswer),
      }));

      setActiveSessionId(data.id);
      setCurrentSession({ id: data.id, topic, questions, completed: false });

      addSession({ id: data.id, sessionName: topic, createdAt: new Date().toISOString() });

      router.push(`/chat/${data.id}`, { scroll: false });

      setTopic("");
      setQuantity("");
      setBanca("");
      setCargo("");
      setOrgao("");
      setNivel("");
      setCidade("");
      setEstado("");
      setQuestionType(null);
      setSidebarOpen(false);
    } catch (error: any) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Erro inesperado ao gerar questões";
      showToast(status === 400 ? message : "Erro inesperado. Tente novamente.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async (questionId: string, optionIndex: number) => {
    if (!currentSession) return;

    await api.put("/question/user/response", { questionId, selectedOptionIndex: optionIndex });

    setCurrentSession(prev => {
      if (!prev) return prev;

      const updatedQuestions = prev.questions.map(q =>
        q.id === questionId ? { ...q, userAnswerIndex: optionIndex } : q,
      );
      const isNowCompleted = updatedQuestions.every(q => q.userAnswerIndex !== undefined);

      if (isNowCompleted && !prev.completed) {
        setTimeout(() => setShowResultsModal(true), 500);
      }

      return { ...prev, questions: updatedQuestions, completed: isNowCompleted };
    });
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await api.delete(`/session/${sessionId}`);
      showToast("Deletado com sucesso:", "success");

      removeSession(sessionId);
      if (sessionId === activeSessionId) {
        setCurrentSession(null);
        setActiveSessionId(null);
      }
    } catch (err) {
      showToast("Erro ao deletar sessão:", "error");
    }
  };

  const resetQuiz = () => {
    setCurrentSession(null);
    setActiveSessionId(null);
    setTopic("");
    setShowResultsModal(false);
    setSidebarOpen(false);
    router.push("/practice-tests", { scroll: false });
  };

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/practice-tests/${sessionId}`, { scroll: false });
    setShowResultsModal(false);
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
        showListSection
        onItemDelete={handleDelete}
      />

      <div className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Gerar Questões" />

        <div className="p-4 sm:p-6">
          {isLoadingSession ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <ContentLoader message="Buscando sua sessão..." />
            </div>
          ) : (
            <>
              {!currentSession && (
                <div className="max-w-3xl mx-auto mb-6 flex flex-col gap-4" style={{ color: "var(--text)" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <LabeledField label="Banca" tooltip="Selecione a banca">
                      <Select value={banca} onChange={setBanca} options={BANCA_OPTIONS} placeholder="Selecione a banca" allowCustomValue />
                    </LabeledField>
                    <LabeledField label="Tipo de Questões" tooltip="Selecione o formato">
                      <Select value={questionType ?? ""} onChange={v => setQuestionType(v as QuestionType)} options={QUESTION_TYPE_OPTIONS} placeholder="Selecione o tipo" />
                    </LabeledField>
                    <LabeledField label="Quantidade" tooltip="5 a 50">
                      <Select value={quantity} onChange={setQuantity} options={QUANTITY_OPTIONS} placeholder="Quantidade" allowCustomValue />
                    </LabeledField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <LabeledField
                      label="Órgão (opcional)"
                      tooltip="Selecione ou digite o órgão público do concurso (ex: INSS, RFB)."
                    >
                      <Select value={orgao} onChange={setOrgao} options={ORGAO_OPTIONS} placeholder="Selecione o órgão" allowCustomValue />
                    </LabeledField>

                    <LabeledField
                      label="Cargo (opcional)"
                      tooltip="Especifique o cargo pretendido para direcionar as questões."
                    >
                      <Select value={cargo} onChange={setCargo} options={CARGO_OPTIONS} placeholder="Selecione o cargo" allowCustomValue />
                    </LabeledField>

                    <LabeledField
                      label="Estado (opcional)"
                      tooltip="Filtre questões aplicadas em exames de um estado específico."
                    >
                      <Select value={estado} onChange={setEstado} options={estados} placeholder="Estado" allowCustomValue />
                    </LabeledField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <LabeledField
                      label="Cidade (opcional)"
                      tooltip="Filtre questões de concursos municipais específicos."
                    >
                      <Select value={cidade} onChange={setCidade} options={cidades} placeholder="Cidade" allowCustomValue />
                    </LabeledField>

                    <LabeledField
                      label="Nível (opcional)"
                      tooltip="Escolha entre nível Médio ou Superior."
                    >
                      <Select value={nivel} onChange={setNivel} options={NIVEL_OPTIONS} placeholder="Selecione o nível" />
                    </LabeledField>
                  </div>

                  <LabeledField label="Tema" tooltip="Assunto ou conteúdo de PDF">
                    <textarea
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="Digite um tema para gerar questões..."
                      className="rounded-lg px-4 py-3 w-full min-h-30 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)" }}
                    />
                  </LabeledField>

                  {errorMessage && (
                    <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    onClick={generateQuestions}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {isGenerating ? <><Loader2 className="animate-spin w-5 h-5" /> Gerando...</> : <><Brain className="w-5 h-5" /> Gerar Questões</>}
                  </button>

                  <div className="mt-10 text-center px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xl font-semibold">Bem-vindo ao BrainlyAI!</p>
                    <p className="mt-2 text-muted-foreground">Personalize seus estudos gerando questões com IA.</p>
                  </div>
                </div>
              )}

              {currentSession && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5" />
                          <p className="text-lg font-semibold">{sessionName}</p>
                        </div>
                        <p className="text-blue-100 text-sm mb-3">
                          Total de <strong>{totalQuestions}</strong> questões sobre {sessionName}. Boa sorte! 🍀
                        </p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                        <p className="text-xs text-blue-100">Progresso</p>
                        <p className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div className="bg-white h-full transition-all duration-500" style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentSession.questions.map((q, idx) => (
                      <QuestionCard key={q.id} question={q} index={idx} onAnswer={handleAnswer} />
                    ))}
                  </div>

                  {answeredQuestions > 0 && (
                    <div className="rounded-xl p-5 border-2 border-dashed border-gray-200 bg-card shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-2 w-full sm:w-auto">
                          <ScoreLine color="bg-blue-500" label="Respondidas" value={`${answeredQuestions} / ${totalQuestions}`} />
                          <ScoreLine color="bg-green-500" label="Acertos" value={String(correctAnswers)} />
                          <ScoreLine color="bg-red-500" label="Erros" value={String(answeredQuestions - correctAnswers)} />
                        </div>
                        {answeredQuestions === totalQuestions && (
                          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            <div>
                              <p className="text-xs text-blue-600 font-bold uppercase">Resultado</p>
                              <p className="text-3xl font-black text-blue-700">{percentage}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-right-full duration-300 ${t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"}`}>
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error" && <Trash size={18} />}
            {t.type === "info" && <Info size={18} />}
            <span>{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))} className="ml-2 hover:opacity-70 transition-opacity">&times;</button>
          </div>
        ))}
      </div>

      {showResultsModal && (
        <ResultsModal
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          percentage={percentage}
          onReview={() => setShowResultsModal(false)}
          onNewSession={resetQuiz}
        />
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