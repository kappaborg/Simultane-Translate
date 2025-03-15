'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { memo, useEffect, useState } from 'react';

// Tema veri modeli
type Theme = 'dark' | 'light';

// Mevcut temanın ne olduğunu belirle
const getSystemTheme = (): Theme => {
  // Tarayıcıda olduğundan emin ol
  if (typeof window === 'undefined') return 'light';
  
  // Kaydedilmiş temayı kontrol et
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  
  // Eğer var ise, kaydedilmiş temayı kullan
  if (savedTheme) return savedTheme;
  
  // Yoksa, sistem tercihini kontrol et
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Tema değiştiğinde DOM'u güncelle
const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Temayı kaydet
  localStorage.setItem('theme', theme);
};

const ThemeToggle: React.FC = () => {
  // Tema ve mounting state'i
  const [theme, setTheme] = useState<Theme | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // İlk yükleme - sadece client tarafında
  useEffect(() => {
    setMounted(true);
    const currentTheme = getSystemTheme();
    setTheme(currentTheme);
  }, []);
  
  // Tema değiştiğinde DOM'u güncelle
  useEffect(() => {
    if (!mounted || theme === null) return;
    applyTheme(theme);
  }, [theme, mounted]);
  
  // Tema değiştirme işlevi
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Hydration için erken dönüş
  if (!mounted || theme === null) {
    return (
      <button aria-hidden className="p-2 rounded-full bg-gray-200 w-9 h-9" />
    );
  }
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-gray-700" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-300" />
      )}
    </button>
  );
};

export default memo(ThemeToggle); 