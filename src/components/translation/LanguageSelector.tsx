import { addRecentLanguage, getRecentLanguages, supportedLanguages } from '@/lib/data/languages';
import { CheckIcon, ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  disabled?: boolean;
  showDetect?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  showDetect = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load recent languages
  useEffect(() => {
    setRecentLanguages(getRecentLanguages());
  }, []);
  
  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFilter('');
    }
  };
  
  const handleSelect = (code: string) => {
    onChange(code);
    addRecentLanguage(code);
    setRecentLanguages(getRecentLanguages());
    setIsOpen(false);
  };
  
  const filteredLanguages = supportedLanguages.filter(lang => {
    const searchTerm = filter.toLowerCase();
    return (
      lang.name.toLowerCase().includes(searchTerm) || 
      lang.nativeName.toLowerCase().includes(searchTerm) || 
      lang.code.toLowerCase().includes(searchTerm)
    );
  });
  
  // Get selected language
  const selectedLanguage = supportedLanguages.find(lang => lang.code === value);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`relative w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
          rounded-md px-3 py-2 text-left cursor-default focus:outline-none focus:ring-1 
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          disabled ? 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400' : ''
        }`}
      >
        <span className="flex items-center">
          {selectedLanguage ? (
            <>
              <span className="mr-2 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {selectedLanguage.code}
              </span>
              {selectedLanguage.name} ({selectedLanguage.nativeName})
            </>
          ) : (
            <span className="text-gray-400">Select language</span>
          )}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-80 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search languages..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {showDetect && (
            <button
              type="button"
              className={`w-full text-left px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 ${
                value === 'auto' ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => handleSelect('auto')}
            >
              <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-500" />
              <span>Auto-detect language</span>
              {value === 'auto' && (
                <CheckIcon className="h-4 w-4 ml-auto text-blue-500" />
              )}
            </button>
          )}
          
          {recentLanguages.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent
              </div>
              {recentLanguages.map(code => {
                const language = supportedLanguages.find(lang => lang.code === code);
                if (!language) return null;
                
                return (
                  <button
                    key={`recent-${language.code}`}
                    type="button"
                    className={`w-full text-left px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      value === language.code ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => handleSelect(language.code)}
                  >
                    <span className="mr-2 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {language.code}
                    </span>
                    <span>{language.name} <span className="text-gray-500 dark:text-gray-400">({language.nativeName})</span></span>
                    {value === language.code && (
                      <CheckIcon className="h-4 w-4 ml-auto text-blue-500" />
                    )}
                  </button>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            </>
          )}
          
          <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            All Languages
          </div>
          
          {filteredLanguages.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No languages found
            </div>
          ) : (
            filteredLanguages.map(language => (
              <button
                key={language.code}
                type="button"
                className={`w-full text-left px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  value === language.code ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => handleSelect(language.code)}
              >
                <span className="mr-2 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {language.code}
                </span>
                <span>{language.name} <span className="text-gray-500 dark:text-gray-400">({language.nativeName})</span></span>
                {value === language.code && (
                  <CheckIcon className="h-4 w-4 ml-auto text-blue-500" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 