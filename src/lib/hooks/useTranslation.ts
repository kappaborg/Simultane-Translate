import { getLocalizedString, LocalizationKey, localizations } from '@/lib/data/localization';
import { useCallback, useEffect, useState } from 'react';

// Check if code is running on client side
const isClient = typeof window !== 'undefined';

// Helper to get default locale from browser or localStorage
const getDefaultLocale = (): string => {
  if (!isClient) return 'en';
  
  // First try to get from localStorage
  const savedLocale = localStorage.getItem('app_locale');
  if (savedLocale && localizations[savedLocale]) {
    return savedLocale;
  }
  
  // Then try to get from browser settings
  const browserLocale = navigator.language.split('-')[0];
  if (localizations[browserLocale]) {
    return browserLocale;
  }
  
  // Default to English
  return 'en';
};

export function useTranslation() {
  const [locale, setLocale] = useState<string>(isClient ? getDefaultLocale() : 'en');
  
  // Initialize locale on client-side
  useEffect(() => {
    if (isClient) {
      setLocale(getDefaultLocale());
    }
  }, []);
  
  // Save locale preference when it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('app_locale', locale);
    }
  }, [locale]);
  
  // Translation function
  const t = useCallback(
    (key: LocalizationKey, fallback?: string, ...args: string[]) => {
      return getLocalizedString(key, locale, ...args) || fallback || key;
    },
    [locale]
  );
  
  // Change language function
  const changeLanguage = useCallback((newLocale: string) => {
    if (localizations[newLocale]) {
      setLocale(newLocale);
    } else {
      console.warn(`Locale "${newLocale}" is not supported`);
    }
  }, []);
  
  // Get list of available languages
  const getAvailableLanguages = useCallback(() => {
    return Object.keys(localizations).map(code => ({
      code,
      name: localizations[code].app_title || code
    }));
  }, []);
  
  return {
    locale,
    t,
    changeLanguage,
    getAvailableLanguages
  };
}

export default useTranslation; 