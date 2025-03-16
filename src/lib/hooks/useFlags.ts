import { track } from '@vercel/analytics';
import { useMemo } from 'react';

// Feature Flag türleri
export type FeatureFlag = 
  | 'progressive-translation'
  | 'smart-cooldown'
  | 'batch-translation'
  | 'aggressive-caching';

// Flag değerlerini tutan bir tür
export type FeatureFlagValues = {
  [flag in FeatureFlag]?: boolean;
};

// Global APP_FLAGS tipi tanımlaması
declare global {
  interface Window {
    APP_FLAGS?: Record<string, boolean>;
  }
}

// Flag değerlerini önbellekte tut
const cachedFlags: FeatureFlagValues = {};

// Flag değerini getir
const getFlag = (flagName: string): boolean => {
  if (typeof window === 'undefined' || !window.APP_FLAGS) {
    return true; // Varsayılan olarak aktif
  }
  
  return window.APP_FLAGS[flagName] !== false; // undefined ise true döndür
};

// Feature Flag değerlerini al
export const useFlags = (flagNames: FeatureFlag[]): FeatureFlagValues => {
  // Server-side rendering için güvenli bir değer döndür
  if (typeof window === 'undefined') {
    return flagNames.reduce((acc, flagName) => {
      acc[flagName] = true; // Varsayılan olarak hepsi açık
      return acc;
    }, {} as FeatureFlagValues);
  }
  
  // Client-side rendering'de flag değerlerini al ve önbellekle
  const flags = useMemo(() => {
    const result: FeatureFlagValues = {};
    
    flagNames.forEach(flagName => {
      try {
        // Daha önce sorgulanmışsa, önbellekten al
        if (cachedFlags[flagName] !== undefined) {
          result[flagName] = cachedFlags[flagName];
          return;
        }
        
        // Sorgulanmamışsa, flag değerini al ve önbellekle
        const flagValue = getFlag(flagName);
        result[flagName] = flagValue;
        cachedFlags[flagName] = flagValue;
        
        // Talep edilen featureları analitikle izle
        track('Feature Flag Requested', {
          flagName,
          value: flagValue
        });
      } catch (error) {
        // Hata durumunda varsayılan değer olarak true kullan
        console.warn(`Error getting feature flag ${flagName}:`, error);
        result[flagName] = true;
        cachedFlags[flagName] = true;
      }
    });
    
    return result;
  }, [flagNames]);
  
  return flags;
};

// Flag değerlerini varsayılan değerlerle yükle
export const initializeFlags = () => {
  try {
    if (typeof window !== 'undefined') {
      window.APP_FLAGS = {
        'progressive-translation': true,
        'smart-cooldown': true,
        'batch-translation': true,
        'aggressive-caching': true
      };
    }
    
    console.log('✅ Feature Flags initialized');
  } catch (error) {
    console.error('Failed to initialize Feature Flags:', error);
  }
}; 