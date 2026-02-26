import { Award, Flag, Loader2 } from "lucide-react";
import { useState } from "react";
import { ContentLoader } from "./ContentLoad";

interface StudyTimerProps {
  timerDescription: string;
  setTimerDescription: (value: string) => void;
  isTimerRunning: boolean;
  isPaused: boolean;
  isLoading: boolean;
  elapsedSeconds: number;
  progress: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onOpenSettings: () => void;
  formatTime: (seconds: number) => string;
}

export function StudyTimer({
  timerDescription,
  setTimerDescription,
  isTimerRunning,
  isPaused,
  isLoading,
  elapsedSeconds,
  progress,
  onStart,
  onPause,
  onResume,
  onFinish,
  onOpenSettings,
  formatTime
}: StudyTimerProps) {

  return (
    <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex flex-col lg:flex-row items-center p-3 lg:p-4 gap-3 lg:gap-4">
        <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={timerDescription}
            onChange={(e) => setTimerDescription(e.target.value)}
            placeholder="No que você está trabalhando?"
            className="w-full px-4 py-3 text-sm lg:text-base font-medium outline-none bg-transparent"
            style={{ color: "var(--text)" }}
          />
        </div>

        <div className="flex items-center justify-between w-full lg:w-auto gap-6 lg:gap-8 px-2">
          <div className="flex flex-col items-end">
            <span className="text-3xl font-mono font-bold tabular-nums" style={{ color: "var(--text)" }}>
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {!isTimerRunning ? "Parado" : isPaused ? "Pausado" : "Gravando"}
            </span>
          </div>

          <div className="flex items-center gap-2">

            {isLoading ? (
              <div className="flex items-center justify-center w-35 h-12">
                <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenSettings}
                  className="p-2.5 rounded-lg"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
                >
                  <Award size={14} />
                </button>

                {isTimerRunning && (
                  <button
                    onClick={onFinish}
                    className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center"
                  >
                    <Flag size={14} />
                  </button>
                )}

                <button
                  onClick={!isTimerRunning ? onStart : isPaused ? onResume : onPause}
                  className={`w-12 h-12 rounded-full text-white shadow-lg ${!isTimerRunning ? 'bg-blue-600' : isPaused ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                >
                  {!isTimerRunning ? "▶" : isPaused ? "⏵" : "❚❚"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-1" style={{ background: "var(--bg-subtle)" }}>
        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}