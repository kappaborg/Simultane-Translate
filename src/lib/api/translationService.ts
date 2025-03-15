import { optimizeAudioForAPI, splitAudioIntoSegments } from '@/lib/utils/audioUtils';
import { APIKeyRotator, apiUsageTracker, translationCache } from '@/lib/utils/cacheUtils';
import { chunkText } from '@/lib/utils/helpers';
import axios from 'axios';

// API anahtarları
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const MICROSOFT_TRANSLATOR_KEY = process.env.NEXT_PUBLIC_MICROSOFT_TRANSLATOR_KEY || '';
const MICROSOFT_TRANSLATOR_REGION = process.env.NEXT_PUBLIC_MICROSOFT_TRANSLATOR_REGION || 'global';
const LIBRETRANSLATE_API_URL = process.env.NEXT_PUBLIC_LIBRETRANSLATE_API_URL || 'https://libretranslate.com/translate';
const LIBRETRANSLATE_API_KEY = process.env.NEXT_PUBLIC_LIBRETRANSLATE_API_KEY || '';
const TRANSLATION_API_PROVIDER = process.env.NEXT_PUBLIC_TRANSLATION_API_PROVIDER || 'libre';

// Base URLs for APIs
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const MICROSOFT_TRANSLATOR_URL = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0`;

// Demo modu - eğer API anahtarları sağlanmamışsa, simüle edilmiş yanıtlar kullan
const DEMO_MODE = !OPENAI_API_KEY || 
                 (TRANSLATION_API_PROVIDER === 'microsoft' && !MICROSOFT_TRANSLATOR_KEY) || 
                 (TRANSLATION_API_PROVIDER === 'libre' && !LIBRETRANSLATE_API_KEY);

// Diğer sabitler
const MAX_RETRIES = 5;  // Başarısız API istekleri için maksimum yeniden deneme sayısı
const MAX_AUDIO_SIZE_MB = 25;  // OpenAI Whisper API için ses dosyası maksimum boyutu (MB)
const RETRY_DELAY_BASE = 3000; // 3 saniye baz gecikme süresi
const COOLDOWN_PERIOD = 60000; // Rate limit sonrası 60 saniyelik bekleme süresi

// OpenAI API anahtarları - birden fazla anahtar varsa virgülle ayırarak .env dosyasına ekleyin
const OPENAI_API_KEYS = OPENAI_API_KEY.split(',').filter(key => key.trim() !== '');
const openAIKeyRotator = new APIKeyRotator(OPENAI_API_KEYS, 50); // Saatte maks 50 istek

// API İstek hız sınırlama ve durumu takip için değişkenler
const apiRequestStatus = {
  lastRequestTime: 0,
  consecutiveFailures: 0,
  inCooldown: false,
  cooldownEndTime: 0
};

// Rate limit sonrası bekleme süresini ayarla
const setCooldownPeriod = () => {
  apiRequestStatus.inCooldown = true;
  apiRequestStatus.cooldownEndTime = Date.now() + COOLDOWN_PERIOD;
  console.log(`API rate limit aşıldı. ${COOLDOWN_PERIOD/1000} saniye bekleme moduna geçildi.`);
  
  // Belirli bir süre sonra cooldown'ı kaldır
  setTimeout(() => {
    apiRequestStatus.inCooldown = false;
    apiRequestStatus.consecutiveFailures = 0;
    console.log('API cooldown süresi tamamlandı, istekler tekrar kabul ediliyor.');
  }, COOLDOWN_PERIOD);
};

// API request wrapper with rate limiting
const makeApiRequest = async <T>(requestFn: () => Promise<T>, errorMsg: string): Promise<T> => {
  // Cooldown süresi içindeyse hata fırlat
  if (apiRequestStatus.inCooldown) {
    const remainingTime = Math.ceil((apiRequestStatus.cooldownEndTime - Date.now()) / 1000);
    throw new Error(`API istek limiti aşıldı. Lütfen ${remainingTime} saniye daha bekleyin.`);
  }
  
  // İstekler arasında en az 1 saniye olmasını sağla
  const now = Date.now();
  const timeSinceLastRequest = now - apiRequestStatus.lastRequestTime;
  if (apiRequestStatus.lastRequestTime > 0 && timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  
  try {
    // İstek zamanını güncelle
    apiRequestStatus.lastRequestTime = Date.now();
    
    // İsteği gerçekleştir
    const result = await requestFn();
    
    // Başarılı olduğunda hata sayacını sıfırla
    apiRequestStatus.consecutiveFailures = 0;
    
    // API kullanımını takip et
    apiUsageTracker.trackRequest();
    
    return result;
  } catch (error: any) {
    // Rate limit hatasıysa
    if (error.response?.status === 429) {
      apiRequestStatus.consecutiveFailures++;
      
      // Üst üste birden fazla hata varsa cooldown başlat
      if (apiRequestStatus.consecutiveFailures >= 2) {
        setCooldownPeriod();
      }
      
      // Mevcut API anahtarını rotasyona sok
      openAIKeyRotator.rotateKey();
      
      throw new Error('API istek limiti aşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin veya OpenAI API anahtarınızı kontrol edin.');
    }
    
    // Diğer hatalar için
    console.error(errorMsg, error);
    throw error;
  }
};

// API response interfaces
interface OpenAITranscriptionResponse {
  text: string;
}

interface MicrosoftTranslationResponse {
  translations: Array<{
    text: string;
  }>;
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

interface LibreTranslateResponse {
  translatedText: string;
}

interface LibreDetectResponse {
  language: string;
  confidence: number;
}

/**
 * OpenAI Whisper API kullanarak ses dosyasını metne dönüştür
 */
export const transcribeAudio = async (
  audioBlob: Blob,
  language?: string
): Promise<{ text: string; confidence?: number }> => {
  if (DEMO_MODE) {
    // API çağrısı gecikmesini simüle et
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      text: "Bu, API anahtarları yapılandırılmadığı için simüle edilmiş bir transkripsiyondur.",
      confidence: 0.95
    };
  }

  // Dosya boyutu kontrolü
  const fileSizeMB = audioBlob.size / (1024 * 1024);
  if (fileSizeMB > MAX_AUDIO_SIZE_MB) {
    throw new Error(`Ses dosyası çok büyük (${fileSizeMB.toFixed(2)}MB). Maksimum boyut ${MAX_AUDIO_SIZE_MB}MB olmalıdır.`);
  }

  // Çok büyük ses dosyalarını segmentlere böl ve optimize et
  let segments: Blob[] = [];
  let optimizedBlob: Blob;
  
  try {
    // Sesi optimize et (çok büyük ses dosyaları için)
    if (fileSizeMB > 10) {
      // Ses dosyasını parçalara böl
      segments = await splitAudioIntoSegments(audioBlob, 30);
      
      // Her bir parçayı optimize et
      const optimizedSegments = await Promise.all(
        segments.map(segment => optimizeAudioForAPI(segment))
      );
      
      // Eğer sadece bir segment varsa, onu kullan
      if (optimizedSegments.length === 1) {
        optimizedBlob = optimizedSegments[0];
      } else {
        // Birden fazla segment varsa, her biri ayrı ayrı işlenecek
        segments = optimizedSegments;
      }
    } else {
      // Küçük ses dosyaları için doğrudan optimize et
      optimizedBlob = await optimizeAudioForAPI(audioBlob);
    }
  } catch (error) {
    console.warn('Ses optimizasyonu başarısız, orijinal ses kullanılıyor:', error);
    optimizedBlob = audioBlob;
  }

  let lastError;
  
  // Birden fazla segment varsa her birini ayrı ayrı işle ve birleştir
  if (segments.length > 1) {
    try {
      const transcriptionResults = await Promise.all(
        segments.map(async (segment, index) => {
          console.log(`Segment ${index + 1}/${segments.length} işleniyor...`);
          try {
            const result = await processAudioSegment(segment, language);
            return result.text;
          } catch (error) {
            console.error(`Segment ${index + 1} işlenirken hata:`, error);
            throw error;
          }
        })
      );
      
      // Birleştir
      const combinedText = transcriptionResults.join(' ');
      return { text: combinedText, confidence: 0.85 };
    } catch (error) {
      console.error('Segmentlerin işlenmesi sırasında hata:', error);
      lastError = error;
      // Hata aldıysak tek bir bütün olarak deneyelim
      optimizedBlob = await optimizeAudioForAPI(audioBlob);
    }
  }
  
  // Tek bir ses dosyası olarak işle
  return processAudioSegment(optimizedBlob, language);
};

/**
 * Tek bir ses segmentini işle
 */
const processAudioSegment = async (
  audioBlob: Blob, 
  language?: string
): Promise<{ text: string; confidence?: number }> => {
  let lastError;
  
  // Retry mantığı
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // API cooldown kontrolü
      if (apiRequestStatus.inCooldown) {
        const remainingTime = Math.ceil((apiRequestStatus.cooldownEndTime - Date.now()) / 1000);
        throw new Error(`API istek limiti aşıldı. Lütfen ${remainingTime} saniye daha bekleyin.`);
      }
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      if (language) {
        formData.append('language', language);
      }
      
      // API anahtar rotasyonu kullan
      const currentApiKey = openAIKeyRotator.getCurrentKey();
      
      if (!currentApiKey) {
        throw new Error('Geçerli bir OpenAI API anahtarı bulunamadı.');
      }

      // API isteğini wrapper ile yap
      const response = await makeApiRequest(
        () => axios.post<OpenAITranscriptionResponse>(OPENAI_API_URL, formData, {
          headers: {
            'Authorization': `Bearer ${currentApiKey}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 saniye
        }),
        'Transkripsiyon hatası'
      );
      
      // Başarılı API kullanımını işaretle
      openAIKeyRotator.markKeyUsed();

      return { text: response.data.text, confidence: 0.9 };
    } catch (error: any) {
      lastError = error;
      
      // 429 hatası (rate limit) durumunda bekle ve tekrar dene
      if (error.response?.status === 429 && attempt < MAX_RETRIES) {
        // Daha uzun bir exponential backoff kullan - 3, 6, 12, 24, 48 saniye
        const waitTime = RETRY_DELAY_BASE * Math.pow(2, attempt); 
        console.log(`Rate limit aşıldı. ${waitTime}ms bekleyip yeniden deneniyor (${attempt + 1}/${MAX_RETRIES})...`);
        
        // API anahtarını rotasyona sok
        openAIKeyRotator.rotateKey();
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue; // Sonraki denemeye geç
      }
      
      // Diğer hatalar veya son deneme başarısız olduysa
      console.error('Transkripsiyon hatası:', error);
    
      // Daha spesifik hata mesajları
      if (error.response) {
        // HTTP yanıtı alındı ama hata kodu döndü
        if (error.response.status === 429) {
          // Rate limit hatası için cooldown başlat
          setCooldownPeriod();
          throw new Error('API istek limiti aşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin veya OpenAI API anahtarınızı kontrol edin.');
        } 
        else if (error.response.status === 401) {
          throw new Error('OpenAI API anahtarı geçersiz. Lütfen .env.local dosyasındaki API anahtarını kontrol edin.');
        }
        else if (error.response.status === 400) {
          throw new Error('Ses dosyası işlenemedi. Format veya boyut uygun olmayabilir.');
        }
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        if (error.code === 'ECONNABORTED') {
          throw new Error('API isteği zaman aşımına uğradı. Ağ bağlantınızı kontrol edin veya daha küçük bir ses dosyası kullanın.');
        }
        throw new Error('API yanıt vermedi. İnternet bağlantınızı kontrol edin.');
      }
      
      // Genel hata
      throw new Error('Ses dosyası yazıya dönüştürülemedi: ' + (error.message || 'Bilinmeyen hata'));
    }
  }
  
  // Tüm denemeler başarısız olduysa ve buraya kadar geldiyse
  throw lastError || new Error('Ses dosyası yazıya dönüştürülemedi');
};

