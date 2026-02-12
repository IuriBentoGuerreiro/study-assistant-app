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
} from "lucide-react";
import Sidebar from "../ui/sidebar";
import Header from "../ui/header";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Info,
} from "lucide-react";
import { api } from "@/src/lib/api";
import { StudyGoalRequest, StudyGoalResponse } from "@/src/types/StudyGoal";

type StudySession = {
  date: string;
  studiedMinutes: number;
};

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

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(60);
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoal, setTempGoal] = useState(60);

  const [goal, setGoal] = useState<StudyGoalResponse | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);

  // Dados mockados - substituir pela chamada da API
  const [studySessions, setStudySessions] = useState<StudySession[]>([
    { date: "2026-02-01", studiedMinutes: 45 },
    { date: "2026-02-03", studiedMinutes: 72 },
    { date: "2026-02-04", studiedMinutes: 60 },
    { date: "2026-02-05", studiedMinutes: 90 },
    { date: "2026-02-07", studiedMinutes: 55 },
    { date: "2026-02-08", studiedMinutes: 65 },
    { date: "2026-02-09", studiedMinutes: 30 },
  ]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: FileText, label: "Resumos", path: "/resume" },
    { icon: CalendarIcon, label: "Calendário", path: "/calendar", active: true },
    { icon: Info, label: "Sobre", path: "/about" },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newValue = prev + 1;

          // Auto-save progress every minute
          if (newValue % 60 === 0) {
            saveProgress(newValue);
          }

          // Check if goal reached
          if (newValue >= dailyGoalMinutes * 60) {
            setIsTimerRunning(false);
            markTodayAsCompleted(newValue);
            return newValue;
          }

          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, dailyGoalMinutes]);

  // Load today's progress on mount
  useEffect(() => {
    loadTodayProgress();
    loadStudySessions();
    loadStudyGoal();
  }, []);

  const loadStudyGoal = async () => {
    try {
      const userId = Number(sessionStorage.getItem("userId"));
      
      if (!userId) {
        console.error("userId não encontrado no sessionStorage");
        setLoadingGoal(false);
        return;
      }

      const { data } = await api.get<StudyGoalResponse>(`/study-goal/${userId}`);
      
      setGoal(data);
      setDailyGoalMinutes(data.dailyStudyMinutes);
      setTempGoal(data.dailyStudyMinutes);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Usuário ainda não tem meta configurada
        setGoal(null);
        console.log("Nenhuma meta encontrada para este usuário");
      } else {
        console.error("Erro ao carregar meta de estudos:", error);
      }
    } finally {
      setLoadingGoal(false);
    }
  };

  // API Functions (mock - implementar com chamadas reais)
  const loadStudySessions = async () => {
    try {
      // TODO: Implementar chamada real à API
      // const userId = Number(sessionStorage.getItem("userId"));
      // const { data } = await api.get(`/study-sessions/${userId}`);
      // setStudySessions(data);

      console.log("Loading study sessions from API...");
    } catch (error) {
      console.error("Error loading study sessions:", error);
    }
  };

  const loadTodayProgress = async () => {
    try {
      // TODO: Implementar chamada real à API
      // const userId = Number(sessionStorage.getItem("userId"));
      // const today = formatDate(new Date());
      // const { data } = await api.get(`/study-progress/${userId}/${today}`);
      // setElapsedSeconds(data.elapsedSeconds || 0);

      const today = formatDate(new Date());
      const todaySession = studySessions.find((s) => s.date === today);
      if (todaySession) {
        setElapsedSeconds(todaySession.studiedMinutes * 60);
      }
    } catch (error) {
      console.error("Error loading today's progress:", error);
    }
  };

  const saveProgress = async (seconds: number) => {
    try {
      // TODO: Implementar chamada real à API
      // const userId = Number(sessionStorage.getItem("userId"));
      // const today = formatDate(new Date());
      // await api.put(`/study-progress/${userId}/${today}`, {
      //   elapsedSeconds: seconds,
      // });

      console.log("Saving progress:", seconds, "seconds");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const markTodayAsCompleted = async (totalSeconds: number) => {
    try {
      // TODO: Implementar chamada real à API
      // const userId = Number(sessionStorage.getItem("userId"));
      // const today = formatDate(new Date());
      // await api.post(`/study-sessions/${userId}`, {
      //   date: today,
      //   studiedMinutes: Math.floor(totalSeconds / 60),
      // });

      const today = formatDate(new Date());
      const minutes = Math.floor(totalSeconds / 60);

      setStudySessions((prev) => {
        const existing = prev.find((s) => s.date === today);
        if (existing) {
          return prev.map((s) =>
            s.date === today ? { ...s, studiedMinutes: minutes } : s
          );
        }
        return [...prev, { date: today, studiedMinutes: minutes }];
      });

      // Show success message
      alert("🎉 Parabéns! Você atingiu sua meta de estudos hoje!");
    } catch (error) {
      console.error("Error marking day as completed:", error);
    }
  };

  const createDailyGoal = async (
    request: StudyGoalRequest
  ): Promise<StudyGoalResponse> => {
    try {
      const userId = Number(sessionStorage.getItem("userId"));

      if (!userId) {
        throw new Error("userId não encontrado");
      }

      const requestWithUserId = {
        ...request,
        userId: userId,
      };

      const { data } = await api.post<StudyGoalResponse>(
        "/study-goal",
        requestWithUserId
      );

      setGoal(data);
      setDailyGoalMinutes(data.dailyStudyMinutes);
      setTempGoal(data.dailyStudyMinutes);
      setShowSettings(false);

      return data;
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      alert("Erro ao criar meta. Tente novamente.");
      throw error;
    }
  };

  const updateDailyGoal = async (
    request: StudyGoalRequest
  ): Promise<StudyGoalResponse> => {
    if (!goal) throw new Error("Meta não carregada");

    try {
      const userId = Number(sessionStorage.getItem("userId"));

      if (!userId) {
        throw new Error("userId não encontrado");
      }

      const requestWithUserId = {
        ...request,
        userId: userId,
      };

      const { data } = await api.put<StudyGoalResponse>(
        `/study-goal/${goal.id}`,
        requestWithUserId
      );

      setGoal(data);
      setDailyGoalMinutes(data.dailyStudyMinutes);
      setTempGoal(data.dailyStudyMinutes);
      setShowSettings(false);

      return data;
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      alert("Erro ao atualizar meta. Tente novamente.");
      throw error;
    }
  };

  // Helper functions
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s
    ).padStart(2, "0")}`;
  };

  const getStudySessionByDate = (date: Date): StudySession | undefined => {
    const dateStr = formatDate(date);
    return studySessions.find((s) => s.date === dateStr);
  };

  const isDateStudied = (date: Date): boolean => {
    const session = getStudySessionByDate(date);
    return session !== undefined && session.studiedMinutes >= dailyGoalMinutes;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Calendar navigation
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // Calendar rendering
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Statistics calculation
  const calculateStats = (): StudyStats => {
    const totalDays = studySessions.filter(
      (s) => s.studiedMinutes >= dailyGoalMinutes
    ).length;
    const totalMinutes = studySessions.reduce(
      (sum, s) => sum + s.studiedMinutes,
      0
    );

    // Calculate current streak
    let currentStreak = 0;
    const sortedSessions = [...studySessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let checkDate = new Date();
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      if (
        formatDate(sessionDate) === formatDate(checkDate) &&
        session.studiedMinutes >= dailyGoalMinutes
      ) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (sessionDate < checkDate) {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const allDates = studySessions
      .filter((s) => s.studiedMinutes >= dailyGoalMinutes)
      .map((s) => new Date(s.date))
      .sort((a, b) => a.getTime() - b.getTime());

    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(allDates[i - 1]);
        const currDate = new Date(allDates[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      totalDays,
      currentStreak,
      longestStreak,
      totalMinutes,
      averageMinutes: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0,
    };
  };

  const handleSaveGoal = async () => {
    try {
      if (tempGoal < 5 || tempGoal > 480) {
        alert("A meta deve estar entre 5 e 480 minutos");
        return;
      }

      if (!goal) {
        await createDailyGoal({ dailyStudyMinutes: tempGoal });
      } else {
        await updateDailyGoal({ dailyStudyMinutes: tempGoal });
      }
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    }
  };

  const stats = calculateStats();
  const progress = Math.min((elapsedSeconds / (dailyGoalMinutes * 60)) * 100, 100);
  const days = getDaysInMonth();

  // Loading state
  if (loadingGoal) {
    return (
      <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menuItems={menuItems}
        subtitle="Acompanhamento de estudos"
        showListSection={false}
      />

      <div className="flex-1 overflow-y-auto">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Calendário de Estudos"
        />

        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
          {/* Timer Section */}
          <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sessão de Estudos</h3>
                  <p className="text-sm text-blue-100">
                    Meta: {dailyGoalMinutes} minutos
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTempGoal(dailyGoalMinutes);
                  setShowSettings(true);
                }}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl sm:text-6xl font-bold font-mono tracking-tight mb-2">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-sm text-blue-100">
                {Math.floor(elapsedSeconds / 60)} de {dailyGoalMinutes} minutos
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-3 justify-center">
              {!isTimerRunning ? (
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg"
                >
                  <Pause className="w-5 h-5" />
                  Pausar
                </button>
              )}
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <RotateCcw className="w-5 h-5" />
                Resetar
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-gray-600">Dias</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalDays}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-sm text-gray-600">Sequência</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.currentStreak}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600">Recorde</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.longestStreak}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.floor(stats.totalMinutes / 60)}h
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="text-sm text-gray-600">Média</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.averageMinutes}m
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900">
                {currentDate.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <button
                onClick={nextMonth}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const studied = isDateStudied(date);
                const today = isToday(date);
                const weekend = isWeekend(date);
                const session = getStudySessionByDate(date);

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded-xl p-2 border-2 transition-all cursor-pointer
                      ${
                        today
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                          : "border-gray-200"
                      }
                      ${
                        weekend && !today
                          ? "bg-linear-to-br from-amber-50 to-yellow-50"
                          : "bg-white"
                      }
                      ${
                        studied
                          ? "bg-linear-to-br from-green-50 to-emerald-50 border-green-300"
                          : ""
                      }
                      hover:shadow-lg hover:scale-105 hover:border-blue-400
                      flex flex-col items-center justify-center relative
                      group
                    `}
                  >
                    <div
                      className={`
                      text-lg font-semibold
                      ${
                        today
                          ? "text-blue-700"
                          : weekend
                          ? "text-amber-700"
                          : "text-gray-700"
                      }
                    `}
                    >
                      {date.getDate()}
                    </div>

                    {studied && (
                      <div className="absolute top-1 right-1 text-lg">✅</div>
                    )}

                    {session &&
                      session.studiedMinutes < dailyGoalMinutes &&
                      session.studiedMinutes > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-6 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{
                                width: `${
                                  (session.studiedMinutes / dailyGoalMinutes) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Tooltip on hover */}
                    {session && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {session.studiedMinutes} minutos
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-blue-500 bg-blue-50"></div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-linear-to-br from-amber-50 to-yellow-50 border-2 border-gray-200"></div>
                <span>Fim de semana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-300 relative">
                  <span className="absolute -top-1 -right-1 text-xs">✅</span>
                </div>
                <span>Meta atingida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white border-2 border-gray-200 relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-blue-500"></div>
                </div>
                <span>Em progresso</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {goal ? "Editar Meta" : "Criar Meta de Estudos"}
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta diária de estudos (minutos)
                </label>
                <input
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  min="5"
                  max="480"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escolha entre 5 e 480 minutos (8 horas)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {goal ? "Atualizar" : "Criar Meta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}