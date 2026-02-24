"use client";

import { useState } from "react";
import { Mail, Brain, Send } from "lucide-react";
import { api } from "@/src/lib/api";

export default function ForgotPasswordForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/forgot-password", { username });
      setSuccess(true);
    } catch (err) {
      setError("Erro ao enviar email. Tente novamente.");
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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Esqueceu a senha?
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Enviaremos um link para redefinir sua senha
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
                <Send
                  className="w-8 h-8"
                  style={{ color: "var(--success-text)" }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text)" }}
              >
                Email enviado!
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                Verifique sua caixa de entrada.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

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
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}
        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          Lembrou da senha?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Fazer login
          </a>
        </p>
      </div>
    </div>
  );
}