import { TranslationResult } from '@/types';

/**
 * Format a timestamp (in milliseconds) to a human-readable date and time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Generate a unique ID (UUID v4)
 */
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Format a duration in milliseconds to MM:SS format
 */
export const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Truncate text with ellipsis if it exceeds a specified length
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Debounce a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Extract domain from an email
 */
export const extractDomainFromEmail = (email: string): string => {
  const match = email.match(/@([^@]+)$/);
  return match ? match[1] : '';
};

/**
 * Safely access nested object properties
 */
export function getNestedValue<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? defaultValue : result as T;
}

/**
 * Chunks text into smaller pieces for better translation
 */
export const chunkText = (text: string, maxChunkSize: number = 200): string[] => {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  const words = text.split(' ');

  for (const word of words) {
    if ((currentChunk + ' ' + word).length <= maxChunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

/**
 * Calculates the average confidence score from translation results
 */
export const calculateAverageConfidence = (results: TranslationResult[]): number => {
  const confidenceScores = results
    .filter(result => result.confidence !== undefined)
    .map(result => result.confidence as number);

  if (confidenceScores.length === 0) {
    return 0;
  }

  const sum = confidenceScores.reduce((acc, score) => acc + score, 0);
  return sum / confidenceScores.length;
}; 