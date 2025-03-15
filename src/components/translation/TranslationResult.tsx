import { formatTimestamp } from '@/lib/utils/helpers';
import { getLanguageFlag } from '@/lib/utils/languages';
import { TranslationResult as TranslationResultType } from '@/types';

interface TranslationResultProps {
  result: TranslationResultType;
  showTimestamp?: boolean;
  showConfidence?: boolean;
}

export default function TranslationResult({
  result,
  showTimestamp = false,
  showConfidence = false,
}: TranslationResultProps) {
  const { originalText, translatedText, sourceLanguage, targetLanguage, confidence, timestamp } = result;
  
  const sourceFlag = getLanguageFlag(sourceLanguage);
  const targetFlag = getLanguageFlag(targetLanguage);
  
  // Calculate confidence level for UI
  const confidenceLevel = confidence ? Math.round(confidence * 100) : 0;
  const confidenceColor = 
    confidenceLevel >= 90 ? 'text-green-600 dark:text-green-400' :
    confidenceLevel >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-600 dark:text-red-400';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="mb-3">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">{sourceFlag}</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Original</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{originalText}</p>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">{targetFlag}</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Translation</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{translatedText}</p>
      </div>
      
      {(showTimestamp || showConfidence) && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          {showTimestamp && (
            <span>{formatTimestamp(timestamp)}</span>
          )}
          
          {showConfidence && confidence !== undefined && (
            <span className={confidenceColor}>
              Confidence: {confidenceLevel}%
            </span>
          )}
        </div>
      )}
    </div>
  );
} 