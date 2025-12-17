"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";

export default function LoginForm() {
  const { login } = useAuth();

  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  console.log("SUBMIT DISPARADO"); // 👈

  setLoading(true);
  setError(null);

  try {
    console.log("Chamando login...", username, password); // 👈
    await login(username, password);
    console.log("LOGIN OK"); // 👈
  } catch (err) {
    console.error("ERRO NO LOGIN", err); // 👈
    setError("E-mail ou senha inválidos");
  } finally {
    setLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">
          E-mail
        </label>
        <input
          type="username"
          value={username}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white py-3 font-medium text-black transition hover:bg-gray-200 disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-white/10" />
        <span className="mx-4 text-xs uppercase tracking-wide text-gray-500">
          ou
        </span>
        <div className="flex-1 border-t border-white/10" />
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        }}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-black/40 py-3 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Entrar com Google
      </button>
    </form>
  );
}
