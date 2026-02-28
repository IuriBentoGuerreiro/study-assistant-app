import { Question, QuestionType } from "@/src/types/Question";
import { CheckCircle2, XCircle } from "lucide-react";

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
  const isAnswered = q.userAnswerIndex !== undefined;
  const isCorrect = q.userAnswerIndex === q.correctAnswerIndex;
  const options = q.type === QuestionType.TRUE_FALSE ? ["Certo", "Errado"] : (q.options ?? []);

  return (
    <div
      className="p-4 sm:p-5 rounded-xl shadow-sm transition-all duration-300"
      style={{
        background: "var(--bg-card)",
        border: `2px solid ${isAnswered ? (isCorrect ? "#bbf7d0" : "#fecaca") : "var(--border)"}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: "var(--text)" }}>
          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-3">
            {index + 1}
          </span>
          {q.statement}
        </h3>
        {isAnswered && (
          <div className="ml-3">
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
          const isSelected = i === q.userAnswerIndex;
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
    </div>
  );
}
