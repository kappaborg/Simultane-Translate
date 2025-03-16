'use client';

import {
    formatTimeRemaining,
    getRemainingCooldown
} from '@/lib/api/rateLimitManager';
import translationCache from '@/lib/cache/translationCache';
import { useLocalization } from '@/lib/hooks/useLocalization';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { track } from '@vercel/analytics';
import { useEffect, useState } from 'react';

export const ApiLimitManager: React.FC = () => {
  const { t: translationT, locale: translationLocale } = useTranslation();
  const { t: localizationT, locale: localizationLocale } = useLocalization();
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [cacheStats, setCacheStats] = useState({ size: 0, maxSize: 500, hitRate: 0 });
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  // En son durumu almak ve localeyi belirlemek için yardımcı fonksiyonlar
  const t = (key: any, ...args: string[]) => {
    // Her iki çeviri fonksiyonunu da dene
    return localizationT(key, ...args) || translationT(key, ...args) || key;
  };
  
  const locale = localizationLocale || translationLocale || 'en';

  // API durumunu ve önbellek istatistiklerini düzenli kontrol et
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // İlk yükleme
    setCooldownTime(getRemainingCooldown());
    
    // Cache bilgilerini al
    const updateCacheStats = async () => {
      try {
        const stats = await translationCache.getStats();
        setCacheStats({
          size: stats.size,
          maxSize: 500,
          hitRate: stats.hits / (stats.hits + stats.misses + 0.0001) // Sıfıra bölme hatasını önle
        });
      } catch (error) {
        console.error('Cache stats error:', error);
      }
    };
    
    updateCacheStats();
    setIsEnabled(true);
    
    // 1 saniyede bir kontrol et
    const interval = setInterval(() => {
      setCooldownTime(getRemainingCooldown());
      updateCacheStats();
    }, 1000);
    
    // Vercel Analytics'e bileşen görüntüleme olayı gönder
    track('API Limit Manager Viewed', {
      cooldownActive: getRemainingCooldown() > 0
    });
    
    return () => clearInterval(interval);
  }, []);

  // Bekleme süresi varsa ve görüntülenebilir durumdaysa göster
  if (!isEnabled || cooldownTime <= 0) {
    return null;
  }

  // Önbelleği temizleme işlevi
  const handleClearCache = async () => {
    try {
      await translationCache.clear();
      
      // İstatistikleri güncelle
      const stats = await translationCache.getStats();
      setCacheStats({
        size: stats.size,
        maxSize: 500,
        hitRate: 0
      });
      
      // Analitik izleme
      track('Translation Cache Cleared', {
        previousSize: cacheStats.size
      });
    } catch (error) {
      console.error('Cache clearing error:', error);
    }
  };

  return (
    <div className="rate-limit-helper bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {t('rate_limit_helper_title')}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        {t('rate_limit_helper_desc')}
      </p>
      
      {cooldownTime > 0 && (
        <div className="cooldown-timer bg-white dark:bg-gray-700 rounded-md p-3 my-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('rate_limit_helper_cooldown')}
          </h4>
          <div className="time-display text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatTimeRemaining(cooldownTime)}
          </div>
        </div>
      )}
      
      <div className="usage-graph">
        <div className="usage-bar">
          <div 
            className="usage-fill bg-indigo-500" 
            style={{ width: `${(cacheStats.size / Math.max(cacheStats.maxSize, 1)) * 100}%` }}
          />
        </div>
        <div className="usage-info text-xs text-gray-500 dark:text-gray-400">
          {t('daily_api_usage')}: {cacheStats.size}/{cacheStats.maxSize}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('rate_limit_helper_recommendations')}
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc ml-5 space-y-1">
          <li>{t('rate_limit_helper_rec1')}</li>
          <li>{t('rate_limit_helper_rec2')}</li>
          <li>{t('rate_limit_helper_rec3')}</li>
          <li>{t('rate_limit_helper_rec4')}</li>
        </ul>
      </div>
      
      <div className="mt-4 text-right">
        <button 
          className="clear-cache-button text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          onClick={handleClearCache}
        >
          {t('clear_cache')}
        </button>
      </div>
    </div>
  );
}; 