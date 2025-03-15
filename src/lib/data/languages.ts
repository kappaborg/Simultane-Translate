import { SupportedLanguage } from '@/types';

/**
 * List of supported languages for translation
 */
export const supportedLanguages: SupportedLanguage[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'български' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' }
];

/**
 * Get a language by its ISO 639-1 code
 */
export const getLanguageByCode = (code: string): SupportedLanguage | undefined => {
  return supportedLanguages.find(lang => lang.code === code);
};

/**
 * Get language name by code
 */
export const getLanguageName = (code: string, useNative: boolean = false): string => {
  const language = getLanguageByCode(code);
  
  if (!language) {
    return code;
  }
  
  return useNative ? language.nativeName : language.name;
};

/**
 * Get common language pairs
 */
export const getCommonLanguagePairs = (): Array<[string, string]> => {
  return [
    ['en', 'fr'],
    ['en', 'es'],
    ['en', 'de'],
    ['en', 'zh'],
    ['en', 'ja'],
    ['en', 'ru'],
    ['en', 'bs'],  // English to Bosnian
    ['bs', 'en'],  // Bosnian to English
    ['bs', 'de'],  // Bosnian to German
    ['bs', 'tr'],  // Bosnian to Turkish
    ['fr', 'en'],
    ['es', 'en'],
    ['de', 'en'],
    ['zh', 'en'],
    ['ja', 'en'],
    ['ru', 'en']
  ];
};

/**
 * Get a list of recently used languages from local storage
 */
export const getRecentLanguages = (max: number = 5): string[] => {
  try {
    const stored = localStorage.getItem('recent_languages');
    return stored ? JSON.parse(stored).slice(0, max) : [];
  } catch (error) {
    console.error('Failed to get recent languages:', error);
    return [];
  }
};

/**
 * Add a language to the recently used list
 */
export const addRecentLanguage = (code: string): void => {
  try {
    const recentLanguages = getRecentLanguages();
    
    // Remove if exists (to put it at the beginning)
    const filtered = recentLanguages.filter(lang => lang !== code);
    
    // Add to beginning of array
    filtered.unshift(code);
    
    // Store max 10 languages
    localStorage.setItem('recent_languages', JSON.stringify(filtered.slice(0, 10)));
  } catch (error) {
    console.error('Failed to add recent language:', error);
  }
};

/**
 * Map of language codes to names for direct consumption
 */
const SupportedLanguages: Record<string, string> = 
  supportedLanguages.reduce((acc, lang) => {
    acc[lang.code] = lang.name;
    return acc;
  }, {} as Record<string, string>);

export default SupportedLanguages; 