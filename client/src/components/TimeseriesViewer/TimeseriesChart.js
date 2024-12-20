import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-gray-700 ${className}`}>
    {children}
  </div>
);

const TimeseriesChart = ({
  data,
  selectedColumns,
  chartIndex,
  activeChartIndex,
  totalCharts,
  onChartClick
}) => {
  const [height, setHeight] = useState(totalCharts === 1 ? 384 : totalCharts === 2 ? 320 : 256); // 24rem, 20rem, 16rem in pixels
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const colors = ['#2563eb', '#db2777', '#16a34a', '#ea580c', '#8b5cf6'];

  const formatXAxis = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    const newHeight = Math.max(200, startHeight.current + delta); // Minimum height of 200px
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <Card 
      className={`relative p-4 bg-gray-800 transition-all cursor-pointer hover:bg-gray-750 
        ${activeChartIndex === chartIndex ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-600'}`}
      onClick={() => onChartClick(chartIndex)}
    >
      <div className="absolute top-2 right-2 px-2 py-1 bg-gray-700 rounded-md text-xs font-medium">
        Chart {chartIndex + 1}
        {activeChartIndex === chartIndex && (
          <span className="ml-2 text-blue-400">(Selected)</span>
        )}
      </div>

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="_timestamp"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              tickFormatter={formatXAxis}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af' }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#f3f4f6'
              }}
              labelFormatter={formatXAxis}
            />
            <Brush 
              dataKey="_timestamp"
              height={30} 
              stroke="#4b5563"
              tickFormatter={formatXAxis}
            />
            {selectedColumns?.slice(1).map((column, colIdx) => (
              <Line
                key={column}
                type="monotone"
                dataKey={column}
                stroke={colors[colIdx % colors.length]}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-gray-600 rounded-b-lg"
        onMouseDown={handleMouseDown}
      />
    </Card>
  );
};

// EmptyState component remains the same
export const EmptyState = () => (
  <Card className="p-4 bg-gray-800">
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Upload size={48} className="mb-4" />
      <p className="text-lg">Upload a CSV file to get started</p>
      <p className="text-sm mt-2">Your data will be processed locally in the browser</p>
    </div>
  </Card>
);

export default TimeseriesChart;