import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalizationKey, getLocalizedString } from '../data/localization';
import { useLocaleStore, type LocaleCode } from '../store/useLocaleStore';

export type { LocaleCode } from '../store/useLocaleStore';

export const useLocalization = () => {
  const { locale, setLocale, availableLocales } = useLocaleStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const announcementRef = useRef<HTMLDivElement | null>(null);
  
  // Client-side initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mark as loaded in client-side
    setIsLoaded(true);
    
    // Browser locale detection happens in store rehydration
  }, []); 
  
  // Accessibility announcement for screen readers
  useEffect(() => {
    // Skip server-side execution
    if (typeof window === 'undefined' || !isLoaded) return;
    
    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [isLoaded]);
  
  // Accessibility announcement for locale changes
  const setLocaleWithAnnouncement = useCallback((newLocale: LocaleCode) => {
    // Don't execute if not mounted (client-side)
    if (typeof window === 'undefined' || !isLoaded) return;
    
    try {
      // Set locale in store
      setLocale(newLocale);
      
      // Dispatch a global event for components to listen for locale changes
      window.dispatchEvent(new CustomEvent('app-locale-changed', {
        detail: { locale: newLocale }
      }));
      
      // Also update localStorage directly to ensure immediate sync
      localStorage.setItem('app_locale', newLocale);
      
      // Remove existing announcement if it exists
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
      }
      
      // Announce locale change for accessibility
      // Create element with aria-live to announce changes
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('class', 'sr-only');
      announcement.textContent = `Language changed to ${newLocale}`;
      document.body.appendChild(announcement);
      
      // Save reference
      announcementRef.current = announcement;
      
      // Remove after announcement is likely done
      setTimeout(() => {
        if (announcementRef.current && document.body.contains(announcementRef.current)) {
          document.body.removeChild(announcementRef.current);
          announcementRef.current = null;
        }
      }, 3000);
    } catch (error) {
      console.error('Error setting locale:', error);
    }
  }, [isLoaded, setLocale]);
  
  // Get a localized string with the current locale
  const t = useCallback((key: LocalizationKey, ...args: string[]) => {
    return getLocalizedString(key, locale, ...args);
  }, [locale]);
  
  return {
    locale,
    setLocale: setLocaleWithAnnouncement,
    t,
    availableLocales,
    isLoaded
  };
};

export default useLocalization; 