export interface Language {
  code: string;
  name: string;
  flag?: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
  timestamp: number;
}

export interface TranslationSession {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  startTime: number;
  endTime?: number;
  translations: TranslationResult[];
}

export interface UserPreferences {
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  voiceSpeed: number;
  autoDetectLanguage: boolean;
  saveHistory: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export type SupportedLanguage = {
  code: string;
  name: string;
  nativeName: string;
};

export type TranslationResult = {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
  confidence?: number;
  duration?: number;
};

export type TranslationSession = {
  id: string;
  startTime: number;
  endTime?: number;
  sourceLanguage: string;
  targetLanguage: string;
  translations: TranslationResult[];
};

export type RecordingState = 'inactive' | 'recording' | 'paused';

export type AudioChunk = {
  blob: Blob;
  duration: number;
  timestamp: number;
};

export type TranslationMode = 'basic' | 'advanced';

export type TranslationSettings = {
  mode: TranslationMode;
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  autoDetectLanguage: boolean;
  preferHighAccuracy: boolean;
  saveHistory: boolean;
};

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  translation: TranslationSettings;
}; 