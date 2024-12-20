import React from 'react';

const Select = ({ value, onChange, options, label, placeholder }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const DateConfiguration = ({ 
  columns, 
  dateConfig, 
  onDateConfigChange 
}) => {
  const handleModeChange = (mode) => {
    onDateConfigChange({
      ...dateConfig,
      mode
    });
  };

  const handleSingleColumnChange = (e) => {
    onDateConfigChange({
      ...dateConfig,
      singleColumn: e.target.value
    });
  };

  const handleCompositeColumnChange = (field) => (e) => {
    onDateConfigChange({
      ...dateConfig,
      [field]: e.target.value
    });
  };

  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-medium mb-4">Date Configuration</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={dateConfig.mode === 'single'}
              onChange={() => handleModeChange('single')}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Single Date Column</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={dateConfig.mode === 'composite'}
              onChange={() => handleModeChange('composite')}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Separate Year/Month/Day</span>
          </label>
        </div>

        {dateConfig.mode === 'single' ? (
          <Select
            label="Date Column"
            value={dateConfig.singleColumn}
            onChange={handleSingleColumnChange}
            options={columns}
          />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Year Column"
              value={dateConfig.yearColumn}
              onChange={handleCompositeColumnChange('yearColumn')}
              options={columns}
              placeholder="Select column"
            />
            <Select
              label="Month Column"
              value={dateConfig.monthColumn}
              onChange={handleCompositeColumnChange('monthColumn')}
              options={columns}
              placeholder="Select column"
            />
            <Select
              label="Day Column"
              value={dateConfig.dayColumn}
              onChange={handleCompositeColumnChange('dayColumn')}
              options={columns}
              placeholder="Select column"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateConfiguration;