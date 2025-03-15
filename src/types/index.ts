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

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
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