"use client";

import { useState, useEffect } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import Tooltip from "../ui/Tooltip";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";
import { ContentLoader } from "../ui/ContentLoad";

type ResumeListItem = {
  id: string;
  title: string;
  createdAt: string;
};

type Resume = {
  id: string;
  text: string;
};

type ResumeProps = {
  initialResumeId?: string;
};


export default function AIResumeChat({ initialResumeId }: ResumeProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [resume, setResume] = useState<Resume | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

  const [isLoadingResume, setIsLoadingResume] = useState(false);


  useEffect(() => {
    if (initialResumeId) {
      loadResume(initialResumeId);
      setActiveResumeId(initialResumeId);
    }
  }, [initialResumeId]);

  useEffect(() => { loadResumes(); }, []);

  const goToResume = (resumeId: string | null) => {
    if (resumeId) {
      router.push(`/resume/${resumeId}`, { scroll: false });
    } else {
      router.push("/resume", { scroll: false });
    }
  };

  const generateResume = async () => {
    if (!prompt.trim()) return;
    setErrorMessage(null);
    setIsGenerating(true);
    try {
      const response = await api.post("/resume/generate", prompt, {
        headers: { "Content-Type": "text/plain" },
      });
      const newResume = response.data;
      setResume(newResume);
      setActiveResumeId(newResume.id);
      goToResume(newResume.id);
      setPrompt("");
      setSidebarOpen(false);
      await loadResumes();
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Erro inesperado ao gerar o resumo";
      setErrorMessage(status === 400 ? message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadResumes = async () => {
    try {
      const { data } = await api.get<ResumeListItem[]>(`/resume`);
      setResumes(data);
    } catch (err) {
      console.error("Erro ao carregar resumos", err);
    }
  };

  const loadResume = async (resumeId: string) => {
    try {
      setIsLoadingResume(true);
      const { data } = await api.get<Resume>(`/resume/${resumeId}`);
      setResume(data);
      setActiveResumeId(resumeId);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Erro ao carregar resumo", err);
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    setActiveResumeId(resumeId);
    loadResume(resumeId);
    goToResume(resumeId);
  };

  const resetResume = () => {
    setResume(null);
    setActiveResumeId(null);
    setPrompt("");
    goToResume(null);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)" }}>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        subtitle="Gerador de Resumos"
        listItems={resumes}
        activeItemId={activeResumeId}
        onItemSelect={handleResumeSelect}
        onNewItem={resetResume}
        newItemLabel="Novo resumo"
        newItemIcon={RotateCcw}
        showListSection={true}
      />

      <div className="flex-1 flex flex-col" style={{ background: "var(--bg)" }}>

        <Header onMenuClick={() => setSidebarOpen(true)} title="Resumos" />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {isLoadingResume ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <ContentLoader message="Buscando resumo salvo..." />
              </div>
            ) : (
              <>

                {!resume && (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
                          Prompt do resumo
                        </label>
                        <Tooltip
                          content="Descreva o tema desejado para gerar um resumo. Você pode colar o conteúdo de um PDF aqui!"
                          position="bottom"
                        />
                      </div>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        placeholder="Ex: Princípios fundamentais da Constituição Federal de 1988..."
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
                      onClick={generateResume}
                      disabled={isGenerating}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Gerando...
                        </>
                      ) : (
                        "Gerar resumo"
                      )}
                    </button>
                  </div>
                )}

                {resume && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: "var(--border)" }}>
                      <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                        Resumo gerado:
                      </h2>
                      <button
                        onClick={resetResume}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Novo Resumo
                      </button>
                    </div>

                    <article className="prose prose-blue max-w-none">
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={{
                          h1: ({ ...props }) => <h1 className="text-2xl font-bold text-blue-600 mt-6 mb-3" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-xl font-semibold text-blue-500 mt-5 mb-2" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-lg font-semibold text-blue-400 mt-4 mb-2" {...props} />,
                          p: ({ ...props }) => <p className="leading-relaxed mb-4 text-justify" style={{ color: "var(--text-muted)" }} {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
                          li: ({ ...props }) => <li style={{ color: "var(--text-muted)" }} {...props} />,
                          strong: ({ ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                          mark: ({ ...props }) => <mark className="bg-yellow-200 text-gray-900 px-1 rounded" {...props} />,
                        }}
                      >
                        {resume.text}
                      </ReactMarkdown>
                    </article>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}