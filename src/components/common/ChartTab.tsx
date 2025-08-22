import React from "react";

interface ChartTabProps {
  value: "monthly" | "quarterly" | "annually";
  onChange: (value: "monthly" | "quarterly" | "annually") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ value, onChange }) => {
  const getButtonClass = (option: "monthly" | "quarterly" | "annually") =>
    value === option
      ? "bg-white/90 dark:bg-gray-950/90 text-amber-500 dark:text-amber-400 shadow font-semibold"
      : "text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/30";

  return (
    <div className="flex items-center gap-0.5 rounded-sm bg-gray-200/50 dark:bg-gray-700/50 p-0.5">
      <button
        onClick={() => onChange("monthly")}
        className={`px-3 py-2 font-medium w-full rounded-sm text-sm transition-all duration-200 cursor-pointer ${getButtonClass(
          "monthly"
        )}`}
        type="button"
      >
        Monthly
      </button>

      <button
        onClick={() => onChange("quarterly")}
        className={`px-3 py-2 font-medium w-full rounded-sm text-sm transition-all duration-200 cursor-pointer ${getButtonClass(
          "quarterly"
        )}`}
        type="button"
      >
        Quarterly
      </button>

      <button
        onClick={() => onChange("annually")}
        className={`px-3 py-2 font-medium w-full rounded-sm text-sm transition-all duration-200 cursor-pointer ${getButtonClass(
          "annually"
        )}`}
        type="button"
      >
        Annually
      </button>
    </div>
  );
};

export default ChartTab;