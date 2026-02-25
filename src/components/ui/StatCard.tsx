export function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <span className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div className="text-lg sm:text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
    </div>
  );
}