import React, { useState, useCallback, useMemo } from 'react';
import FileUploadSection from './TimeseriesViewer/FileUploadSection';
import ChartControls from './TimeseriesViewer/ChartControls';
import DateConfiguration from './TimeseriesViewer/DateConfiguration';
import ChartColumnSelector from './TimeseriesViewer/ChartColumnSelector';
import TimeseriesChart, { EmptyState } from './TimeseriesViewer/TimeseriesChart';

const TimeseriesViewer = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumnsPerChart, setSelectedColumnsPerChart] = useState([[]]);
  const [charts, setCharts] = useState(1);
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const [isConfigVisible, setIsConfigVisible] = useState(true);
  const [dateConfig, setDateConfig] = useState({
    mode: 'single',
    singleColumn: '',
    yearColumn: '',
    monthColumn: '',
    dayColumn: ''
  });

  const processDate = useCallback((row) => {
    if (dateConfig.mode === 'single') {
      return dateConfig.singleColumn ? new Date(row[dateConfig.singleColumn]).getTime() : null;
    } else {
      if (!dateConfig.yearColumn || !dateConfig.monthColumn || !dateConfig.dayColumn) return null;
      return new Date(
        parseInt(row[dateConfig.yearColumn]),
        parseInt(row[dateConfig.monthColumn]) - 1,
        parseInt(row[dateConfig.dayColumn])
      ).getTime();
    }
  }, [dateConfig]);

  const handleFileUpload = useCallback((file) => {
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
            const num = parseFloat(values[index]);
            row[header] = isNaN(num) ? values[index] : num;
          });
          return row;
        });
      
      setData(parsedData);
      setColumns(headers);
      setDateConfig(prev => ({
        ...prev,
        singleColumn: headers[0]
      }));
      setSelectedColumnsPerChart(Array(charts).fill([headers[0]]));
      setActiveChartIndex(0);
    };
    
    reader.readAsText(file);
  }, [charts]);

  const processedData = useMemo(() => {
    return data.map(row => ({
      ...row,
      _timestamp: processDate(row)
    }));
  }, [data, processDate]);

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

  return (
    <div className="fixed inset-0 bg-gray-900 text-gray-100">
      <div className="h-full flex flex-col p-4">
        <FileUploadSection 
          onFileUpload={handleFileUpload}
          hasColumns={columns.length > 0}
          isConfigVisible={isConfigVisible}
          onToggleConfig={() => setIsConfigVisible(!isConfigVisible)}
        />

        {columns.length > 0 && isConfigVisible && (
          <div className="space-y-4 mb-6">
            <ChartControls
              charts={charts}
              onUpdateChartCount={updateChartCount}
              onPresetSelected={(preset) => presets[preset]()}
            />

            <DateConfiguration 
              columns={columns}
              dateConfig={dateConfig}
              onDateConfigChange={setDateConfig}
            />

            <ChartColumnSelector
              columns={columns}
              selectedColumnsPerChart={selectedColumnsPerChart}
              activeChartIndex={activeChartIndex}
              onChartSelect={setActiveChartIndex}
              onColumnToggle={toggleColumn}
              charts={charts}
            />
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 gap-4 overflow-auto">
          {data.length === 0 ? (
            <EmptyState />
          ) : (
            Array.from({ length: charts }).map((_, idx) => (
              <TimeseriesChart
                key={idx}
                data={processedData}
                selectedColumns={selectedColumnsPerChart[idx]}
                chartIndex={idx}
                activeChartIndex={activeChartIndex}
                totalCharts={charts}
                onChartClick={setActiveChartIndex}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeseriesViewer;