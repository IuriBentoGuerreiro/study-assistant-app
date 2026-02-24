"use client";

import { useState } from "react";
import { Mail, Lock, UserPlus, Brain, Eye, EyeOff } from "lucide-react";
import { api } from "@/src/lib/api";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        username,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            BrainlyAI
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Crie sua conta e comece a estudar
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl shadow-sm p-8"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {success ? (
            <div className="text-center py-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: "var(--success-bg)",
                  border: "1px solid var(--success-border)",
                }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--success-text)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text)" }}
              >
                Conta criada com sucesso!
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                Redirecionando para o login...
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text)" }}
                >
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className="h-5 w-5"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                    )}
                  </button>
                </div>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Mínimo de 6 caracteres
                </p>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <UserPlus className="h-5 w-5" />
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </div>
          )}
        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          Já tem uma conta?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}