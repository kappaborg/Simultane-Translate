import { TranslationSession } from '@/types';
import { formatTimestamp } from './helpers';

/**
 * Export translation session to text format
 */
export const exportToText = (session: TranslationSession): string => {
  const header = `Translation Session: ${formatTimestamp(session.startTime)}\n`;
  const separator = '==================================================\n';
  
  const results = session.translations.map((result, index) => {
    return `[${index + 1}] Original (${result.sourceLanguage}):\n${result.originalText}\n\nTranslation (${result.targetLanguage}):\n${result.translatedText}\n`;
  }).join('\n' + separator);
  
  return `${header}${separator}${results}`;
};

/**
 * Export translation session to CSV format
 */
export const exportToCSV = (session: TranslationSession): string => {
  const header = 'Index,Timestamp,Source Language,Original Text,Target Language,Translation,Confidence\n';
  
  const rows = session.translations.map((result, index) => {
    // Escape CSV values
    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    
    return [
      index + 1,
      formatTimestamp(result.timestamp),
      result.sourceLanguage,
      escapeCSV(result.originalText),
      result.targetLanguage,
      escapeCSV(result.translatedText),
      result.confidence ? result.confidence.toFixed(2) : 'N/A'
    ].join(',');
  }).join('\n');
  
  return header + rows;
};

/**
 * Export translation session to JSON format
 */
export const exportToJSON = (session: TranslationSession): string => {
  return JSON.stringify(session, null, 2);
};

/**
 * Generate a file download for the specified content
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export translation session to a file
 */
export const exportSession = (session: TranslationSession, format: 'txt' | 'csv' | 'json'): void => {
  if (!session) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let content: string;
  let filename: string;
  let mimeType: string;
  
  switch (format) {
    case 'txt':
      content = exportToText(session);
      filename = `translation-${timestamp}.txt`;
      mimeType = 'text/plain';
      break;
    case 'csv':
      content = exportToCSV(session);
      filename = `translation-${timestamp}.csv`;
      mimeType = 'text/csv';
      break;
    case 'json':
      content = exportToJSON(session);
      filename = `translation-${timestamp}.json`;
      mimeType = 'application/json';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
  
  downloadFile(content, filename, mimeType);
}; 