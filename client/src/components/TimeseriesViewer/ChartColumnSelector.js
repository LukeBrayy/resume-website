import React from 'react';
import { X } from 'lucide-react';

const Button = ({ children, onClick, className = "", variant = "default" }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500";
  const variantStyles = {
    default: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:cursor-not-allowed",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:bg-gray-800 disabled:cursor-not-allowed"
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const ChartColumnSelector = ({
  columns,
  selectedColumnsPerChart,
  activeChartIndex,
  onChartSelect,
  onColumnToggle,
  charts
}) => {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium">Configure Chart:</span>
        <select 
          value={activeChartIndex}
          onChange={(e) => onChartSelect(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: charts }).map((_, idx) => (
            <option key={idx} value={idx}>Chart {idx + 1}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {columns.map((column) => {
          const isSelected = selectedColumnsPerChart[activeChartIndex]?.includes(column);
          
          return (
            <Button
              key={column}
              onClick={() => onColumnToggle(column)}
              variant={isSelected ? "default" : "secondary"}
              className="flex items-center gap-2"
            >
              {column}
              {isSelected && (
                <X size={14} className="text-gray-400" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ChartColumnSelector;