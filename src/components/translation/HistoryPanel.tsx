import TranslationResult from '@/components/translation/TranslationResult';
import Button from '@/components/ui/Button';
import { useTranslationStore } from '@/lib/store/useTranslationStore';
import { formatTimestamp } from '@/lib/utils/helpers';
import { getLanguageFlag, getLanguageName } from '@/lib/utils/languages';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function HistoryPanel() {
  const { sessions, clearHistory } = useTranslationStore();
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  
  // Toggle session expansion
  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };
  
  // Handle clear history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all translation history?')) {
      clearHistory();
    }
  };
  
  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Translation History
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have any translation sessions yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Translation History
        </h2>
        
        <Button
          onClick={handleClearHistory}
          variant="danger"
          size="sm"
          leftIcon={<TrashIcon className="h-4 w-4" />}
        >
          Clear All
        </Button>
      </div>
      
      <div className="space-y-4">
        {sessions.slice().reverse().map((session) => {
          const isExpanded = expandedSessions[session.id] || false;
          const sourceFlag = getLanguageFlag(session.sourceLanguage);
          const targetFlag = getLanguageFlag(session.targetLanguage);
          const sourceName = getLanguageName(session.sourceLanguage);
          const targetName = getLanguageName(session.targetLanguage);
          const sessionDate = formatTimestamp(session.startTime);
          const translationCount = session.translations.length;
          
          return (
            <div 
              key={session.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div 
                className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSession(session.id)}
              >
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sessionDate}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="mr-1">{sourceFlag}</span>
                    <span className="text-gray-700 dark:text-gray-300">{sourceName}</span>
                    <span className="mx-2">→</span>
                    <span className="mr-1">{targetFlag}</span>
                    <span className="text-gray-700 dark:text-gray-300">{targetName}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                    {translationCount} translation{translationCount !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4">
                  <div className="space-y-4">
                    {session.translations.map((translation, index) => (
                      <TranslationResult
                        key={index}
                        result={translation}
                        showTimestamp={true}
                        showConfidence={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 