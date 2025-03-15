export interface Language {
  code: string;
  name: string;
  flag?: string;
}

// Web Speech API için gerekli türler
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Not: Web Speech API tipleri tarayıcıda tanımlı olduğu için bu tipleri yorum satırı haline getiriyoruz
// ve kullanım yerlerinde 'as any' ile tip dönüşümü yapıyoruz
// export interface SpeechRecognition extends EventTarget { ... }
// export interface SpeechRecognitionErrorEvent extends Event { ... }

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

// useTranslationStore tarafından kullanılan ve SettingsPanel tarafından beklenen UserPreferences yapısı
export interface UserPreferences {
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  voiceSpeed: number;
  autoDetectLanguage: boolean;
  saveHistory: boolean;
  theme: 'light' | 'dark' | 'system';
}; 