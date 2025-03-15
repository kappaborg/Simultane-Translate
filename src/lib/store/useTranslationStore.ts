import { generateId } from '@/lib/utils/helpers';
import { TranslationResult, TranslationSession, UserPreferences } from '@/types';
import { create } from 'zustand';

interface TranslationState {
  // Current session
  currentSession: TranslationSession | null;
  isRecording: boolean;
  isTranslating: boolean;
  currentTranscript: string;
  
  // User preferences
  preferences: UserPreferences;
  
  // History
  sessions: TranslationSession[];
  
  // Actions
  startSession: (sourceLanguage: string, targetLanguage: string) => void;
  endSession: () => void;
  addTranslation: (result: Omit<TranslationResult, 'timestamp'>) => void;
  updateTranscript: (transcript: string) => void;
  setRecording: (isRecording: boolean) => void;
  setTranslating: (isTranslating: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  clearHistory: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSourceLanguage: 'en',
  defaultTargetLanguage: 'tr',
  voiceSpeed: 1,
  autoDetectLanguage: true,
  saveHistory: true,
  theme: 'system',
};

export const useTranslationStore = create<TranslationState>((set) => ({
  // Initial state
  currentSession: null,
  isRecording: false,
  isTranslating: false,
  currentTranscript: '',
  preferences: DEFAULT_PREFERENCES,
  sessions: [],
  
  // Actions
  startSession: (sourceLanguage, targetLanguage) => set((state) => ({
    currentSession: {
      id: generateId(),
      sourceLanguage,
      targetLanguage,
      startTime: Date.now(),
      translations: [],
    },
    isRecording: true,
  })),
  
  endSession: () => set((state) => {
    if (!state.currentSession) return state;
    
    const endedSession = {
      ...state.currentSession,
      endTime: Date.now(),
    };
    
    return {
      currentSession: null,
      isRecording: false,
      isTranslating: false,
      currentTranscript: '',
      sessions: state.preferences.saveHistory 
        ? [...state.sessions, endedSession]
        : state.sessions,
    };
  }),
  
  addTranslation: (result) => set((state) => {
    if (!state.currentSession) return state;
    
    const newTranslation: TranslationResult = {
      ...result,
      timestamp: Date.now(),
    };
    
    return {
      currentSession: {
        ...state.currentSession,
        translations: [...state.currentSession.translations, newTranslation],
      },
    };
  }),
  
  updateTranscript: (transcript) => set({ currentTranscript: transcript }),
  
  setRecording: (isRecording) => set({ isRecording }),
  
  setTranslating: (isTranslating) => set({ isTranslating }),
  
  updatePreferences: (preferences) => set((state) => ({
    preferences: { ...state.preferences, ...preferences },
  })),
  
  clearHistory: () => set({ sessions: [] }),
})); 