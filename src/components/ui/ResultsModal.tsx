import { RotateCcw, Trophy } from "lucide-react";

function getPerformanceMessage(percentage: number): { text: string; color: string } {
  if (percentage >= 90) return { text: "Excelente! Você está dominando o conteúdo! 🎉", color: "text-green-600" };
  if (percentage >= 70) return { text: "Muito bom! Continue assim! 👏", color: "text-blue-600" };
  if (percentage >= 50) return { text: "Bom trabalho! Revise os pontos fracos. 📚", color: "text-yellow-600" };
  return { text: "Continue estudando! A prática leva à perfeição. 💪", color: "text-orange-600" };
}

export function ResultsModal({
  correctAnswers,
  totalQuestions,
  percentage,
  onReview,
  onNewSession,
}: {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  onReview: () => void;
  onNewSession: () => void;
}) {
  const performance = getPerformanceMessage(percentage);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scaleIn"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>Parabéns! 🎉</h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>Você completou todas as questões!</p>

          <div className="rounded-xl p-6 mb-6" style={{ background: "var(--bg-subtle)" }}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Acertos</p>
                <p className="text-3xl font-bold text-green-500">{correctAnswers}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Erros</p>
                <p className="text-3xl font-bold text-red-500">{totalQuestions - correctAnswers}</p>
              </div>
            </div>
            <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Aproveitamento</p>
              <p className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</p>
              <p className={`text-sm font-medium ${performance.color}`}>{performance.text}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onReview}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ background: "var(--bg-hover)", color: "var(--text)" }}
            >
              Revisar
            </button>
            <button
              onClick={onNewSession}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Nova Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}