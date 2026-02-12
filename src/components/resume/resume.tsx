"use client";

import { useState, useEffect } from "react";
import {
    Loader2,
    FileText,
    RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import Tooltip from "../ui/tooltip";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Sidebar from "../ui/sidebar";
import Header from "../ui/header";

type ResumeListItem = {
    id: string;
    title: string;
    createdAt: string;
};

type Resume = {
    id: string;
    text: string;
};

export default function AIResumeChat() {
    const router = useRouter();

    const [prompt, setPrompt] = useState("");
    const [resume, setResume] = useState<Resume | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [resumes, setResumes] = useState<ResumeListItem[]>([]);
    const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        const resumeIdFromURL = searchParams.get("id");

        if (resumeIdFromURL) {
            loadResume(resumeIdFromURL);
            setActiveResumeId(resumeIdFromURL);
        }
    }, []);

    useEffect(() => {
        loadResumes();
    }, []);

    const updateURL = (resumeId: string | null) => {
        if (resumeId) {
            router.push(`/resume?id=${resumeId}`, { scroll: false });
        } else {
            router.push("/resume", { scroll: false });
        }
    };

    const generateResume = async () => {
        if (!prompt.trim()) return;

        setErrorMessage(null);
        setIsGenerating(true);

        try {
            const response = await api.post(
                "/resume/generate",
                prompt,
                {
                    headers: {
                        "Content-Type": "text/plain",
                    },
                }
            );

            const newResume = response.data;

            setResume(newResume);
            setActiveResumeId(newResume.id);
            updateURL(newResume.id);
            setPrompt("");
            setSidebarOpen(false);

            await loadResumes();

        } catch (error: any) {
            const status = error.response?.status;
            const message =
                error.response?.data?.message ||
                "Erro inesperado ao gerar o resumo";

            if (status === 400) {
                setErrorMessage(message);
            } else {
                setErrorMessage("Erro inesperado. Tente novamente.");
            }
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
            const { data } = await api.get<Resume>(`/resume/${resumeId}`);
            setResume(data);
            setActiveResumeId(resumeId);
            setSidebarOpen(false);
        } catch (err) {
            console.error("Erro ao carregar resumo", err);
        }
    };


    const handleResumeSelect = (resumeId: string) => {
        setActiveResumeId(resumeId);
        loadResume(resumeId);
        updateURL(resumeId);
    };

    const resetResume = () => {
        setResume(null);
        setActiveResumeId(null);
        setPrompt("");
        updateURL(null);
        setSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Sidebar */}
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

            <div className="flex-1 flex flex-col bg-gray-50">

                {/* HEADER */}
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    title="Resumos"
                />

                {/* MAIN */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-6xl mx-auto space-y-6 text-gray-900">

                        {/* INPUT */}
                        {!resume && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Prompt do resumo
                                        </label>
                                        <Tooltip
                                            content="Descreva o tema desejado para gerar um resumo. Você pode colar o conteudo de um PDF aqui!."
                                            position="bottom"
                                        />
                                    </div>

                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        rows={6}
                                        placeholder="Ex: Princípios fundamentais da Constituição Federal de 1988..."
                                        className="border rounded-lg px-4 py-3 w-full resize-none"
                                    />
                                </div>

                                {errorMessage && (
                                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    onClick={generateResume}
                                    disabled={isGenerating}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        "Gerar resumo"
                                    )}
                                </button>
                            </div>
                        )}

                        {/* RESULTADO */}
                        {resume && (
                            <div className="mb-4 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Resumo gerado:
                                </h2>
                                <button
                                    onClick={resetResume}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    Novo Resumo
                                </button>
                            </div>
                        )}

                        {resume && (
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                components={{
                                    h1: ({ node, ...props }) => (
                                        <h1 className="text-2xl font-bold text-blue-600 mt-6 mb-3" {...props} />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2 className="text-xl font-semibold text-blue-600 mt-5 mb-2" {...props} />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3 className="text-lg font-semibold text-blue-500 mt-4 mb-2" {...props} />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="text-gray-700 leading-relaxed mb-3" {...props} />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li className="text-gray-700" {...props} />
                                    ),
                                    strong: ({ node, ...props }) => (
                                        <strong className="text-gray-900 font-semibold" {...props} />
                                    ),
                                    mark: ({ node, ...props }) => (
                                        <mark className="bg-yellow-200 text-gray-900 px-1 rounded font-medium" {...props} />
                                    ),
                                }}
                            >
                                {resume.text}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}