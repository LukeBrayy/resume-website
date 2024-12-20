import React from 'react';

const Button = ({ children, onClick, className = "", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500";
  const defaultStyles = "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:cursor-not-allowed";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${defaultStyles} ${className}`}
    >
      {children}
    </button>
  );
};

const ChartControls = ({
  charts,
  onUpdateChartCount,
  onPresetSelected,
  maxCharts = 4,
  minCharts = 1
}) => {
  const handleAddChart = () => {
    onUpdateChartCount(Math.min(charts + 1, maxCharts));
  };

  const handleRemoveChart = () => {
    onUpdateChartCount(Math.max(charts - 1, minCharts));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <Button onClick={() => onPresetSelected('3charts')}>
        3 Charts Preset
      </Button>
      
      <Button onClick={() => onPresetSelected('single')}>
        Single Chart
      </Button>
      
      <Button 
        onClick={handleAddChart}
        disabled={charts >= maxCharts}
      >
        Add Chart
      </Button>
      
      <Button 
        onClick={handleRemoveChart}
        disabled={charts <= minCharts}
      >
        Remove Chart
      </Button>
    </div>
  );
};

export default ChartControls;