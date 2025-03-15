import LanguageSelector from '@/components/translation/LanguageSelector';
import Button from '@/components/ui/Button';
import { useTranslationStore } from '@/lib/store/useTranslationStore';
import { Switch } from '@headlessui/react';
import { useState } from 'react';

export default function SettingsPanel() {
  const { preferences, updatePreferences, clearHistory } = useTranslationStore();
  
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(preferences.autoDetectLanguage);
  const [saveHistory, setSaveHistory] = useState(preferences.saveHistory);
  const [voiceSpeed, setVoiceSpeed] = useState(preferences.voiceSpeed);
  const [theme, setTheme] = useState(preferences.theme);
  
  const handleAutoDetectChange = (checked: boolean) => {
    setAutoDetectLanguage(checked);
    updatePreferences({ autoDetectLanguage: checked });
  };
  
  const handleSaveHistoryChange = (checked: boolean) => {
    setSaveHistory(checked);
    updatePreferences({ saveHistory: checked });
  };
  
  const handleVoiceSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVoiceSpeed(value);
    updatePreferences({ voiceSpeed: value });
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'light' | 'dark' | 'system';
    setTheme(value);
    updatePreferences({ theme: value });
  };
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all translation history?')) {
      clearHistory();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Language Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <LanguageSelector
              label="Default Source Language"
              value={preferences.defaultSourceLanguage}
              onChange={(value) => updatePreferences({ defaultSourceLanguage: value })}
            />
            
            <LanguageSelector
              label="Default Target Language"
              value={preferences.defaultTargetLanguage}
              onChange={(value) => updatePreferences({ defaultTargetLanguage: value })}
            />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700 dark:text-gray-300">Auto-detect language</span>
            <Switch
              checked={autoDetectLanguage}
              onChange={handleAutoDetectChange}
              className={`${
                autoDetectLanguage ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  autoDetectLanguage ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Voice & Audio
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Voice Speed: {voiceSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSpeed}
              onChange={handleVoiceSpeedChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1x</span>
              <span>1.5x</span>
              <span>2x</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme
            </label>
            <select
              value={theme}
              onChange={handleThemeChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            History & Data
          </h3>
          
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700 dark:text-gray-300">Save translation history</span>
            <Switch
              checked={saveHistory}
              onChange={handleSaveHistoryChange}
              className={`${
                saveHistory ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  saveHistory ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={handleClearHistory}
              variant="danger"
            >
              Clear Translation History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 