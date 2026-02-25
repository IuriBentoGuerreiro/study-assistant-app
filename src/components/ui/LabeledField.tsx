import Tooltip from "./Tooltip";

export function LabeledField({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</label>
        <Tooltip content={tooltip} position="bottom" />
      </div>
      {children}
    </div>
  );
}