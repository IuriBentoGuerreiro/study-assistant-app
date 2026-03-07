import { Question, QuestionType } from "@/src/types/Question";
import { CheckCircle, CheckCircle2, Lock, X, XCircle } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getOptionStyle(
  answered: boolean,
  isCorrect: boolean,
  isSelected: boolean
):

  React.CSSProperties {
  if (!answered) {
    return {
      border: "2px solid var(--border)",
      background: "var(--bg-card)",
      color: "var(--text)",
      cursor: "pointer",
    };
  }

  if (isCorrect) {
    return {
      border: "2px solid #22c55e",
      background: "var(--bg-active, #f0fdf4)",
      color: "var(--text)",
      cursor: "default",
    };
  }

  if (isSelected) {
    return {
      border: "2px solid #ef4444",
      background: "var(--bg-hover, #fef2f2)",
      color: "var(--text)",
      cursor: "default",
    };
  }

  return {
    border: "2px solid var(--border)",
    background: "var(--bg-subtle)",
    color: "var(--text-muted)",
    opacity: 0.6,
    cursor: "default",
  };
}
export function QuestionCard({
  question: q,
  index,
  onAnswer,
}: {
  question: Question;
  index: number;
  onAnswer: (id: string, index: number) => void;
}) {

  console.log(`Questão ${index + 1}:`, q);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAnswered = q.studyAnswer !== undefined && q.studyAnswer !== null;
  const isComment = q.comment !== undefined && q.comment !== null;
  const isCorrect = q.studyAnswer === q.correctAnswerIndex;
  const options = q.type === QuestionType.TRUE_FALSE ? ["Certo", "Errado"] : (q.options ?? []);

  return (
    <div
      className="p-4 sm:p-5 rounded-xl shadow-sm transition-all duration-300 flex flex-col gap-4"
      style={{
        background: "var(--bg-card)",
        border: `2px solid ${isAnswered ? (isCorrect ? "#bbf7d0" : "#fecaca") : "var(--border)"}`,
      }}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: "var(--text)" }}>
          <span className="inline-flex items-center justify-center min-w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-3">
            {index + 1}
          </span>
          {q.statement}
        </h3>
        {isAnswered && (
          <div className="ml-3 shrink-0">
            {isCorrect
              ? <CheckCircle2 className="w-6 h-6 text-green-500" />
              : <XCircle className="w-6 h-6 text-red-500" />
            }
          </div>
        )}
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const optCorrect = i === q.correctAnswerIndex;
          const isSelected = i === q.studyAnswer;
          const style = getOptionStyle(isAnswered, optCorrect, isSelected);

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => onAnswer(q.id, i)}
              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 hover:shadow-md"
              style={style}
            >
              <span className="flex-1">{opt}</span>
              {isAnswered && optCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
              {isAnswered && isSelected && !optCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        {isAnswered && isComment ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            Ver Explicação Detalhada
          </button>
        ) : (
          <button
            className="cursor-not-allowed flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
          >
            <Lock className="w-4 h-4" />
            Responda Para Ver a Explicação
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-800 animate-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-500/5">
              <h3 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Explicação da Questão {index + 1}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {q.comment}
                </ReactMarkdown>
              </div>
            </div>

            <div className="p-4 border-t dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>

          <div className="absolute inset-0 -z-10" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}