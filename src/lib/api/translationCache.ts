/**
 * Çeviri önbellek yöneticisi
 * LRU önbellek kullanarak yapılan çevirileri depolar
 */

// Local storage helpers
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

// Çeviri önbellek anahtarı
const TRANSLATION_CACHE_KEY = 'translation_cache';
const TRANSLATION_CACHE_METADATA_KEY = 'translation_cache_metadata';

// Çeviri verilerini tutan arayüz
interface TranslationCacheItem {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence?: number;
  timestamp: number;
}

// Önbellek meta verileri
interface TranslationCacheMetadata {
  hits: number;
  misses: number;
  lastCleanup: number;
  size: number;
}

// Önbellek boyutu (maksimum öğe sayısı)
const MAX_CACHE_SIZE = 500;

// Önbellekten bir çeviriyi al
export const get = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationCacheItem | null> => {
  try {
    const cache = await getCache();
    const cacheKey = generateCacheKey(text, sourceLang, targetLang);
    
    const cacheItem = cache[cacheKey];
    
    if (cacheItem) {
      // Önbellek istatistiklerini güncelle
      updateMetadata({ hits: 1 });
      return cacheItem;
    }
    
    // Çeviri bulunamadı
    updateMetadata({ misses: 1 });
    return null;
  } catch (error) {
    console.error('Önbellek okuma hatası:', error);
    return null;
  }
};

// Önbelleğe bir çeviriyi ekle
export const set = async (
  sourceText: string,
  translatedText: string,
  sourceLang: string,
  targetLang: string,
  confidence?: number
): Promise<void> => {
  try {
    const cache = await getCache();
    const cacheKey = generateCacheKey(sourceText, sourceLang, targetLang);
    
    // Yeni öğeyi ekle
    cache[cacheKey] = {
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      confidence,
      timestamp: Date.now()
    };
    
    // Önbelleği kaydet
    await saveCache(cache);
    
    // Meta verileri güncelle
    updateMetadata({ size: Object.keys(cache).length });
  } catch (error) {
    console.error('Önbellek yazma hatası:', error);
  }
};

// Önbelleği temizle
export const clear = async (): Promise<void> => {
  try {
    await saveCache({});
    
    // Meta verileri sıfırla
    await setLocalStorageItem(TRANSLATION_CACHE_METADATA_KEY, JSON.stringify({
      hits: 0,
      misses: 0,
      lastCleanup: Date.now(),
      size: 0
    }));
  } catch (error) {
    console.error('Önbellek temizleme hatası:', error);
  }
};

// Süresi geçmiş çevirileri temizle (30 günden eski)
export const cleanExpired = async (): Promise<void> => {
  try {
    const cache = await getCache();
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    let cleanedCount = 0;
    
    // Süresi geçen öğeleri kaldır
    for (const key in cache) {
      if (cache[key].timestamp < thirtyDaysAgo) {
        delete cache[key];
        cleanedCount++;
      }
    }
    
    // Önbellek boyutunu kontrol et
    if (Object.keys(cache).length > MAX_CACHE_SIZE) {
      // Boyutu aşıyorsa, en eski öğeleri kaldır
      const items = Object.entries(cache).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      );
      
      // En eski öğeleri kaldır
      const toRemove = items.slice(0, items.length - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => {
        delete cache[key];
        cleanedCount++;
      });
    }
    
    // Değişiklikler varsa kaydet
    if (cleanedCount > 0) {
      await saveCache(cache);
      
      // Meta verileri güncelle
      updateMetadata({ 
        lastCleanup: now,
        size: Object.keys(cache).length
      });
    }
  } catch (error) {
    console.error('Önbellek temizleme hatası:', error);
  }
};

// Önbellek istatistiklerini al
export const getStats = async (): Promise<TranslationCacheMetadata> => {
  try {
    const metadataStr = getLocalStorageItem(TRANSLATION_CACHE_METADATA_KEY);
    
    if (!metadataStr) {
      return {
        hits: 0,
        misses: 0,
        lastCleanup: 0,
        size: 0
      };
    }
    
    return JSON.parse(metadataStr);
  } catch (error) {
    console.error('Önbellek meta veri okuma hatası:', error);
    return {
      hits: 0,
      misses: 0,
      lastCleanup: 0,
      size: 0
    };
  }
};

// Önbelleği al
const getCache = async (): Promise<Record<string, TranslationCacheItem>> => {
  try {
    const cacheStr = getLocalStorageItem(TRANSLATION_CACHE_KEY);
    
    if (!cacheStr) {
      return {};
    }
    
    return JSON.parse(cacheStr);
  } catch (error) {
    console.error('Önbellek okuma hatası:', error);
    return {};
  }
};

// Önbelleği kaydet
const saveCache = async (cache: Record<string, TranslationCacheItem>): Promise<void> => {
  try {
    setLocalStorageItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Önbellek yazma hatası:', error);
  }
};

// Meta verileri güncelle
const updateMetadata = async (updates: Partial<TranslationCacheMetadata>): Promise<void> => {
  try {
    const currentMetadata = await getStats();
    const updatedMetadata = {
      ...currentMetadata,
      hits: updates.hits ? currentMetadata.hits + updates.hits : currentMetadata.hits,
      misses: updates.misses ? currentMetadata.misses + updates.misses : currentMetadata.misses,
      lastCleanup: updates.lastCleanup || currentMetadata.lastCleanup,
      size: updates.size !== undefined ? updates.size : currentMetadata.size
    };
    
    setLocalStorageItem(TRANSLATION_CACHE_METADATA_KEY, JSON.stringify(updatedMetadata));
  } catch (error) {
    console.error('Önbellek meta veri güncelleme hatası:', error);
  }
};

// Önbellek anahtarı oluştur
const generateCacheKey = (text: string, sourceLang: string, targetLang: string): string => {
  // Basit bir temizleme işlemi yapalım
  const cleanText = text.trim().toLowerCase().slice(0, 500);
  return `${sourceLang}:${targetLang}:${cleanText}`;
};

// Dışa aktarılacak API
const translationCache = {
  get,
  set,
  clear,
  cleanExpired,
  getStats
};

export default translationCache; 