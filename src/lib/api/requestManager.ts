import { throttle } from 'lodash';
import translationCache from '../cache/translationCache';
import { canMakeAPIRequest, reportAPIRequestError, reportAPIRequestSuccess } from './rateLimitManager';

// İstek kuyruğu
const requestQueue: Array<{
  text: string;
  sourceLang: string;
  targetLang: string;
  resolve: (result: { text: string; confidence?: number }) => void;
  reject: (error: Error) => void;
}> = [];

// İstek batch size'ı - API'ye bir kerede kaç istek gönderileceği
const BATCH_SIZE = 5;

// Minimum istek aralığı (ms)
const THROTTLE_INTERVAL = 1000; 

// Throttled process function
const processQueue = throttle(async () => {
  if (requestQueue.length === 0) return;
  
  // API istekleri yapılabilir mi kontrol et
  if (!canMakeAPIRequest()) {
    // Tüm istekleri reddet
    const error = new Error('API rate limit exceeded. Please try again later.');
    requestQueue.forEach(item => item.reject(error));
    requestQueue.length = 0;
    return;
  }
  
  // Kuyruktan işlenecek istekleri al (en fazla BATCH_SIZE kadar)
  const batch = requestQueue.splice(0, Math.min(BATCH_SIZE, requestQueue.length));
  
  try {
    // Batch işlemi için tekil API isteği
    const results = await apiTranslateBatch(batch.map(item => ({
      text: item.text,
      sourceLang: item.sourceLang,
      targetLang: item.targetLang
    })));
    
    // Başarılı API isteği rapor et
    reportAPIRequestSuccess();
    
    // Sonuçları işle ve promise'leri çöz
    results.forEach((result, index) => {
      const item = batch[index];
      
      // Çeviriyi önbelleğe ekle
      try {
        translationCache.set(
          item.text,
          result.text,
          item.sourceLang,
          item.targetLang,
          result.confidence
        );
      } catch (error) {
        console.warn('Çeviri önbelleğe kaydedilemedi:', error);
      }
      
      // Promise'i çöz
      item.resolve(result);
    });
  } catch (error) {
    // API hatasını rapor et
    if (error instanceof Error) {
      reportAPIRequestError(
        error instanceof Response ? error.status : 500,
        error.message
      );
    }
    
    // Tüm batch isteklerini hata ile işaretle
    batch.forEach(item => item.reject(error as Error));
  }
  
  // Kuyrukta daha fazla istek varsa, tekrar işlem başlat
  if (requestQueue.length > 0) {
    processQueue();
  }
}, THROTTLE_INTERVAL);

export const translateText = (text: string, sourceLang: string, targetLang: string): Promise<{ text: string; confidence?: number }> => {
  // Metinde içerik yoksa boş sonuç döndür
  if (!text || text.trim() === '') {
    return Promise.resolve({ text: '' });
  }
  
  // Önce cache'de kontrol et
  return new Promise(async (resolve, reject) => {
    try {
      const cached = await translationCache.get(text, sourceLang, targetLang);
      
      if (cached) {
        return resolve({ 
          text: cached.translatedText,
          confidence: cached.confidence 
        });
      }
      
      // Cache'de yoksa, yeni istek oluştur
      requestQueue.push({
        text,
        sourceLang,
        targetLang,
        resolve,
        reject
      });
      
      // Kuyruğu işle
      processQueue();
    } catch (error) {
      console.error('Çeviri hatası:', error);
      reject(error);
    }
  });
};

// Bireysel metin çevirisi yap
export const translateSingleText = async (text: string, sourceLang: string, targetLang: string): Promise<{ text: string; confidence?: number }> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

// API batch isteği gönder
const apiTranslateBatch = async (requests: { text: string; sourceLang: string; targetLang: string }[]): Promise<Array<{ text: string; confidence?: number }>> => {
  // API'ye toplu istek gönder
  try {
    const response = await fetch('/api/translate-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Batch translation error:', error);
    throw error;
  }
}; 