/**
 * Microsoft Translator API kullanarak metin çevirisi yap
 */
const translateWithMicrosoft = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translatedText: string; confidence: number }> => {
  try {
    const sourceParam = sourceLanguage === 'auto' ? '' : `&from=${sourceLanguage}`;
    const url = `${MICROSOFT_TRANSLATOR_URL}&to=${targetLanguage}${sourceParam}`;
    
    const response = await axios.post<MicrosoftTranslationResponse[]>(url, [{ Text: text }], {
      headers: {
        'Ocp-Apim-Subscription-Key': MICROSOFT_TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': MICROSOFT_TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
    });

    const translatedText = response.data[0]?.translations[0]?.text || '';
    // Microsoft belirli bir güven skoru sağlamıyor, bu yüzden yüksek bir değer kullanıyoruz
    const confidence = 0.95;
    
    return { translatedText, confidence };
  } catch (error) {
    console.error('Microsoft çeviri hatası:', error);
    throw new Error('Microsoft Translator ile çeviri başarısız oldu');
  }
};

/**
 * LibreTranslate API kullanarak metin çevirisi yap
 */
const translateWithLibre = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translatedText: string; confidence: number }> => {
  try {
    const payload = {
      q: text,
      source: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
      target: targetLanguage,
      format: 'text',
      api_key: LIBRETRANSLATE_API_KEY
    };

    const response = await axios.post<LibreTranslateResponse>(LIBRETRANSLATE_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const translatedText = response.data.translatedText || '';
    // LibreTranslate güven skoru sağlamıyor, bu yüzden orta-yüksek bir değer kullanıyoruz
    const confidence = 0.85;
    
    return { translatedText, confidence };
  } catch (error) {
    console.error('LibreTranslate çeviri hatası:', error);
    throw new Error('LibreTranslate ile çeviri başarısız oldu');
  }
};

/**
 * Metni kaynak dilden hedef dile çevir
 */
export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translatedText: string; confidence: number }> => {
  if (!text || text.trim() === '') {
    return { translatedText: '', confidence: 0 };
  }
  
  if (DEMO_MODE) {
    // API çağrısı gecikmesini simüle et
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Demo amaçlı, hedef dil kodunu ekleyerek çeviriyi simüle et
    const translatedText = `[${targetLanguage}] ${text}`;
    
    // 0.7 ile 1.0 arasında rastgele güven skoru
    const confidence = 0.7 + Math.random() * 0.3;
    
    return { translatedText, confidence };
  }
  
  // Önbellekten çeviriyi kontrol et
  try {
    const cachedTranslation = await translationCache.get(text, sourceLanguage, targetLanguage);
    if (cachedTranslation) {
      console.log('Çeviri önbellekten alındı');
      return cachedTranslation;
    }
  } catch (error) {
    // Önbellek hatası durumunda gerçek API kullan
    console.warn('Önbellek kontrolü başarısız, API kullanılacak:', error);
  }

  // Seçilen API sağlayıcısına göre çeviriyi yap
  let result;
  if (TRANSLATION_API_PROVIDER === 'microsoft') {
    result = await translateWithMicrosoft(text, sourceLanguage, targetLanguage);
  } else {
    result = await translateWithLibre(text, sourceLanguage, targetLanguage);
  }
  
  // Başarılı çeviriyi önbelleğe kaydet
  try {
    await translationCache.set(
      text, 
      result.translatedText, 
      sourceLanguage, 
      targetLanguage,
      result.confidence
    );
  } catch (error) {
    console.warn('Çeviri önbelleğe kaydedilemedi:', error);
  }
  
  return result;
};

