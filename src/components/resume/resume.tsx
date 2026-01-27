"use client";

import { useState, useEffect } from "react";
import {
    Brain,
    Menu,
    X,
    LayoutDashboard,
    LogOut,
    Loader2,
    FileText,
    MessageSquare,
    RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import Tooltip from "../ui/tooltip";
import { logout } from "@/src/utils/logout";
import ReactMarkdown from "react-markdown";

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

    useEffect(() => {
        loadResumes();
    }, []);



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

            setResume(response.data);
            setPrompt("");
            setSidebarOpen(false);
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


    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: MessageSquare, label: "Chat", path: "/chat" },
        { icon: FileText, label: "Resumos", path: "/resume", active: true },
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
                                <h1 className="font-bold text-gray-800">BrainlyAI</h1>
                                <p className="text-xs text-gray-700">Assistente inteligente</p>
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
                            onClick={() => {
                                setResume(null);
                                setActiveResumeId(null);
                                setPrompt("");
                                setSidebarOpen(false);
                            }}
                            className="w-full flex items-center gap-2 border rounded-lg px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 border-gray-300"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Novo resumo
                        </button>

                        {resumes.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => loadResume(r.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg border
        ${activeResumeId === r.id
                                        ? "bg-blue-50 border-blue-100"
                                        : "hover:bg-gray-50 border-gray-300"}
      `}
                            >
                                <p className="font-medium truncate text-gray-800">
                                    {r.title || "Resumo sem título"}
                                </p>
                                <p className="text-xs text-gray-800">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </p>
                            </button>
                        ))}
                    </div>


                    {/* Logout */}
                    <div className="p-4 border-t mt-auto" onClick={logout}>
                        <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* MAIN */}
            <div className="flex-1 overflow-y-auto">
                {/* Header mobile */}
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
                        <h1 className="font-bold text-gray-800">BrainlyAI</h1>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 sm:p-6">
                    <div className="max-w-6xl mx-auto space-y-6 text-gray-900">
                        {/* INPUT */}
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
                                    placeholder="Ex: Princípios fundamentais da Constituição Federal de 1988, fundamentos da República..."
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
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center justify-center"
                            >
                                {isGenerating ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Gerar resumo"
                                )}
                            </button>
                        </div>

                        {/* RESULTADO */}
                        {resume && (
                            <div className="bg-white border rounded-xl p-6 shadow-sm">
                                <h2 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Resumo gerado
                                </h2>

                                <ReactMarkdown
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
                                        hr: () => <hr className="my-6 border-t border-gray-200" />,
                                        strong: ({ node, ...props }) => (
                                            <strong className="text-gray-900 font-semibold" {...props} />
                                        ),
                                    }}
                                >
                                    {resume.text}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
