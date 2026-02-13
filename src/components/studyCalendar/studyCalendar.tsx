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
  Play,
  Pause,
  RotateCcw,
  Settings,
  CheckCircle2,
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newValue = prev + 1;
          if (newValue % 60 === 0) saveProgress(newValue);
          return newValue;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning]);

  useEffect(() => {
    loadStudySessions();
  }, [currentDate]);

  useEffect(() => {
    const init = async () => {
      await loadStudyGoal();
      await loadStudyDayActive();
      await loadStudySessions();
    };
    init();
  }, []);

  const loadStudyGoal = async () => {
    try {
      const { data } = await api.get<StudyGoalResponse>(`/study-goal`);
      setGoal(data);
      setDailyGoalMinutes(data.dailyStudyMinutes);
      setTempGoal(data.dailyStudyMinutes);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setGoal(null);
      }
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

      const { data } = await api.get<StudyDayResponse[]>(
        `/study-day/calendar?start=${start}&end=${end}`
      );
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
        setIsTimerRunning(true);
        const start = new Date(data.startTime).getTime();
        const now = new Date().getTime();
        const diffInSeconds = Math.floor((now - start) / 1000);
        setElapsedSeconds(diffInSeconds > 0 ? diffInSeconds : 0);
      }
    } catch (error) {
      console.log("Nenhuma sessão ativa encontrada");
    }
  };

  const createStudyDay = async () => {
    try {
      const { data } = await api.post<StudyDayResponse>("/study-day");
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

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getStudySessionByDate = (date: Date): StudyDayResponse | undefined => {
    const dateStr = formatDate(date);
    return studySessions.find((s) => s.studyDate === dateStr);
  };

  const isDateStudied = (date: Date): boolean => {
    const session = getStudySessionByDate(date);
    return session !== undefined && session.studiedMinutes >= dailyGoalMinutes;
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isWeekend = (date: Date) => [0, 6].includes(date.getDay());

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    return days;
  };

  const calculateStats = (): StudyStats => {
    const qualifiedDays = studySessions.filter(s => s.studiedMinutes >= dailyGoalMinutes);
    const totalMinutes = studySessions.reduce((sum, s) => sum + s.studiedMinutes, 0);

    // Streak logic
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

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} subtitle="Estudos" showListSection={false} />
      <div className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Calendário de Estudos" />
        <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-6">

          {/* Timer Card */}
          <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Sessão Atual</h3>
                  <p className="text-xs sm:text-sm text-blue-100">Meta: {dailyGoalMinutes} min</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTempGoal(dailyGoalMinutes);
                  setShowSettings(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all backdrop-blur-sm group"
              >
                <Settings className="w-4 h-4 text-blue-100 group-hover:rotate-45 transition-transform" />
                <span className="text-xs sm:text-sm font-medium text-white">
                  Configurar meta
                </span>
              </button>
            </div>

            <div className="text-center mb-4 sm:mb-6">
              <div className="text-4xl sm:text-6xl font-bold font-mono">{formatTime(elapsedSeconds)}</div>
              <div className="text-xs sm:text-sm mt-2">{Math.floor(elapsedSeconds / 60)} de {dailyGoalMinutes} min</div>
            </div>

            <div className="h-2 sm:h-3 bg-white/20 rounded-full mb-4 sm:mb-6 overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              {!isTimerRunning ? (
                <button
                  onClick={createStudyDay}
                  className="bg-white text-blue-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" /> Iniciar
                </button>
              ) : (
                <button
                  onClick={finishStudyDay}
                  className="bg-orange-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                >
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> Pausar/Finalizar
                </button>
              )}
              <button
                onClick={() => { setIsTimerRunning(false); setElapsedSeconds(0); }}
                className="bg-white/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            <StatCard icon={<CalendarIcon className="text-blue-600 w-4 h-4" />} label="Dias" value={stats.totalDays} bg="bg-blue-100" />
            <StatCard icon={<Flame className="text-orange-600 w-4 h-4" />} label="Streak" value={stats.currentStreak} bg="bg-orange-100" />
            <StatCard icon={<Award className="text-purple-600 w-4 h-4" />} label="Recorde" value={stats.longestStreak} bg="bg-purple-100" />
            <StatCard icon={<Clock className="text-green-600 w-4 h-4" />} label="Horas" value={`${Math.floor(stats.totalMinutes / 60)}h`} bg="bg-green-100" />
            <StatCard icon={<TrendingUp className="text-cyan-600 w-4 h-4" />} label="Média" value={`${stats.averageMinutes}m`} bg="bg-cyan-100" />
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                onClick={previousMonth}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h2 className="text-base sm:text-xl font-bold capitalize text-gray-900">
                {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg text-gray-900 transition-colors"
              >
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
                    className={`aspect-square rounded-lg sm:rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${isToday(date) ? 'border-blue-500 bg-blue-50' : 'border-gray-150'
                      } ${isFinished ? 'bg-emerald-50 border-emerald-200' : ''}`}
                  >
                    <span className={`text-xs sm:text-sm font-semibold ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </span>
                    {isFinished && (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mt-0.5" />
                    )}
                    {session && !isFinished && session.studiedMinutes > 0 && (
                      <div className="absolute bottom-0.5 sm:bottom-1 w-1/2 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400"
                          style={{ width: `${(session.studiedMinutes / dailyGoalMinutes) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">

            {/* Header do Modal */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Ajustar Meta
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                  Minutos de estudo por dia
                </label>
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
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: any, label: string, value: any, bg: string }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 ${bg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-lg sm:text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}