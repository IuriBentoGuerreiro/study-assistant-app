"use client";

import { useEffect, useState, useRef } from "react";
import {
  Calendar as CalendarIcon, Clock,
  TrendingUp, Flame, Award, CheckCircle2, Trash, Info,
} from "lucide-react";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";
import { api } from "@/src/lib/api";
import { StudyGoalRequest, StudyGoalResponse } from "@/src/types/StudyGoal";
import { StudyDayResponse } from "@/src/types/StudyDay";
import { useToast } from "@/hooks/useToast";
import ConfirmationModal from "../ui/ConfirmationModal";
import { SettingsModal } from "../ui/SettingsModal";
import { CalendarGrid } from "../ui/CalendarGrid";
import { StudyTimer } from "../ui/studyTImer";
import { StatCard } from "../ui/StatCard";

type StudyStats = {
  totalDays: number; currentStreak: number; longestStreak: number;
  totalSeconds: number; averageSeconds: number;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}
function parseLocalDateTime(dateTime: string): Date {
  const [datePart, timePart] = dateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second || 0);
}
function toLocalTimeString(dateTime: string | null | undefined): string {
  if (!dateTime) return "";
  try {
    return parseLocalDateTime(dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch { return ""; }
}
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function safeMinutes(seconds: number | null | undefined): number {
  if (!seconds || isNaN(seconds)) return 0;
  return Math.floor(seconds / 60);
}
function calculateElapsedSeconds(startTime: string, totalPausedSeconds: number, activePauseStart?: string) {
  const now = Date.now();
  const startMs = parseLocalDateTime(startTime).getTime();
  let pausedSeconds = totalPausedSeconds ?? 0;
  if (activePauseStart) {
    const pauseStartMs = parseLocalDateTime(activePauseStart).getTime();
    pausedSeconds += Math.floor((now - pauseStartMs) / 1000);
  }
  return Math.max(0, Math.floor((now - startMs) / 1000) - pausedSeconds);
}

export default function StudyCalendar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerDescription, setTimerDescription] = useState("");
  const [activePauseId, setActivePauseId] = useState<number | null>(null);

  const totalPausedSecondsRef = useRef(0);
  const pauseStartTimeRef = useRef<number | null>(null);

  const [studyDay, setStudyDay] = useState<StudyDayResponse | null>(null);
  const [studySessions, setStudySessions] = useState<StudyDayResponse[]>([]);
  const [sessionsOfSelectedDate, setSessionsOfSelectedDate] = useState<StudyDayResponse[]>([]);

  const [goal, setGoal] = useState<StudyGoalResponse | null>(null);
  const [dailyGoalSeconds, setDailyGoalSeconds] = useState(3600);
  const [tempGoalHours, setTempGoalHours] = useState(1);
  const [tempGoalMinutes, setTempGoalMinutes] = useState(0);
  const [tempGoalSecs, setTempGoalSecs] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [manualStart, setManualStart] = useState("08:00");
  const [manualEnd, setManualEnd] = useState("09:00");
  const [modalDescription, setModalDescription] = useState("");

  const { toasts, showToast, setToasts } = useToast();

  useEffect(() => {
    if (!isTimerRunning || !studyDay?.startTime) return;
    const update = () => {
      if (isPaused) return;
      setElapsedSeconds(calculateElapsedSeconds(studyDay.startTime, totalPausedSecondsRef.current));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused, studyDay?.startTime]);

  useEffect(() => { loadStudySessions(); }, [currentDate]);
  useEffect(() => {
    const init = async () => { await loadStudyGoal(); await loadStudySessions(); await loadStudyDayActive(); };
    init();
  }, []);

  const startPause = async () => {
    if (!studyDay) return;
    try {
      const { data } = await api.post(`/pauses/study-day/${studyDay.id}`);
      setActivePauseId(data.id); pauseStartTimeRef.current = Date.now(); setIsPaused(true);
    } catch { showToast("Erro ao iniciar pausa", "error"); }
  };

  const finishPause = async () => {
    if (!activePauseId) return;
    try {
      await api.patch(`/pauses/${activePauseId}/finish`);
      if (pauseStartTimeRef.current !== null) {
        totalPausedSecondsRef.current += Math.floor((Date.now() - pauseStartTimeRef.current) / 1000);
        pauseStartTimeRef.current = null;
      }
      setIsPaused(false); setActivePauseId(null);
    } catch { showToast("Erro ao finalizar pausa", "error"); }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSessionsOfSelectedDate(studySessions.filter((s) => s.studyDate === dateStr));
    setSelectedDate(date); setModalDescription("");
  };

  const handleUpdateCurrentSession = async (fields: Partial<{ description: string; startTime: string }>) => {
    if (!studyDay) return;
    try {
      const updated = { ...studyDay, ...fields };
      await api.put(`/study-day/${studyDay.id}`, { description: updated.description, startTime: updated.startTime, studyDate: updated.studyDate, studiedSeconds: updated.studiedSeconds ?? 0 });
      setStudyDay(updated);
      if (fields.startTime) { setElapsedSeconds(calculateElapsedSeconds(fields.startTime, totalPausedSecondsRef.current)); showToast("Atualizado com sucesso", "success"); }
    } catch { showToast("Erro ao atualizar sessão ativa", "error"); }
  };

  const handleUpdateSession = async (session: StudyDayResponse, newDescription: string, newStartTime: string, newEndTime: string) => {
    try {
      const dateStr = session.studyDate;
      const [h1, m1] = newStartTime.split(":").map(Number);
      const [h2, m2] = newEndTime.split(":").map(Number);
      if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) { showToast("Horários inválidos.", "error"); return; }
      const totalSeconds = (h2 * 60 + m2 - (h1 * 60 + m1)) * 60;
      if (totalSeconds < 0) { showToast("O horário de fim deve ser posterior ao início.", "error"); return; }
      await api.put(`/study-day/${session.id}`, { description: newDescription || "Estudo sem título", studiedSeconds: totalSeconds, studyDate: dateStr, startTime: `${dateStr}T${newStartTime.substring(0, 5)}:00`, endTime: newEndTime ? `${dateStr}T${newEndTime.substring(0, 5)}:00` : null });
      await loadStudySessions();
      const { data } = await api.get<StudyDayResponse[]>(`/study-day/calendar?start=${dateStr}&end=${dateStr}`);
      setSessionsOfSelectedDate(data);
    } catch { showToast("Erro ao atualizar sessão", "error"); }
  };

  const handleStudyDayManualSave = async (date: Date) => {
    const [h1, m1] = manualStart.split(":").map(Number);
    const [h2, m2] = manualEnd.split(":").map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) { showToast("Preencha os horários de início e fim.", "error"); return; }
    const totalSeconds = (h2 * 60 + m2 - (h1 * 60 + m1)) * 60;
    if (totalSeconds <= 0) { showToast("O horário de término deve ser maior que o de início.", "error"); return; }
    try {
      const dateStr = formatDate(date);
      await api.post("/study-day/manual", { studyDate: dateStr, studiedSeconds: totalSeconds, description: modalDescription || "Estudo sem título", startTime: `${dateStr}T${manualStart}:00`, endTime: `${dateStr}T${manualEnd}:00` });
      await loadStudySessions();
      const { data } = await api.get<StudyDayResponse[]>(`/study-day/calendar?start=${dateStr}&end=${dateStr}`);
      setSessionsOfSelectedDate(data.filter((s) => s.studyDate === dateStr));
      setModalDescription(""); showToast("Sessão registrada com sucesso!", "success");
    } catch { showToast("Erro ao registrar manualmente", "error"); }
  };

  const handleDeleteStudyDay = async (sessionId: number) => {
    try {
      await api.delete(`/study-day/${sessionId}`);
      setSessionsOfSelectedDate((prev) => prev.filter((s) => s.id !== sessionId));
      await loadStudySessions(); showToast("Sessão excluída com sucesso.", "success");
    } catch { showToast("Não foi possível excluir a sessão.", "error"); }
    finally { setIsDeleteModalOpen(false); setSessionToDelete(null); }
  };

  const loadStudyGoal = async () => {
    try {
      const { data } = await api.get<StudyGoalResponse>(`/study-goal`);
      setGoal(data);
      const seconds = data.dailyStudySeconds || 0;
      setDailyGoalSeconds(seconds); setTempGoalHours(Math.floor(seconds / 3600));
      setTempGoalMinutes(Math.floor((seconds % 3600) / 60)); setTempGoalSecs(seconds % 60);
    } catch (error: any) { if (error.response?.status === 404) setGoal(null); }
  };

  const loadStudySessions = async () => {
    try {
      const year = currentDate.getFullYear(); const month = currentDate.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const { data } = await api.get<StudyDayResponse[]>(`/study-day/calendar?start=${start}&end=${end}`);
      setStudySessions(data);
    } catch { showToast("Erro ao carregar sessões", "error"); }
  };

  const loadStudyDayActive = async () => {
    try {
      const { data } = await api.get<StudyDayResponse>(`/study-day/user/active`);
      if (data && data.active) {
        setStudyDay(data); setTimerDescription(data.description ?? ""); setIsTimerRunning(true);
        totalPausedSecondsRef.current = data.totalPausedSeconds ?? 0;
        if (data.activePause) { setIsPaused(true); setActivePauseId(data.activePause.id); pauseStartTimeRef.current = parseLocalDateTime(data.activePause.startTime).getTime(); }
        else { setIsPaused(false); setActivePauseId(null); pauseStartTimeRef.current = null; }
        setElapsedSeconds(calculateElapsedSeconds(data.startTime, data.totalPausedSeconds, data.activePause?.startTime));
      }
    } catch (error) { console.error("Erro ao carregar sessão ativa", error); }
  };

  const createStudyDay = async (desc: string) => {
    try {
      const { data } = await api.post<StudyDayResponse>("/study-day", { description: desc });
      setIsTimerRunning(true); setStudyDay(data); totalPausedSecondsRef.current = 0; pauseStartTimeRef.current = null; setElapsedSeconds(0);
    } catch { showToast("Erro ao iniciar", "error"); }
  };

  const finishStudyDay = async () => {
    try {
      if (!studyDay) return;
      await api.put<StudyDayResponse>(`/study-day/finish/${studyDay.id}`);
      setIsTimerRunning(false); setStudyDay(null); setElapsedSeconds(0); setTimerDescription("");
      setIsPaused(false); setActivePauseId(null); totalPausedSecondsRef.current = 0; pauseStartTimeRef.current = null;
      loadStudySessions(); showToast("Sessão finalizada com sucesso!", "success");
    } catch { showToast("Erro ao finalizar", "error"); }
  };

  const createDailyGoal = async (request: StudyGoalRequest) => {
    const { data } = await api.post<StudyGoalResponse>("/study-goal", request);
    setGoal(data); setDailyGoalSeconds(data.dailyStudySeconds); setShowSettings(false); return data;
  };

  const updateDailyGoal = async (request: StudyGoalRequest) => {
    if (!goal) return;
    const { data } = await api.put<StudyGoalResponse>(`/study-goal/${goal.id}`, request);
    setGoal(data); setDailyGoalSeconds(data.dailyStudySeconds); setShowSettings(false); return data;
  };

  const getStudySessionByDate = (date: Date): StudyDayResponse | undefined => {
    const dateStr = formatDate(date);
    const sessionsOfDay = studySessions.filter((s) => s.studyDate === dateStr);
    if (sessionsOfDay.length === 0) return undefined;
    const totalSeconds = sessionsOfDay.reduce((acc, curr) => acc + (curr.studiedSeconds || 0), 0);
    return { ...sessionsOfDay[0], studiedSeconds: totalSeconds };
  };

  const isDateStudied = (date: Date) => {
    const session = getStudySessionByDate(date);
    return session !== undefined && session.studiedSeconds >= dailyGoalSeconds;
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    return days;
  };

  const calculateStats = (): StudyStats => {
    const byDate = new Map<string, number>();
    for (const s of studySessions) byDate.set(s.studyDate, (byDate.get(s.studyDate) ?? 0) + (s.studiedSeconds ?? 0));
    const qualifiedDates = [...byDate.entries()].filter(([, secs]) => secs >= dailyGoalSeconds);
    const totalSeconds = [...byDate.values()].reduce((sum, s) => sum + s, 0);
    let currentStreak = 0;
    const check = new Date(); check.setHours(0, 0, 0, 0);
    while (true) {
      const dateStr = formatDate(check);
      if ((byDate.get(dateStr) ?? 0) >= dailyGoalSeconds) { currentStreak++; check.setDate(check.getDate() - 1); } else break;
    }
    const sortedDates = [...byDate.keys()].sort();
    let longestStreak = 0, streak = 0; let prevDate: Date | null = null;
    for (const dateStr of sortedDates) {
      const secs = byDate.get(dateStr) ?? 0; const d = new Date(dateStr + "T12:00:00");
      if (secs >= dailyGoalSeconds) {
        if (prevDate) { const diff = Math.round((d.getTime() - prevDate.getTime()) / 86400000); streak = diff === 1 ? streak + 1 : 1; } else streak = 1;
        longestStreak = Math.max(longestStreak, streak); prevDate = d;
      } else { prevDate = null; streak = 0; }
    }
    return { totalDays: qualifiedDates.length, currentStreak, longestStreak, totalSeconds, averageSeconds: qualifiedDates.length > 0 ? Math.round(totalSeconds / qualifiedDates.length) : 0 };
  };

  const handleSaveGoal = async () => {
    const totalSeconds = tempGoalHours * 3600 + tempGoalMinutes * 60 + tempGoalSecs;

    if (totalSeconds < 300 || totalSeconds > 86400) {
      return showToast("Mínimo 5 minutos e máximo 24 horas", "info");
    }

    try {
      if (goal && goal.id) {
        await updateDailyGoal({ dailyStudySeconds: totalSeconds });
      } else {
        await createDailyGoal({ dailyStudySeconds: totalSeconds });
      }
      showToast("Meta salva com sucesso!", "success");
    } catch {
      showToast("Erro ao salvar", "error");
    }
  };
  
  const stats = calculateStats();
  const progress = Math.min((elapsedSeconds / dailyGoalSeconds) * 100, 100);
  const days = getDaysInMonth();
  const selectedDateTotalSeconds = sessionsOfSelectedDate.reduce((acc, curr) => acc + (curr.studiedSeconds || 0), 0);
  const selectedDatePct = dailyGoalSeconds > 0 ? Math.min(100, Math.round((selectedDateTotalSeconds / dailyGoalSeconds) * 100)) : 0;

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        subtitle="Estudos" showListSection={false}
        onItemDelete={setSessionToDelete}
      />

      <div className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Calendário de Estudos" />

        <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-8">

          <StudyTimer
            timerDescription={timerDescription}
            setTimerDescription={setTimerDescription}
            isTimerRunning={isTimerRunning}
            isPaused={isPaused}
            elapsedSeconds={elapsedSeconds}
            progress={progress}
            onStart={() => createStudyDay(timerDescription)}
            onPause={startPause}
            onResume={finishPause}
            onFinish={finishStudyDay}
            onOpenSettings={() => setShowSettings(true)}
            formatTime={formatTime}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            <StatCard icon={<CalendarIcon className="text-blue-600 w-4 h-4" />} label="Dias" value={stats.totalDays} bg="bg-blue-100" />
            <StatCard icon={<Flame className="text-orange-600 w-4 h-4" />} label="Streak" value={stats.currentStreak} bg="bg-orange-100" />
            <StatCard icon={<Award className="text-purple-600 w-4 h-4" />} label="Recorde" value={stats.longestStreak} bg="bg-purple-100" />
            <StatCard icon={<Clock className="text-green-600 w-4 h-4" />} label="Horas" value={`${Math.floor(stats.totalSeconds / 3600)}h`} bg="bg-green-100" />
            <StatCard icon={<TrendingUp className="text-cyan-600 w-4 h-4" />} label="Média" value={`${safeMinutes(stats.averageSeconds)}m`} bg="bg-cyan-100" />
          </div>

          <CalendarGrid
            currentDate={currentDate}
            days={days}
            onPrev={previousMonth}
            onNext={nextMonth}
            onDayClick={handleDayClick}
            isToday={isToday}
            isDateStudied={isDateStudied}
            getStudySessionByDate={getStudySessionByDate}
            dailyGoalSeconds={dailyGoalSeconds}

          />
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}

          onSave={handleSaveGoal}

          tempGoal={{
            hours: tempGoalHours,
            minutes: tempGoalMinutes,
            secs: tempGoalSecs
          }}

          setTempGoal={(newGoal) => {
            setTempGoalHours(newGoal.hours);
            setTempGoalMinutes(newGoal.minutes);
            setTempGoalSecs(newGoal.secs);
          }}

          currentGoalDisplay={formatDuration(dailyGoalSeconds)}
        />
      )}

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
          <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]" style={{ background: "var(--bg-card)" }}>

            <div className="shrink-0 px-4 sm:px-5 pt-4 sm:pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-3 sm:hidden" style={{ background: "var(--border)" }} />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Histórico de atividades</p>
                  <h3 className="text-lg sm:text-xl font-black capitalize leading-tight" style={{ color: "var(--text)" }}>
                    {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                  </h3>
                </div>
                <button onClick={() => setSelectedDate(null)} className="shrink-0 p-2 rounded-full transition-all" style={{ color: "var(--text-muted)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                <div className="flex-1 flex flex-col gap-0.5 rounded-xl px-3 py-2.5 shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Meta diária</span>
                  <span className="text-base sm:text-lg font-black leading-none" style={{ color: "var(--text)" }}>{formatDuration(dailyGoalSeconds)}</span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400">Estudado</span>
                  <span className="text-base sm:text-lg font-black text-blue-700 leading-none">{formatDuration(selectedDateTotalSeconds)}</span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">Restante</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 leading-none">{formatDuration(Math.max(0, dailyGoalSeconds - selectedDateTotalSeconds))}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                  <span>Progresso</span><span>{selectedDatePct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${selectedDatePct}%` }} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-5 space-y-5">

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Registrar sessão</p>
                  <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <div>
                      <label className="text-[10px] font-bold block mb-1.5" style={{ color: "var(--text-muted)" }}>O que você estudou?</label>
                      <input type="text" placeholder="Ex: Revisão de Anatomia" value={modalDescription} onChange={(e) => setModalDescription(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-50"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
                      />
                    </div>
                    <div className="flex gap-2">
                      {[["Início", manualStart, setManualStart], ["Fim", manualEnd, setManualEnd]].map(([label, value, setter]) => (
                        <div key={label as string} className="flex-1 min-w-0">
                          <label className="text-[10px] font-bold block mb-1.5" style={{ color: "var(--text-muted)" }}>{label as string}</label>
                          <input type="time" value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-50"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
                          />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => selectedDate && handleStudyDayManualSave(selectedDate)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black rounded-xl transition-all shadow-md uppercase tracking-wide">
                      Adicionar sessão
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Sessões registradas</p>
                  <div className="space-y-2">
                    {sessionsOfSelectedDate.length > 0 ? sessionsOfSelectedDate.map((session) => {
                      const currentStart = toLocalTimeString(session.startTime);
                      const currentEnd = toLocalTimeString(session.endTime);
                      return (
                        <div key={session.id} className="group flex flex-col gap-2 px-3 sm:px-4 py-3 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-blue-50"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: "var(--border)" }} />
                            <input type="text" defaultValue={session.description} placeholder="Descrição"
                              className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-none outline-none focus:ring-0"
                              style={{ color: "var(--text)" }}
                              onBlur={(e) => { if (e.target.value !== session.description) handleUpdateSession(session, e.target.value, currentStart, currentEnd); }}
                            />
                            <button onClick={() => { setSessionToDelete(session.id); setIsDeleteModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 pl-4">
                            {[["Início", currentStart], ["Fim", currentEnd]].map(([label, timeVal], idx) => (
                              <div key={label as string} className="relative group/time">
                                <label className="absolute -top-4 left-0 text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover/time:opacity-100 transition-opacity whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{label as string}</label>
                                <div className="flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-1.5 transition-all cursor-text" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <input type="time" defaultValue={timeVal as string}
                                    className="text-[11px] sm:text-[12px] font-mono font-bold bg-transparent border-none outline-none w-22.5 p-0 cursor-pointer"
                                    style={{ color: "var(--text)" }}
                                    onBlur={(e) => {
                                      if (!e.target.value || e.target.value === timeVal) return;
                                      if (idx === 0) handleUpdateSession(session, session.description, e.target.value, currentEnd);
                                      else handleUpdateSession(session, session.description, currentStart, e.target.value);
                                    }}
                                  />
                                </div>
                                {idx === 0 && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-300 shrink-0 ml-2"><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                              </div>
                            ))}
                            <span className="text-xs font-black shrink-0 tabular-nums ml-auto" style={{ color: "var(--text-muted)" }}>{formatDuration(session.studiedSeconds ?? 0)}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--bg-hover)" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Nenhum registro para este dia</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Adicione uma sessão acima</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="shrink-0 px-4 sm:px-5 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <button onClick={() => setSelectedDate(null)} className="w-full py-3 text-sm font-black rounded-xl transition-all tracking-wide" style={{ background: "var(--text)", color: "var(--bg)" }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Excluir Sessão"
        message="Tem certeza que deseja apagar este registro de estudo? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onCancel={() => { setIsDeleteModalOpen(false); setSessionToDelete(null); }}
        onConfirm={() => sessionToDelete !== null && handleDeleteStudyDay(sessionToDelete)}
      />

      {/* TOASTS */}
      <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-right-full duration-300 ${t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"}`}>
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error" && <Trash size={18} />}
            {t.type === "info" && <Info size={18} />}
            <span>{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))} className="ml-2 hover:opacity-70 transition-opacity">&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}