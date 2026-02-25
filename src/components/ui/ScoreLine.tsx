export function ScoreLine({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
      <div className={`w-2 h-2 ${color} rounded-full`} />
      <span>
        <strong style={{ color: "var(--text)" }}>{label}:</strong> {value}
      </span>
    </div>
  );
}