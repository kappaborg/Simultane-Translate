import { exportSession } from '@/lib/utils/exportUtils';
import { TranslationSession } from '@/types';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface ExportPanelProps {
  session: TranslationSession;
  className?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ session, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'csv' | 'json'>('txt');

  if (!session || !session.translations.length) {
    return null;
  }

  const handleExport = () => {
    exportSession(session, selectedFormat);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <button
        onClick={togglePanel}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-blue-500" />
          <span className="font-medium">Export Translation Results</span>
        </div>
        <span className="text-sm text-gray-500">
          {session.translations.length} translation{session.translations.length !== 1 ? 's' : ''}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="export-format">
              Select Format
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="export-format"
                  value="txt"
                  checked={selectedFormat === 'txt'}
                  onChange={() => setSelectedFormat('txt')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">Text (.txt)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="export-format"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={() => setSelectedFormat('csv')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">CSV (.csv)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="export-format"
                  value="json"
                  checked={selectedFormat === 'json'}
                  onChange={() => setSelectedFormat('json')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">JSON (.json)</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {selectedFormat === 'txt' && 'Simple text format with original and translated text.'}
              {selectedFormat === 'csv' && 'Spreadsheet format, importable to Excel or Google Sheets.'}
              {selectedFormat === 'json' && 'Complete data including all metadata in JSON format.'}
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel; 