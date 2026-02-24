"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";
import { Mail, Lock, LogIn, Brain } from "lucide-react";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError("E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>BrainlyAI</h1>
          <p style={{ color: "var(--text-muted)" }}>Entre para continuar seus estudos</p>
        </div>

        {/* Card */}
        <div className="rounded-xl shadow-sm p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="space-y-5">

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                </div>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                />
              </div>
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Esqueci minha senha
              </a>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c" }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          Não tem uma conta?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}