import AIQuizChat from "@/src/components/AIQuizChat/chat";
import Resume from "@/src/components/resume/resume";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
          <div className="flex space-x-2 mb-4">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></span>
          </div>
          <p className="text-lg animate-pulse">Preparando sua sessão de IA...</p>
        </div>
      }
    >
      <Resume />
    </Suspense>
  );
}
