"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Info, Loader2, RotateCcw, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import Tooltip from "../ui/Tooltip";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";
import { ContentLoader } from "../ui/ContentLoad";
import { useToast } from "@/hooks/useToast";

type SummaryListItem = {
  id: string;
  title: string;
  createdAt: string;
};

type Summary = {
  id: string;
  text: string;
};

type SummaryProps = {
  initialSummaryId?: string;
};

export default function AISummaryChat({ initialSummaryId }: SummaryProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaries, setSummaries] = useState<SummaryListItem[]>([]);
  const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const { toasts, showToast, setToasts } = useToast();

  useEffect(() => {
    if (initialSummaryId) {
      loadSummary(initialSummaryId);
      setActiveSummaryId(initialSummaryId);
    }
  }, [initialSummaryId]);

  useEffect(() => {
    loadSummaries();
  }, []);

  const goToSummary = (summaryId: string | null) => {
    if (summaryId) {
      router.push(`/summaries/${summaryId}`, { scroll: false });
    } else {
      router.push("/summaries", { scroll: false });
    }
  };

  const generateSummary = async () => {
    if (!prompt.trim()) return;

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const response = await api.post("/summaries/generate", prompt, {
        headers: { "Content-Type": "text/plain" },
      });

      const newSummary = response.data;

      setSummary(newSummary);
      setActiveSummaryId(newSummary.id);
      goToSummary(newSummary.id);
      setPrompt("");
      setSidebarOpen(false);
      await loadSummaries();
    } catch (error: any) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        "Erro inesperado ao gerar o resumo";

      setErrorMessage(
        status === 400 ? message : "Erro inesperado. Tente novamente."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSummaries = async () => {
    try {
      const { data } = await api.get<SummaryListItem[]>("/summaries");
      setSummaries(data);
    } catch {
      showToast("Erro ao carregar resumos", "error");
    }
  };

  const loadSummary = async (summaryId: string) => {
    try {
      setIsLoadingSummary(true);
      const { data } = await api.get<Summary>(`/summaries/${summaryId}`);
      setSummary(data);
      setActiveSummaryId(summaryId);
      setSidebarOpen(false);
    } catch {
      showToast("Erro ao carregar resumo", "error");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const deleteSummary = async (summaryId: string) => {
    try {
      await api.delete(`/summaries/${summaryId}`);
      showToast("Deletado com sucesso", "success");

      if (activeSummaryId === summaryId) {
        resetSummary();
      }

      await loadSummaries();
    } catch {
      showToast("Erro ao deletar resumo", "error");
    }
  };

  const handleSummarySelect = (summaryId: string) => {
    setActiveSummaryId(summaryId);
    loadSummary(summaryId);
    goToSummary(summaryId);
  };

  const resetSummary = () => {
    setSummary(null);
    setActiveSummaryId(null);
    setPrompt("");
    goToSummary(null);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        subtitle="Summary Generator"
        listItems={summaries}
        activeItemId={activeSummaryId}
        onItemSelect={handleSummarySelect}
        onNewItem={resetSummary}
        newItemLabel="Novo Resumo"
        newItemIcon={RotateCcw}
        showListSection={true}
        onItemDelete={deleteSummary}
      />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Summaries"
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {isLoadingSummary ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <ContentLoader message="Carregando Resumo..." />
              </div>
            ) : (
              <>
                {!summary && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label
                          className="text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          Resumo Prompt
                        </label>
                        <Tooltip
                          content="Describe the topic or paste your content to generate a structured summary."
                          position="bottom"
                        />
                      </div>

                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        placeholder="Exemplo: Fundamentos do direito constitucional..."
                        className="rounded-lg px-4 py-3 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          border: "1px solid var(--border)",
                          background: "var(--bg-card)",
                          color: "var(--text)",
                        }}
                      />
                    </div>

                    {errorMessage && (
                      <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      onClick={generateSummary}
                      disabled={isGenerating}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Generating...
                        </>
                      ) : (
                        "Gerar Resumos"
                      )}
                    </button>
                  </div>
                )}

                {summary && (
                  <div className="space-y-6">
                    <div
                      className="flex justify-between items-center border-b pb-4"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Resumo Gerado:
                      </h2>

                      <button
                        onClick={resetSummary}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Novo Resumo
                      </button>
                    </div>

                    <article className="prose prose-blue max-w-none">
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      >
                        {summary.text}
                      </ReactMarkdown>
                    </article>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white font-medium ${
              t.type === "success"
                ? "bg-emerald-600"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error" && <Trash size={18} />}
            {t.type === "info" && <Info size={18} />}
            <span>{t.message}</span>
            <button
              onClick={() =>
                setToasts((prev) =>
                  prev.filter((item) => item.id !== t.id)
                )
              }
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}