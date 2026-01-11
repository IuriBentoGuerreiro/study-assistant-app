import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Digite ou selecione",
  className = "",
}: CustomSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar opções baseado no que o usuário digitou
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
        />
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(option);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}