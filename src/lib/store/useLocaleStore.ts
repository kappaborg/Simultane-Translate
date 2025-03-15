import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localizations } from '../data/localization';

export type LocaleCode = keyof typeof localizations;

interface LocaleState {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  availableLocales: LocaleCode[];
}

const DEFAULT_LOCALE: LocaleCode = 'en';

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (newLocale: LocaleCode) => {
        set({ locale: newLocale });
        
        // Update html lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = newLocale;
          // Dispatch event for components that need to react to locale changes
          window.dispatchEvent(new CustomEvent('localeChange', { detail: { locale: newLocale } }));
        }
      },
      availableLocales: Object.keys(localizations) as LocaleCode[],
    }),
    {
      name: 'locale-storage',
      // sadece locale değerini localStorage'da sakla
      partialize: (state) => ({ locale: state.locale }),
      // Browser environment check
      skipHydration: true,
      onRehydrateStorage: () => {
        // Optional callback when storage is rehydrated
        return (state) => {
          if (state && typeof document !== 'undefined') {
            document.documentElement.lang = state.locale;
          }
        };
      },
    }
  )
); 