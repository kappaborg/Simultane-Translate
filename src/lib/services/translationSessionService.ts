import { TranslationResult, TranslationSession } from '@/types';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'translation_sessions';

/**
 * Service for managing translation sessions and history
 */
class TranslationSessionService {
  /**
   * Create a new translation session
   */
  createSession(sourceLanguage: string, targetLanguage: string): TranslationSession {
    const session: TranslationSession = {
      id: generateId(),
      startTime: Date.now(),
      sourceLanguage,
      targetLanguage,
      translations: []
    };
    
    return session;
  }
  
  /**
   * End an active translation session
   */
  endSession(session: TranslationSession): TranslationSession {
    const updatedSession = {
      ...session,
      endTime: Date.now()
    };
    
    this.saveSession(updatedSession);
    return updatedSession;
  }
  
  /**
   * Add a translation result to a session
   */
  addTranslation(
    session: TranslationSession, 
    result: Omit<TranslationResult, 'id' | 'timestamp'>
  ): TranslationSession {
    const translationResult: TranslationResult = {
      ...result,
      id: generateId(),
      timestamp: Date.now()
    };
    
    const updatedSession = {
      ...session,
      translations: [...session.translations, translationResult]
    };
    
    return updatedSession;
  }
  
  /**
   * Save a session to storage
   */
  saveSession(session: TranslationSession): void {
    try {
      // Get existing sessions
      const sessions = this.getAllSessions();
      
      // Update or add the session
      const updatedSessions = sessions.filter(s => s.id !== session.id);
      updatedSessions.push(session);
      
      // Save back to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save translation session:', error);
    }
  }
  
  /**
   * Get all saved sessions
   */
  getAllSessions(): TranslationSession[] {
    try {
      const sessionsJson = localStorage.getItem(STORAGE_KEY);
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Failed to retrieve translation sessions:', error);
      return [];
    }
  }
  
  /**
   * Get a specific session by ID
   */
  getSessionById(sessionId: string): TranslationSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }
  
  /**
   * Delete a session by ID
   */
  deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      
      // If no sessions were removed, return false
      if (sessions.length === updatedSessions.length) {
        return false;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      return true;
    } catch (error) {
      console.error('Failed to delete translation session:', error);
      return false;
    }
  }
  
  /**
   * Clear all sessions from storage
   */
  clearAllSessions(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear translation sessions:', error);
      return false;
    }
  }
  
  /**
   * Get recent sessions (limited by count)
   */
  getRecentSessions(count: number = 10): TranslationSession[] {
    const sessions = this.getAllSessions();
    
    // Sort by start time, most recent first
    return sessions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, count);
  }
}

// Export as singleton
export const translationSessionService = new TranslationSessionService(); 