// Yerel depolama yardımcı fonksiyonları
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

// API limit bilgisi
export interface APILimitInfo {
  remainingRequests: number;
  resetTime: number;
  lastError?: {
    timestamp: number;
    status: number;
    message: string;
  };
  cooldownStrategy: 'exponential' | 'fixed' | 'smart';
  cooldownMultiplier: number;
  consecutiveErrors: number;
  consecutiveSuccesses: number;
}

// Varsayılan API limit bilgisi
const defaultLimitInfo: APILimitInfo = {
  remainingRequests: 100, // Varsayılan başlangıç limiti
  resetTime: Date.now() + 3600000, // 1 saat sonra
  cooldownStrategy: 'smart',
  cooldownMultiplier: 1,
  consecutiveErrors: 0,
  consecutiveSuccesses: 0
};

// API limit bilgisini al
export const getAPILimitInfo = (): APILimitInfo => {
  const stored = getLocalStorageItem('api_limit_info');
  
  if (!stored) return defaultLimitInfo;
  
  try {
    return JSON.parse(stored);
  } catch {
    return defaultLimitInfo;
  }
};

// API limit bilgisini güncelle
export const updateAPILimitInfo = (updates: Partial<APILimitInfo>): APILimitInfo => {
  const current = getAPILimitInfo();
  const updated = { ...current, ...updates };
  
  setLocalStorageItem('api_limit_info', JSON.stringify(updated));
  
  return updated;
};

// API kullanım izni kontrolü
export const canMakeAPIRequest = (): boolean => {
  const { remainingRequests, resetTime, lastError } = getAPILimitInfo();
  
  // Eğer reset zamanı geçtiyse, limitleri sıfırla
  if (resetTime < Date.now()) {
    updateAPILimitInfo({
      remainingRequests: 100, // Yeniden doldurulan limit
      resetTime: Date.now() + 3600000, // 1 saat sonra
    });
    return true;
  }
  
  // Son hatadan sonra bekleme süresi gerekiyorsa
  if (lastError && lastError.timestamp + calculateCooldown() > Date.now()) {
    return false;
  }
  
  // Kalan istek yoksa
  return remainingRequests > 0;
};

// API isteği başarılı
export const reportAPIRequestSuccess = (): void => {
  const info = getAPILimitInfo();
  
  updateAPILimitInfo({
    remainingRequests: info.remainingRequests - 1,
    consecutiveErrors: 0,
    consecutiveSuccesses: info.consecutiveSuccesses + 1,
    // Başarılı isteklerden sonra cooldown çarpanını azalt
    cooldownMultiplier: Math.max(1, info.cooldownMultiplier * 0.8)
  });
};

// API isteği hatası
export const reportAPIRequestError = (status: number, message: string): void => {
  const info = getAPILimitInfo();
  const now = Date.now();
  
  let resetTime = info.resetTime;
  let strategy = info.cooldownStrategy;
  
  // Eğer 429 (Rate Limit) hatası ise, resetTime'ı güncelle
  if (status === 429) {
    // Mesajdan reset süresini çıkarmaya çalış
    const resetSeconds = extractResetTimeFromMessage(message);
    if (resetSeconds) {
      resetTime = now + (resetSeconds * 1000);
    } else {
      // Tahmini bir değer
      resetTime = now + (60 * 60 * 1000); // 1 saat
    }
    
    // Çok fazla 429 hatası alıyorsak, daha agresif bir strateji kullan
    if (info.consecutiveErrors > 3) {
      strategy = 'exponential';
    }
  }
  
  // Güncelleme yap
  updateAPILimitInfo({
    lastError: {
      timestamp: now,
      status,
      message
    },
    resetTime,
    cooldownStrategy: strategy,
    consecutiveErrors: info.consecutiveErrors + 1,
    consecutiveSuccesses: 0,
    cooldownMultiplier: info.cooldownMultiplier * 1.5 // Exponential backoff
  });
};

// Bekleme süresini hesapla
export const calculateCooldown = (): number => {
  const info = getAPILimitInfo();
  
  // Hiç hata yoksa, bekleme süresi yok
  if (!info.lastError) return 0;
  
  const baseDelay = 1000; // 1 saniye
  
  switch (info.cooldownStrategy) {
    case 'fixed':
      return baseDelay * 60; // 1 dakika
      
    case 'exponential':
      // 2^n şeklinde artan bekleme
      return Math.min(
        baseDelay * Math.pow(2, info.consecutiveErrors) * info.cooldownMultiplier,
        60 * 60 * 1000 // maksimum 1 saat
      );
      
    case 'smart':
    default:
      // Başarı/başarısızlık oranına göre dinamik 
      if (info.consecutiveErrors > 5) {
        return Math.min(
          baseDelay * 30 * info.cooldownMultiplier,
          30 * 60 * 1000 // maksimum 30 dakika
        );
      } else if (info.consecutiveErrors > 2) {
        return baseDelay * 10 * info.cooldownMultiplier; // 10 saniye
      } else {
        return baseDelay * 2 * info.cooldownMultiplier; // 2 saniye
      }
  }
};

// Kalan bekleme süresini al (ms cinsinden)
export const getRemainingCooldown = (): number => {
  const info = getAPILimitInfo();
  
  if (!info.lastError) return 0;
  
  const cooldownEndTime = info.lastError.timestamp + calculateCooldown();
  const remaining = cooldownEndTime - Date.now();
  
  return Math.max(0, remaining);
};

// Hata mesajından reset süresini çıkarmaya çalış
const extractResetTimeFromMessage = (message: string): number | null => {
  const match = message.match(/(\d+)\s*(?:seconds|minutes|hours|secs|mins|hrs)/i);
  
  if (!match) return null;
  
  const value = parseInt(match[1], 10);
  
  if (message.includes('minute') || message.includes('min')) {
    return value * 60; // Dakika -> saniye
  } else if (message.includes('hour') || message.includes('hr')) {
    return value * 60 * 60; // Saat -> saniye
  } else {
    return value; // Saniye
  }
};

// Format milliseconds to readable time string (mm:ss)
export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '00:00';
  
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}; 