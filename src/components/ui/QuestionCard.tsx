import { Question, QuestionType } from "@/src/types/Question";
import { CheckCircle, CheckCircle2, Lock, Scissors, X, XCircle } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getOptionStyle(params: {
  answered: boolean;
  isCorrect: boolean;
  isSelected: boolean;
  isPending: boolean;
  isEliminated: boolean;
}): React.CSSProperties {
  const { answered, isCorrect, isSelected, isPending, isEliminated } = params;

  if (!answered) {
    if (isEliminated) {
      return {
        border: "2px dashed var(--border)",
        background: "var(--bg-subtle)",
        color: "var(--text-muted)",
        textDecoration: "line-through",
        opacity: 0.45,
        cursor: "pointer",
      };
    }

    if (isPending) {
      return {
        border: "2px solid var(--border-active)",
        background: "var(--bg-active)",
        color: "var(--text)",
        cursor: "pointer",
        boxShadow: "0 0 0 3px color-mix(in srgb, var(--text-active) 15%, transparent)",
      };
    }

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  const isAnswered = q.studyAnswer !== undefined && q.studyAnswer !== null;
  const isCorrect = q.studyAnswer === q.correctAnswerIndex;
  const hasComment = q.comment !== undefined && q.comment !== null;

  const options =
    q.type === QuestionType.TRUE_FALSE ? ["Certo", "Errado"] : (q.options ?? []);

  function handleConfirm() {
    if (pendingAnswer !== null) {
      onAnswer(q.id, pendingAnswer);
      setPendingAnswer(null);
    }
  }

  function toggleEliminate(optionIndex: number) {
    if (isAnswered) return;
    setEliminatedOptions((prev) =>
      prev.includes(optionIndex)
        ? prev.filter((i) => i !== optionIndex)
        : [...prev, optionIndex]
    );
    if (pendingAnswer === optionIndex) setPendingAnswer(null);
  }

  return (
    <div
      className="p-4 sm:p-5 rounded-xl shadow-sm transition-all duration-300 flex flex-col gap-4"
      style={{
        background: "var(--bg-card)",
        border: `2px solid ${isAnswered ? (isCorrect ? "#bbf7d0" : "#fecaca") : "var(--border)"
          }`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <span className="inline-flex items-center justify-center min-w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-3 mt-0.5 shrink-0">
            {index + 1}
          </span>
          <div
            className="text-sm sm:text-base font-semibold prose prose-sm max-w-none"
            style={{ color: "var(--text)" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.statement}</ReactMarkdown>
          </div>
        </div>

        {isAnswered && (
          <div className="ml-3 shrink-0">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isEliminated = eliminatedOptions.includes(i);

          const style = getOptionStyle({
            answered: isAnswered,
            isCorrect: i === q.correctAnswerIndex,
            isSelected: i === q.studyAnswer,
            isPending: !isAnswered && i === pendingAnswer,
            isEliminated,
          });

          return (
            <div key={i} className="flex items-center gap-2">
              {!isAnswered && (
                <button
                  onClick={() => toggleEliminate(i)}
                  title={isEliminated ? "Desfazer eliminação" : "Eliminar alternativa"}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer border active:scale-90"
                  style={{
                    background: isEliminated ? "rgba(239,68,68,0.12)" : "transparent",
                    borderColor: isEliminated ? "rgba(239,68,68,0.4)" : "var(--border)",
                    color: isEliminated ? "#ef4444" : "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isEliminated) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEliminated) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Scissors className="w-4 h-4" />
                </button>
              )}

              <button
                disabled={isAnswered}
                onClick={() => !isAnswered && !isEliminated && setPendingAnswer(i)}
                className="flex-1 text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 hover:shadow-md"
                style={style}
              >
                <span className="flex-1">{opt}</span>
                {isAnswered && i === q.correctAnswerIndex && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                )}
                {isAnswered && i === q.studyAnswer && i !== q.correctAnswerIndex && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {!isAnswered && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleConfirm}
            disabled={pendingAnswer === null}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all active:scale-95"
            style={{
              background: pendingAnswer !== null ? "var(--button-blue)" : "var(--text)",
              color: pendingAnswer !== null ? "#fff" : "var(--text-muted)",
              cursor: pendingAnswer !== null ? "pointer" : "not-allowed",
              opacity: pendingAnswer !== null ? 1 : 0.5,
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Responder
          </button>
        </div>
      )}

      {isAnswered && (
        <div className="flex justify-end pt-2">
          {hasComment ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Ver Explicação Detalhada
            </button>
          ) : (
            <button
              disabled
              className="cursor-not-allowed flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-gray-300/40 bg-gray-100/40 text-gray-400 dark:text-gray-500"
            >
              <Lock className="w-4 h-4" />
              Sem Explicação Disponível
            </button>
          )}
        </div>
      )}

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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.comment}</ReactMarkdown>
              </div>
            </div>

            <div className="p-4 border-t dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                style={{ background: "var(--button-blue)" }}
              >
                Entendi
              </button>
            </div>
          </div>

          <div className="absolute inset-0 -z-10" onClick={() => setIsModalOpen(false)} />
        </div>
      )}
    </div>
  );
}