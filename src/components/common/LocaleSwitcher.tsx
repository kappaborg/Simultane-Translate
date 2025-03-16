'use client';

import { type LocaleCode, useLocalization } from '@/lib/hooks/useLocalization';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { memo, useEffect, useRef, useState } from 'react';

const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale, availableLocales, isLoaded } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get language display name
  const getLanguageDisplayName = (code: LocaleCode): string => {
    const names: Record<LocaleCode, string> = {
      en: 'English',
      bs: 'Bosanski',
      tr: 'Türkçe'
    };
    return names[code] || code.toUpperCase();
  };
  
  // Get language flag emoji
  const getLanguageFlag = (code: LocaleCode): string => {
    const flags: Record<LocaleCode, string> = {
      en: '🇬🇧',
      bs: '🇧🇦',
      tr: '🇹🇷'
    };
    return flags[code] || '';
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLoaded]);

  // Handle escape key to close dropdown
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, isLoaded]);
  
  // Avoid hydration mismatch
  if (!isLoaded) {
    return <div className="h-10 w-10 sm:w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>;
  }
  
  const handleLocaleChange = (localeCode: LocaleCode) => {
    if (localeCode !== locale) {
      setLocale(localeCode);
      
      // Dil değişikliğini bir özel olay olarak yayınla - tüm bileşenlerin haberdar olmasını sağlar
      if (typeof window !== 'undefined') {
        // localStorage üzerinden de bilgiyi tazelemek için
        localStorage.setItem('app_locale', localeCode);
        
        // Uygulama genelinde bir olay yayınla
        window.dispatchEvent(new CustomEvent('app-locale-changed', {
          detail: { locale: localeCode }
        }));
        
        // Kullanıcı geri bildirimini iyileştirmek için (isteğe bağlı)
        console.log(`Language changed to: ${localeCode}`);
      }
    }
    setIsOpen(false);
  };
  
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Mobile-friendly button */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm 
                  px-2 sm:px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 
                  hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-indigo-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          <span className="mr-1">{getLanguageFlag(locale)}</span>
          <span className="hidden sm:inline">{getLanguageDisplayName(locale)}</span>
        </span>
        <ChevronDownIcon className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      </button>
      
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg 
                    bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="locale-menu"
        >
          <div className="py-1" role="none">
            {availableLocales.map((localeCode) => (
              <button
                key={localeCode}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  locale === localeCode
                    ? 'text-indigo-600 dark:text-indigo-400 bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors`}
                role="menuitem"
                onClick={() => handleLocaleChange(localeCode)}
              >
                <span className="mr-2">{getLanguageFlag(localeCode)}</span>
                <span className="flex-grow text-left">{getLanguageDisplayName(localeCode)}</span>
                {locale === localeCode && <CheckIcon className="h-5 w-5" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(LocaleSwitcher); 