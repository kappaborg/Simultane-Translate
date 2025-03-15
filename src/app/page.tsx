'use client';

import LocaleSwitcher from '@/components/common/LocaleSwitcher';
import ThemeToggle from '@/components/common/ThemeToggle';
import HistoryPanel from '@/components/translation/HistoryPanel';
import SettingsPanel from '@/components/translation/SettingsPanel';
import TranslationPanel from '@/components/translation/TranslationPanel';
import { useLocalization } from '@/lib/hooks/useLocalization';
import { ClockIcon, Cog6ToothIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type TabType = 'translate' | 'history' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('translate');
  const { t, isLoaded } = useLocalization();
  
  // Listen for locale changes to force rerender
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleLocaleChange = () => {
      // Force rerender without causing hydration issues
      setActiveTab(current => current);
    };
    
    window.addEventListener('localeChange', handleLocaleChange);
    return () => window.removeEventListener('localeChange', handleLocaleChange);
  }, []);
  
  // Show loading state if locale is not loaded yet (client-side only)
  if (!isLoaded) {
    return (
      <main className="container mx-auto px-4 py-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-64 mx-auto mb-4 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 max-w-md mx-auto rounded"></div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-4 sm:py-8 min-h-screen flex flex-col">
      <header className="mb-4 sm:mb-8 text-center relative">
        <div className="absolute right-0 top-0 flex items-center space-x-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          {t('app_title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('app_description')}
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto w-full flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 sm:mb-6">
          <nav className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('translate')}
              className={`flex items-center px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium ${
                activeTab === 'translate'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MicrophoneIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{t('translate')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{t('history')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{t('settings')}</span>
            </button>
          </nav>
        </div>
        
        <div className="mb-4 sm:mb-8 flex-grow">
          {activeTab === 'translate' && <TranslationPanel />}
          {activeTab === 'history' && <HistoryPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
        
        <footer className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-6 sm:mt-12">
          <p>© {new Date().getFullYear()} Simultane Translation. All rights reserved.</p>
          <p className="mt-1">
            Powered by advanced AI translation technology.
          </p>
          <div className="mt-2 sm:mt-4 flex justify-center items-center space-x-4">
            <p className="font-medium">Developed by <span className="text-indigo-600 dark:text-indigo-400">kappasutra</span></p>
            <div className="flex space-x-3">
              <a 
                href="https://github.com/kappaborg" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub Profile"
                className="text-gray-600 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/kappasutra/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram Profile"
                className="text-gray-600 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-2">
            <a 
              href="https://bosnian-translation.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition"
            >
              Visit our main project: Bosnian Translation
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