/**
 * Büyük metni parçalara ayırarak çevir
 */
export const translateLargeText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  maxChunkSize: number = 1000
): Promise<{ translatedText: string; confidence: number }> => {
  // Kısa metinler için doğrudan çeviri yap
  if (text.length <= maxChunkSize) {
    return translateText(text, sourceLanguage, targetLanguage);
  }
  
  // Metni parçalara ayır
  const chunks = chunkText(text, maxChunkSize);
  
  // Her parçayı paralel olarak çevir
  const translations = await Promise.all(
    chunks.map(chunk => translateText(chunk, sourceLanguage, targetLanguage))
  );
  
  // Çevrilen parçaları birleştir ve ortalama güven skorunu hesapla
  const translatedText = translations.map(t => t.translatedText).join(' ');
  const confidence = translations.reduce((sum, t) => sum + t.confidence, 0) / translations.length;
  
  return { translatedText, confidence };
};

/**
 * Verilen metnin dilini algıla
 */
export const detectLanguage = async (text: string): Promise<string> => {
  if (DEMO_MODE) {
    // API çağrısı gecikmesini simüle et
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Demo amaçlı, İngilizce döndür
    return 'en';
  }

  try {
    // Dil algılama için LibreTranslate veya Microsoft API'si kullanılabilir
    if (TRANSLATION_API_PROVIDER === 'libre') {
      // LibreTranslate'in dil algılama endpoint'i
      const detectUrl = LIBRETRANSLATE_API_URL.replace('/translate', '/detect');
      
      const response = await axios.post<LibreDetectResponse[]>(detectUrl, {
        q: text.substring(0, 200), // Metnin başlangıcını kullan
        api_key: LIBRETRANSLATE_API_KEY
      });
      
      // En yüksek güven skoruna sahip dili döndür
      return response.data[0]?.language || 'en';
    } else {
      // Microsoft Translator ile çeviri yaparak dil algılama
      const url = `${MICROSOFT_TRANSLATOR_URL}&to=en&includeSentenceLength=true`;
      
      const response = await axios.post<MicrosoftTranslationResponse[]>(url, [{ Text: text.substring(0, 200) }], {
        headers: {
          'Ocp-Apim-Subscription-Key': MICROSOFT_TRANSLATOR_KEY,
          'Ocp-Apim-Subscription-Region': MICROSOFT_TRANSLATOR_REGION,
          'Content-Type': 'application/json',
        },
      });
      
      // Microsoft algılanan dil kodunu döndürür
      return response.data[0]?.detectedLanguage?.language || 'en';
    }
  } catch (error) {
    console.error('Dil algılama hatası:', error);
    throw new Error('Dil algılanamadı');
  }
}; 