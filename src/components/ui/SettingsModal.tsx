interface SettingsModalProps {
  onClose: () => void;
  onSave: () => void;
  tempGoal: {
    hours: number;
    minutes: number;
    secs: number;
  };
  setTempGoal: (goal: { hours: number; minutes: number; secs: number }) => void;
  currentGoalDisplay: string;
}

export function SettingsModal({ onClose, onSave, tempGoal, setTempGoal, currentGoalDisplay }: SettingsModalProps) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h3 className="text-xl font-extrabold mb-5" style={{ color: "var(--text)" }}>Ajustar Meta</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <TimeInput label="Horas" value={tempGoal.hours} onChange={(v) => setTempGoal({ ...tempGoal, hours: v })} max={23} />
                    <TimeInput label="Minutos" value={tempGoal.minutes} onChange={(v) => setTempGoal({ ...tempGoal, minutes: v })} max={59} />
                    <TimeInput label="Segundos" value={tempGoal.secs} onChange={(v) => setTempGoal({ ...tempGoal, secs: v })} max={59} />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold" style={{ background: "var(--bg-hover)" }}>Cancelar</button>
                    <button onClick={onSave} className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold">Confirmar</button>
                </div>
            </div>
        </div>
    );
}

interface TimeInputProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

function TimeInput({ label, value, onChange, max }: TimeInputProps) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>{label}</span>
            <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full p-2 rounded-lg text-center font-bold" style={{ background: "var(--bg-subtle)", color: "var(--text)" }} />
        </div>
    );
}