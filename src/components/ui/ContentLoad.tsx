import { Loader2 } from "lucide-react";

interface ContentLoaderProps {
  message?: string | "Carrecando...";
}

export function ContentLoader({ message = "Carregando conteúdo..." }: ContentLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-400px w-full h-full animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="absolute inset-0 blur-xl bg-blue-400/20 rounded-full animate-pulse" />
      </div>
      <p className="mt-4 text-lg font-medium text-slate-600 animate-pulse">
        {message}
      </p>
    </div>
  );
}