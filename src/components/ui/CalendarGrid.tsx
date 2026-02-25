import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface CalendarGridProps {
  currentDate: Date;
  days: (Date | null)[];
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (date: Date) => void;
  isToday: (date: Date) => boolean;
  isDateStudied: (date: Date) => boolean;
  getStudySessionByDate: (date: Date) => { studiedSeconds: number } | undefined;
  dailyGoalSeconds: number;
}

export function CalendarGrid({
  currentDate,
  days,
  onPrev,
  onNext,
  onDayClick,
  isToday,
  isDateStudied,
  getStudySessionByDate,
  dailyGoalSeconds
}: CalendarGridProps) {
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="rounded-xl p-3 sm:p-6 shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button onClick={onPrev} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </button>
        <h2 className="text-base sm:text-xl font-bold capitalize" style={{ color: "var(--text)" }}>
          {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={onNext} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors">
          <ChevronRight className="w-5 h-5" style={{ color: "var(--text)" }} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">

        {weekDays.map((day, index) => (
          <div
            key={`weekday-${index}`}
            className="text-center text-[10px] font-bold pb-2 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {day}
          </div>
        ))}

        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const session = getStudySessionByDate(date);
          const studied = isDateStudied(date);
          const active = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              type="button"
              className="cursor-pointer aspect-square rounded-lg flex flex-col items-center justify-center relative border-2 transition-all hover:bg-(--bg-hover) active:scale-95"
              style={{
                borderColor: active ? "var(--text-active)" : studied ? "var(--correct)" : "var(--border)",

                background: active ? "var(--bg-active)" : "transparent",

              }}
            >
              <span className="text-xs sm:text-sm font-semibold" style={{ color: active ? "var(--text-active)" : "var(--text)" }}>
                {date.getDate()}
              </span>

              {studied && (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              )}

              {session && !studied && session.studiedSeconds > 0 && (
                <div className="absolute bottom-1 w-2/3 h-1 rounded-full bg-var(--border) overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (session.studiedSeconds / dailyGoalSeconds) * 100)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}