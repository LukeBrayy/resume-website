import React, { useState, useCallback } from 'react';
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
import { Upload, X } from 'lucide-react';

const Button = ({ children, onClick, className = "", disabled = false, variant = "default" }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500";
  const variantStyles = {
    default: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:cursor-not-allowed",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:bg-gray-800 disabled:cursor-not-allowed"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-gray-700 ${className}`}>
    {children}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <Upload size={48} className="mb-4" />
    <p className="text-lg">Upload a CSV file to get started</p>
    <p className="text-sm mt-2">Your data will be processed locally in the browser</p>
  </div>
);

const TimeseriesViewer = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumnsPerChart, setSelectedColumnsPerChart] = useState([[]]);
  const [charts, setCharts] = useState(1);
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            if (index === 0 && values[index].includes('-')) {
              row[header] = new Date(values[index]).getTime();
            } else {
              const num = parseFloat(values[index]);
              row[header] = isNaN(num) ? values[index] : num;
            }
          });
          return row;
        });
      
      setData(parsedData);
      setColumns(headers);
      setSelectedColumnsPerChart(Array(charts).fill([headers[0]]));
      setActiveChartIndex(0);
    };
    
    reader.readAsText(file);
  }, [charts]);

  const toggleColumn = useCallback((column) => {
    setSelectedColumnsPerChart(prev => {
      const newSelection = [...prev];
      const currentSelection = newSelection[activeChartIndex] || [];
      
      if (currentSelection.includes(column)) {
        newSelection[activeChartIndex] = currentSelection.filter(c => c !== column);
      } else {
        newSelection[activeChartIndex] = [...currentSelection, column];
      }
      
      return newSelection;
    });
  }, [activeChartIndex]);

  const updateChartCount = useCallback((newCount) => {
    setCharts(newCount);
    setSelectedColumnsPerChart(prev => {
      const newSelection = Array(newCount).fill(null);
      for (let i = 0; i < newCount; i++) {
        newSelection[i] = prev[i] || (columns[0] ? [columns[0]] : []);
      }
      return newSelection;
    });
  }, [columns]);

  const presets = {
    '3charts': () => {
      if (columns.length < 2) return;
      updateChartCount(3);
      setSelectedColumnsPerChart([
        [columns[0], columns[1]],
        [columns[0], columns[2] || columns[1]],
        [columns[0], columns[3] || columns[1]]
      ]);
    },
    'single': () => {
      if (columns.length < 2) return;
      updateChartCount(1);
      setSelectedColumnsPerChart([[columns[0], columns[1]]]);
    }
  };

  const colors = ['#2563eb', '#db2777', '#16a34a', '#ea580c', '#8b5cf6'];

  const formatXAxis = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-gray-100">
      <div className="h-full flex flex-col p-4">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Button 
            onClick={() => document.getElementById('file-upload').click()}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Upload CSV
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {columns.length > 0 && (
            <>
              <Button onClick={presets['3charts']}>3 Charts Preset</Button>
              <Button onClick={presets['single']}>Single Chart</Button>
              
              <Button 
                onClick={() => updateChartCount(Math.min(charts + 1, 4))}
                disabled={charts >= 4}
              >
                Add Chart
              </Button>
              <Button 
                onClick={() => updateChartCount(Math.max(charts - 1, 1))}
                disabled={charts <= 1}
              >
                Remove Chart
              </Button>
            </>
          )}
        </div>

        {columns.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Configure Chart:</span>
              <select 
                value={activeChartIndex}
                onChange={(e) => setActiveChartIndex(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: charts }).map((_, idx) => (
                  <option key={idx} value={idx}>Chart {idx + 1}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <Button
                  key={column}
                  onClick={() => toggleColumn(column)}
                  variant={selectedColumnsPerChart[activeChartIndex]?.includes(column) ? "default" : "secondary"}
                  className="flex items-center gap-2"
                >
                  {column}
                  {selectedColumnsPerChart[activeChartIndex]?.includes(column) && (
                    <X size={14} className="text-gray-400" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 gap-4 overflow-auto">
          {data.length === 0 ? (
            <Card className="p-4 bg-gray-800">
              <EmptyState />
            </Card>
          ) : (
            Array.from({ length: charts }).map((_, idx) => (
              <Card 
                key={idx} 
                className={`relative p-4 bg-gray-800 transition-all cursor-pointer hover:bg-gray-750 
                  ${activeChartIndex === idx ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-600'}`}
                onClick={() => setActiveChartIndex(idx)}
              >
                <div className="absolute top-2 right-2 px-2 py-1 bg-gray-700 rounded-md text-xs font-medium">
                  Chart {idx + 1}
                  {activeChartIndex === idx && (
                    <span className="ml-2 text-blue-400">(Selected)</span>
                  )}
                </div>

                <div className={`h-full ${charts === 1 ? 'min-h-[24rem]' : charts === 2 ? 'min-h-[20rem]' : 'min-h-[16rem]'}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey={columns[0]}
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={formatXAxis}
                        type="number"
                        domain={['dataMin', 'dataMax']}
                      />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
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
                        dataKey={columns[0]} 
                        height={30} 
                        stroke="#4b5563"
                        tickFormatter={formatXAxis}
                      />
                      {selectedColumnsPerChart[idx]?.slice(1).map((column, colIdx) => (
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
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeseriesViewer;