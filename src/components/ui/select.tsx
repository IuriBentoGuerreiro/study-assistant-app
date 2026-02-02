import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type SelectOption =
  | string
  | { label: string; value: string };

type NormalizedOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  allowCustomValue?: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Digite ou selecione",
  className = "",
  allowCustomValue = false,
}: CustomSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: NormalizedOption[] = options.map((opt) =>
    typeof opt === "string"
      ? { label: opt, value: opt }
      : opt
  );

  const selectedOption = normalizedOptions.find(
    (opt) => opt.value === value
  );

  const displayValue = allowCustomValue
    ? value
    : selectedOption?.label ?? "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleOptions = allowCustomValue
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(value.toLowerCase())
      )
    : normalizedOptions;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          readOnly={!allowCustomValue}
          value={displayValue}
          onChange={(e) => {
            if (allowCustomValue) {
              onChange(e.target.value);
              setShowDropdown(true);
            }
          }}
          onClick={() => setShowDropdown((prev) => !prev)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10
            cursor-pointer focus:border-blue-500 focus:outline-none
            focus:ring-2 focus:ring-blue-500/20 transition"
        />

        <button
          type="button"
          onClick={() => setShowDropdown((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {showDropdown && visibleOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border
          border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {visibleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2.5 text-gray-700
                hover:bg-gray-50 transition"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
