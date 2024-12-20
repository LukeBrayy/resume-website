import React from 'react';
import { Upload, ChevronUp, ChevronDown } from 'lucide-react';

const Button = ({ children, onClick, className = "" }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500";
  const defaultStyles = "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:cursor-not-allowed";
  
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${defaultStyles} ${className}`}
    >
      {children}
    </button>
  );
};

const FileUploadSection = ({ 
  onFileUpload, 
  hasColumns = false,
  isConfigVisible = true,
  onToggleConfig = () => {}
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
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
        onChange={handleFileChange}
        className="hidden"
      />
      
      {hasColumns && (
        <Button
          onClick={onToggleConfig}
          className="flex items-center gap-2"
        >
          {isConfigVisible ? (
            <>
              <ChevronUp size={16} />
              Hide Configuration
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Configuration
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FileUploadSection;