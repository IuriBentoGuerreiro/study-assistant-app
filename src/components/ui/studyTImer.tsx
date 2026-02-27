import { Award, Flag, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { StudyDayResponse } from "@/src/types/StudyDay";

interface StudyTimerProps {
  activeSession: StudyDayResponse | null;
  isLoading: boolean;
  elapsedSeconds: number;
  progress: number;
  formatTime: (seconds: number) => string;
  onOpenSettings: () => void;
  actions: {
    onStart: (description: string, startTime?: string) => void;
    onPause: () => void;
    onResume: () => void;
    onFinish: () => void;
    onUpdate: (fields: Partial<{ description: string; startTime: string }>) => void;
  };
}

export function StudyTimer({
  activeSession,
  isLoading,
  elapsedSeconds,
  progress,
  formatTime,
  onOpenSettings,
  actions
}: StudyTimerProps) {
  const [localDescription, setLocalDescription] = useState("");
  const [localStartTime, setLocalStartTime] = useState("");

  const isTimerRunning = !!activeSession;
  const isPaused = !!activeSession?.activePause;

  const getDisplayTime = (isoString?: string) => {
    if (!isoString) return "";
    return isoString.split("T")[1]?.substring(0, 5) || "";
  };

  useEffect(() => {
    setLocalDescription(activeSession?.description || "");
    setLocalStartTime(getDisplayTime(activeSession?.startTime));
  }, [activeSession]);

  const handleBlurDescription = () => {
    if (isTimerRunning && localDescription !== activeSession?.description) {
      actions.onUpdate({ description: localDescription });
    }
  };

  const handleBlurStartTime = () => {
    const originalTime = getDisplayTime(activeSession?.startTime);
    if (isTimerRunning && localStartTime && localStartTime !== originalTime) {
      actions.onUpdate({ startTime: localStartTime });
    }
  };

  return (
    <div
      className="rounded-2xl shadow-md overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)"
      }}
    >
      <div className="flex flex-col p-4 gap-4">

        <input
          type="text"
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          onBlur={handleBlurDescription}
          placeholder="No que você está trabalhando?"
          className="w-full px-4 py-3 text-base font-medium outline-none bg-transparent rounded-xl border"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)"
          }}
        />

        <div className="flex items-center justify-between gap-6">

          <div className="flex flex-col">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Início
            </span>

            <input
              type="time"
              value={localStartTime}
              onChange={(e) => setLocalStartTime(e.target.value)}
              onBlur={handleBlurStartTime}
              className="mt-1 px-3 py-2 text-base font-mono font-bold rounded-xl border bg-transparent"
              style={{
                color: "var(--text)",
                borderColor: "var(--border)"
              }}
            />
          </div>

          <div className="flex flex-col items-end text-right">
            <div
              className="text-3xl font-mono font-bold tabular-nums"
              style={{ color: "var(--text)" }}
            >
              {formatTime(elapsedSeconds)}
            </div>

            <div
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {!isTimerRunning
                ? "Parado"
                : isPaused
                  ? "Pausado"
                  : "Gravando"}
            </div>
          </div>

        </div>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">

            <button
              onClick={onOpenSettings}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border"
              style={{
                background: "var(--bg-hover)",
                borderColor: "var(--border)"
              }}
            >
              <Award size={16} />
              Metas
            </button>

            {isTimerRunning && (
              <button
                onClick={actions.onFinish}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <Flag size={16} />
                Finalizar
              </button>
            )}

            <button
              onClick={() =>
                !isTimerRunning
                  ? actions.onStart(localDescription, localStartTime)
                  : isPaused
                    ? actions.onResume()
                    : actions.onPause()
              }
              className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all active:scale-95 ${!isTimerRunning
                ? "bg-blue-600"
                : isPaused
                  ? "bg-yellow-500"
                  : "bg-orange-500"
                }`}
            >
              {!isTimerRunning
                ? "Iniciar"
                : isPaused
                  ? "Retomar"
                  : "Pausar"}
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-2" style={{ background: "var(--bg-subtle)" }}>
        <div
          className="h-full bg-blue-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}