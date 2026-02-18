"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Flame,
  Award,
  Settings,
  CheckCircle2,
  Trash,
} from "lucide-react";
import Sidebar from "../ui/sidebar";
import Header from "../ui/header";
import { api } from "@/src/lib/api";
import { StudyGoalRequest, StudyGoalResponse } from "@/src/types/StudyGoal";
import { StudyDayResponse } from "@/src/types/StudyDay";

type StudyStats = {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  averageMinutes: number;
};

export default function StudyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(60);
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoal, setTempGoal] = useState(60);

  const [goal, setGoal] = useState<StudyGoalResponse | null>(null);
  const [studyDay, setStudyDay] = useState<StudyDayResponse | null>(null);
  const [studySessions, setStudySessions] = useState<StudyDayResponse[]>([]);
  const [loadingGoal, setLoadingGoal] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sessionsOfSelectedDate, setSessionsOfSelectedDate] = useState<StudyDayResponse[]>([]);

  const [manualStart, setManualStart] = useState("08:00");
  const [manualEnd, setManualEnd] = useState("09:00");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && studyDay?.startTime) {
      const tick = () => {
        const start = new Date(studyDay.startTime).getTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
        setElapsedSeconds(elapsed);
        if (elapsed % 60 === 0 && elapsed > 0) saveProgress(elapsed);
      };
      tick();
      interval = setInterval(tick, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, studyDay?.startTime]);

  useEffect(() => { loadStudySessions(); }, [currentDate]);

  useEffect(() => {
    const init = async () => {
      await loadStudyGoal();
      await loadStudyDayActive();
      await loadStudySessions();
    };
    init();
  }, []);


  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date);
    const sessions = studySessions.filter(s => s.studyDate === dateStr);
    setSessionsOfSelectedDate(sessions);
    setSelectedDate(date);
  };

  const handleUpdateCurrentSession = async (fields: Partial<{ description: string; startTime: string }>) => {
    if (!studyDay) return;
    try {
      const updated = { ...studyDay, ...fields };
      await api.put(`/study-day/${studyDay.id}`, {
        description: updated.description,
        startTime: updated.startTime,
        studyDate: updated.studyDate,
        studiedMinutes: updated.studiedMinutes ?? 0,
      });
      setStudyDay(updated);
      if (fields.description !== undefined) setDescription(fields.description);
    } catch (error) {
      console.error("Erro ao atualizar sessão ativa:", error);
    }
  };

  const handleUpdateSession = async (
    session: StudyDayResponse,
    newDescription: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    try {
      const dateStr = session.studyDate;
      const [h1, m1] = newStartTime.split(':').map(Number);
      const [h2, m2] = newEndTime.split(':').map(Number);
      const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);

      if (totalMinutes < 0) {
        alert("O horário de fim deve ser posterior ao início.");
        return;
      }

      await api.put(`/study-day/${session.id}`, {
        description: newDescription || "Estudo sem título",
        studiedMinutes: totalMinutes,
        studyDate: dateStr,
        startTime: `${dateStr}T${newStartTime.substring(0, 5)}:00`,
        endTime: newEndTime ? `${dateStr}T${newEndTime.substring(0, 5)}:00` : null,
      });

      await loadStudySessions();

      const dateQuery = formatDate(new Date(dateStr + "T12:00:00"));
      const { data } = await api.get<StudyDayResponse[]>(
        `/study-day/calendar?start=${dateQuery}&end=${dateQuery}`
      );
      setSessionsOfSelectedDate(data);
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      alert("Não foi possível salvar a alteração.");
    }
  };

  const handleStudyDayManualSave = async (date: Date) => {
    const [h1, m1] = manualStart.split(':').map(Number);
    const [h2, m2] = manualEnd.split(':').map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);

    if (totalMinutes <= 0) {
      alert("O horário de término deve ser maior que o de início.");
      return;
    }

    try {
      const dateStr = formatDate(date);
      await api.post("/study-day/manual", {
        studyDate: dateStr,
        studiedMinutes: totalMinutes,
        description: description || "Estudo sem título",
        startTime: `${dateStr}T${manualStart}:00`,
        endTime: `${dateStr}T${manualEnd}:00`,
      });

      await loadStudySessions();

      const { data } = await api.get<StudyDayResponse[]>(
        `/study-day/calendar?start=${dateStr}&end=${dateStr}`
      );
      setSessionsOfSelectedDate(data.filter(s => s.studyDate === dateStr));
      setDescription("");
    } catch (error) {
      console.error("Erro ao registrar manualmente:", error);
      alert("Erro ao salvar registro manual.");
    }
  };

  const handleDeleteStudyDay = async (sessionId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta sessão de estudo?")) return;
    try {
      await api.delete(`/study-day/${sessionId}`);
      setSessionsOfSelectedDate((prev) => prev.filter(s => s.id !== sessionId));
      await loadStudySessions();
    } catch (error) {
      console.error("Erro ao excluir sessão:", error);
      alert("Não foi possível excluir a sessão. Tente novamente.");
    }
  };

  const loadStudyGoal = async () => {
    try {
      const { data } = await api.get<StudyGoalResponse>(`/study-goal`);
      setGoal(data);
      setDailyGoalMinutes(data.dailyStudyMinutes);
      setTempGoal(data.dailyStudyMinutes);
    } catch (error: any) {
      if (error.response?.status === 404) setGoal(null);
    } finally {
      setLoadingGoal(false);
    }
  };

  const loadStudySessions = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const { data } = await api.get<StudyDayResponse[]>(`/study-day/calendar?start=${start}&end=${end}`);
      setStudySessions(data);
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
    }
  };

  const loadStudyDayActive = async () => {
    try {
      const { data } = await api.get<StudyDayResponse>(`/study-day/user/active`);
      if (data && data.active) {
        setStudyDay(data);
        setDescription(data.description ?? "");
        setIsTimerRunning(true);
        const start = new Date(data.startTime).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      }
    } catch {
      console.log("Nenhuma sessão ativa encontrada");
    }
  };

  const createStudyDay = async (desc: string) => {
    try {
      const { data } = await api.post<StudyDayResponse>("/study-day", { description: desc });
      setIsTimerRunning(true);
      setStudyDay(data);
    } catch (error) {
      console.error("Erro ao iniciar:", error);
    }
  };

  const finishStudyDay = async () => {
    try {
      if (!studyDay) return;
      await api.put<StudyDayResponse>(`/study-day/finish/${studyDay.id}`);
      setIsTimerRunning(false);
      setStudyDay(null);
      setElapsedSeconds(0);
      setDescription("");
      loadStudySessions();
    } catch (error) {
      console.error("Erro ao finalizar:", error);
    }
  };

  const saveProgress = async (seconds: number) => {
    console.log("Saving progress:", seconds, "seconds");
  };

  const createDailyGoal = async (request: StudyGoalRequest) => {
    const { data } = await api.post<StudyGoalResponse>("/study-goal", request);
    setGoal(data);
    setDailyGoalMinutes(data.dailyStudyMinutes);
    setShowSettings(false);
    return data;
  };

  const updateDailyGoal = async (request: StudyGoalRequest) => {
    if (!goal) return;
    const { data } = await api.put<StudyGoalResponse>(`/study-goal/${goal.id}`, request);
    setGoal(data);
    setDailyGoalMinutes(data.dailyStudyMinutes);
    setShowSettings(false);
    return data;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getStudySessionByDate = (date: Date): StudyDayResponse | undefined => {
    const dateStr = formatDate(date);
    const sessionsOfDay = studySessions.filter((s) => s.studyDate === dateStr);
    if (sessionsOfDay.length === 0) return undefined;
    const totalMinutes = sessionsOfDay.reduce((acc, curr) => acc + curr.studiedMinutes, 0);
    return { ...sessionsOfDay[0], studiedMinutes: totalMinutes };
  };

  const isDateStudied = (date: Date): boolean => {
    const session = getStudySessionByDate(date);
    return session !== undefined && session.studiedMinutes >= dailyGoalMinutes;
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    return days;
  };

  const calculateStats = (): StudyStats => {
    const qualifiedDays = studySessions.filter(s => s.studiedMinutes >= dailyGoalMinutes);
    const totalMinutes = studySessions.reduce((sum, s) => sum + s.studiedMinutes, 0);
    let currentStreak = 0;
    const sorted = [...studySessions].sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime());
    let checkDate = new Date();
    for (const session of sorted) {
      if (session.studyDate === formatDate(checkDate) && session.studiedMinutes >= dailyGoalMinutes) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (new Date(session.studyDate) < checkDate) break;
    }
    return {
      totalDays: qualifiedDays.length,
      currentStreak,
      longestStreak: 0,
      totalMinutes,
      averageMinutes: qualifiedDays.length > 0 ? Math.round(totalMinutes / qualifiedDays.length) : 0,
    };
  };

  const handleSaveGoal = async () => {
    if (tempGoal < 5 || tempGoal > 480) return alert("Mínimo 5 e máximo 480 minutos");
    try {
      goal ? await updateDailyGoal({ dailyStudyMinutes: tempGoal }) : await createDailyGoal({ dailyStudyMinutes: tempGoal });
    } catch (e) { console.error(e); }
  };

  const stats = calculateStats();
  const progress = Math.min((elapsedSeconds / (dailyGoalMinutes * 60)) * 100, 100);
  const days = getDaysInMonth();

  if (loadingGoal) return <div className="h-screen flex items-center justify-center">Carregando...</div>;

  const timerStartTimeValue = studyDay?.startTime
    ? new Date(studyDay.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} subtitle="Estudos" showListSection={false} />
      <div className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Calendário de Estudos" />
        <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-6">

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center p-3 lg:p-4 gap-3 lg:gap-4">

              <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={(e) => {
                      if (isTimerRunning && studyDay) {
                        handleUpdateCurrentSession({ description: e.target.value });
                      }
                    }}
                    placeholder="No que você está trabalhando?"
                    className="w-full px-4 py-3 text-slate-700 placeholder-slate-400 border-none focus:ring-0 text-sm lg:text-base font-medium outline-none transition-all"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-focus-within:w-full" />
                </div>

                {isTimerRunning && studyDay && (
                  <>
                    <div className="hidden sm:block w-px h-8 bg-slate-100 shrink-0" />

                    <div className="relative group/starttime shrink-0 mt-1 sm:mt-0">
                      <label className="absolute -top-3.5 left-0 text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Início
                      </label>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 group-hover/starttime:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 rounded-lg px-2.5 py-2 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover/starttime:text-blue-400 group-focus-within/starttime:text-blue-500 transition-colors shrink-0">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <input
                          type="time"
                          key={timerStartTimeValue}
                          defaultValue={timerStartTimeValue}
                          className="text-[12px] font-mono font-bold text-slate-600 bg-transparent border-none outline-none focus:text-blue-600 w-11.5 p-0 cursor-pointer"
                          onBlur={(e) => {
                            if (!e.target.value || !studyDay) return;
                            const [hours, minutes] = e.target.value.split(":").map(Number);
                            const newStart = new Date(studyDay.startTime);
                            newStart.setHours(hours, minutes, 0, 0);
                            handleUpdateCurrentSession({ startTime: newStart.toISOString() });
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0" />

              <div className="flex items-center justify-between w-full lg:w-auto gap-6 lg:gap-8 px-2 lg:px-0">
                <div className="flex flex-col items-start lg:items-end">
                  <span className="text-4xl font-mono font-bold text-slate-800 tabular-nums tracking-tight">
                    {formatTime(elapsedSeconds)}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isTimerRunning ? "bg-red-500 animate-pulse" : "bg-slate-300"}`} />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {isTimerRunning ? "Gravando" : "Pausado"}
                    </span>
                  </div>
                </div>

                {!isTimerRunning ? (
                  <button
                    onClick={() => createStudyDay(description)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    START
                  </button>
                ) : (
                  <button
                    onClick={finishStudyDay}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-lg shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                    STOP
                  </button>
                )}
              </div>
            </div>

            <div className="w-full h-1 bg-slate-50">
              <div
                className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            <StatCard icon={<CalendarIcon className="text-blue-600 w-4 h-4" />} label="Dias" value={stats.totalDays} bg="bg-blue-100" />
            <StatCard icon={<Flame className="text-orange-600 w-4 h-4" />} label="Streak" value={stats.currentStreak} bg="bg-orange-100" />
            <StatCard icon={<Award className="text-purple-600 w-4 h-4" />} label="Recorde" value={stats.longestStreak} bg="bg-purple-100" />
            <StatCard icon={<Clock className="text-green-600 w-4 h-4" />} label="Horas" value={`${Math.floor(stats.totalMinutes / 60)}h`} bg="bg-green-100" />
            <StatCard icon={<TrendingUp className="text-cyan-600 w-4 h-4" />} label="Média" value={`${stats.averageMinutes}m`} bg="bg-cyan-100" />
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button onClick={previousMonth} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg text-gray-900 transition-colors">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h2 className="text-base sm:text-xl font-bold capitalize text-gray-900">
                {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg text-gray-900 transition-colors">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center text-[10px] sm:text-xs font-bold text-gray-900 pb-1 sm:pb-2">
                  {day}
                </div>
              ))}
              {days.map((date, i) => {
                if (!date) return <div key={i} />;
                const session = getStudySessionByDate(date);
                const isFinished = isDateStudied(date);
                return (
                  <div
                    key={i}
                    onClick={() => date && handleDayClick(date)}
                    className={`cursor-pointer aspect-square rounded-lg sm:rounded-xl border-2 flex flex-col items-center justify-center relative transition-all
                      ${isToday(date) ? "border-blue-500 bg-blue-50" : "border-gray-150"}
                      ${isFinished ? "bg-emerald-50 border-emerald-200" : ""}`}
                  >
                    <span className={`text-xs sm:text-sm font-semibold ${isToday(date) ? "text-blue-600" : "text-gray-900"}`}>
                      {date.getDate()}
                    </span>
                    {isFinished && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mt-0.5" />}
                    {session && !isFinished && session.studiedMinutes > 0 && (
                      <div className="absolute bottom-0.5 sm:bottom-1 w-1/2 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: `${(session.studiedMinutes / dailyGoalMinutes) * 100}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Ajustar Meta</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Minutos de estudo por dia</label>
                <input
                  type="number"
                  value={tempGoal}
                  onChange={e => setTempGoal(Number(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl mb-2 text-lg font-bold text-slate-900 focus:border-blue-500 focus:ring-0 transition-colors outline-none"
                  placeholder="Ex: 60"
                />
                <p className="text-xs font-medium text-slate-500 ml-1">
                  Sua meta atual é de <span className="text-blue-600 font-bold">{dailyGoalMinutes} minutos</span>.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSettings(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors border border-slate-200">
                  Cancelar
                </button>
                <button onClick={handleSaveGoal} className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />

          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 bg-linear-to-b from-white to-slate-50">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Histórico de atividades</p>
                  <h3 className="text-xl font-black text-slate-900 capitalize">
                    {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                  </h3>
                </div>
                <button onClick={() => setSelectedDate(null)} className="mt-0.5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0" aria-label="Fechar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <div className="flex-1 flex flex-col gap-0.5 bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Meta diária</span>
                  <span className="text-lg font-black text-slate-800 leading-none">{dailyGoalMinutes} <span className="text-xs font-semibold text-slate-400">min</span></span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400">Estudado</span>
                  <span className="text-lg font-black text-blue-700 leading-none">
                    {sessionsOfSelectedDate.reduce((acc, curr) => acc + curr.studiedMinutes, 0)} <span className="text-xs font-semibold text-blue-400">min</span>
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">Restante</span>
                  <span className="text-lg font-black text-emerald-700 leading-none">
                    {Math.max(0, dailyGoalMinutes - sessionsOfSelectedDate.reduce((acc, curr) => acc + curr.studiedMinutes, 0))} <span className="text-xs font-semibold text-emerald-400">min</span>
                  </span>
                </div>
              </div>

              {(() => {
                const total = sessionsOfSelectedDate.reduce((acc, curr) => acc + curr.studiedMinutes, 0);
                const pct = Math.min(100, Math.round((total / dailyGoalMinutes) * 100));
                return (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Progresso</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 space-y-5">

                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Registrar sessão</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1.5">O que você estudou?</label>
                      <input
                        type="text"
                        placeholder="Ex: Revisão de Anatomia"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Início</label>
                        <input type="time" value={manualStart} onChange={(e) => setManualStart(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Fim</label>
                        <input type="time" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                      </div>
                    </div>
                    <button
                      onClick={() => selectedDate && handleStudyDayManualSave(selectedDate)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black rounded-xl transition-all shadow-md shadow-blue-100 uppercase tracking-wide"
                    >
                      Adicionar sessão
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Sessões registradas</p>
                  <div className="space-y-2">
                    {sessionsOfSelectedDate.length > 0 ? (
                      sessionsOfSelectedDate.map((session) => {
                        const currentStart = new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        const currentEnd = session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                        return (
                          <div
                            key={session.id}
                            className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50"
                          >
                            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400 group-focus-within:bg-blue-500 transition-colors shrink-0" />

                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                defaultValue={session.description}
                                placeholder="Descrição"
                                className="w-full text-sm font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 truncate"
                                onBlur={(e) => {
                                  if (e.target.value !== session.description)
                                    handleUpdateSession(session, e.target.value, currentStart, currentEnd);
                                }}
                              />
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <div className="relative group/time">
                                <label className="absolute -top-4 left-0 text-[9px] font-bold text-slate-400 uppercase tracking-wider opacity-0 group-hover/time:opacity-100 group-focus-within/time:opacity-100 transition-opacity whitespace-nowrap">
                                  Início
                                </label>
                                <div className="flex items-center gap-1 bg-white border border-slate-200 group-hover/time:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 rounded-lg px-2 py-1.5 transition-all cursor-text">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover/time:text-blue-400 group-focus-within/time:text-blue-500 transition-colors shrink-0">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <input
                                    type="time"
                                    defaultValue={currentStart}
                                    className="text-[12px] font-mono font-bold text-slate-600 bg-transparent border-none outline-none focus:text-blue-600 w-11.5 p-0 cursor-pointer"
                                    onBlur={(e) => {
                                      if (e.target.value !== currentStart)
                                        handleUpdateSession(session, session.description, e.target.value, currentEnd);
                                    }}
                                  />
                                </div>
                              </div>

                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-300 shrink-0 mx-0.5">
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>

                              <div className="relative group/time">
                                <label className="absolute -top-4 left-0 text-[9px] font-bold text-slate-400 uppercase tracking-wider opacity-0 group-hover/time:opacity-100 group-focus-within/time:opacity-100 transition-opacity whitespace-nowrap">
                                  Fim
                                </label>
                                <div className="flex items-center gap-1 bg-white border border-slate-200 group-hover/time:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 rounded-lg px-2 py-1.5 transition-all cursor-text">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover/time:text-blue-400 group-focus-within/time:text-blue-500 transition-colors shrink-0">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <input
                                    type="time"
                                    defaultValue={currentEnd}
                                    className="text-[12px] font-mono font-bold text-slate-600 bg-transparent border-none outline-none focus:text-blue-600 w-11.5 p-0 cursor-pointer"
                                    onBlur={(e) => {
                                      if (e.target.value !== currentEnd)
                                        handleUpdateSession(session, session.description, currentStart, e.target.value);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-black text-slate-400 w-8 text-right shrink-0 tabular-nums">
                              {session.studiedMinutes}m
                            </span>

                            <button
                              onClick={() => session.id && handleDeleteStudyDay(session.id)}
                              className="shrink-0 p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Excluir sessão"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-400">Nenhum registro para este dia</p>
                        <p className="text-xs text-slate-300 mt-0.5">Adicione uma sessão acima</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => setSelectedDate(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-black rounded-xl transition-all tracking-wide"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: any; label: string; value: any; bg: string }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-lg sm:text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}