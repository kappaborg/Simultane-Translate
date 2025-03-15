/**
 * Çeviri önbelleği ve API optimizasyonu için yardımcı fonksiyonlar
 */

/**
 * IndexedDB kullanarak çeviri önbelleği
 */
export class TranslationCache {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'SimultaneTranslationCache';
  private readonly STORE_NAME = 'translations';
  private readonly DB_VERSION = 1;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // IndexedDB tarayıcı tarafında olduğunda yükle
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initPromise = this.init();
    }
  }

  /**
   * Veritabanını başlat
   */
  private async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.isInitialized = true;
          console.log('Çeviri önbelleği veritabanı başarıyla açıldı');
          resolve();
        };

        request.onerror = (event) => {
          console.error('Çeviri önbelleği veritabanı açılamadı', event);
          reject(new Error('IndexedDB veritabanı açılamadı'));
        };
      } catch (error) {
        console.error('IndexedDB hatası:', error);
        reject(error);
      }
    });
  }

  /**
   * İlklendirme durumunu kontrol et ve gerekirse bekle
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) {
      await this.initPromise;
    } else {
      this.initPromise = this.init();
      await this.initPromise;
    }
  }

  /**
   * Önbellekten çeviri al
   */
  async get(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{
    translatedText: string;
    confidence: number;
    fromCache: boolean;
  } | null> {
    if (!text || text.trim() === '') return null;

    try {
      await this.ensureInitialized();
      if (!this.db) return null;

      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
          const store = transaction.objectStore(this.STORE_NAME);
          const key = `${sourceLanguage}:${targetLanguage}:${this.hashText(text)}`;
          const request = store.get(key);

          request.onsuccess = () => {
            if (request.result) {
              // 30 günden eski önbellekleri kullanma
              if (Date.now() - request.result.timestamp < 30 * 24 * 60 * 60 * 1000) {
                resolve({
                  translatedText: request.result.translation,
                  confidence: request.result.confidence || 0.9,
                  fromCache: true
                });
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };

          request.onerror = () => {
            console.error('Önbellek okuma hatası', request.error);
            resolve(null);
          };
        } catch (error) {
          console.error('Önbellek okuma işlemi hatası:', error);
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Önbellek hatası:', error);
      return null;
    }
  }

  /**
   * Çeviriyi önbelleğe kaydet
   */
  async set(
    text: string,
    translation: string,
    sourceLanguage: string,
    targetLanguage: string,
    confidence: number = 0.9
  ): Promise<boolean> {
    if (!text || !translation) return false;

    try {
      await this.ensureInitialized();
      if (!this.db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          const key = `${sourceLanguage}:${targetLanguage}:${this.hashText(text)}`;

          const request = store.put({
            key,
            text,
            translation,
            sourceLanguage,
            targetLanguage,
            confidence,
            timestamp: Date.now()
          });

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            console.error('Önbellek yazma hatası', request.error);
            resolve(false);
          };
        } catch (error) {
          console.error('Önbellek yazma işlemi hatası:', error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Önbellek kaydetme hatası:', error);
      return false;
    }
  }

  /**
   * Önbelleği temizle
   */
  async clear(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      if (!this.db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.clear();

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            console.error('Önbellek temizleme hatası', request.error);
            resolve(false);
          };
        } catch (error) {
          console.error('Önbellek temizleme işlemi hatası:', error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
      return false;
    }
  }

  /**
   * Eski önbellek kayıtlarını temizle
   */
  async cleanExpired(maxAgeDays: number = 30): Promise<number> {
    try {
      await this.ensureInitialized();
      if (!this.db) return 0;

      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.openCursor();
          
          let deletedCount = 0;
          const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
          const cutoffTime = Date.now() - maxAge;

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              if (cursor.value.timestamp < cutoffTime) {
                cursor.delete();
                deletedCount++;
              }
              cursor.continue();
            } else {
              resolve(deletedCount);
            }
          };

          request.onerror = () => {
            console.error('Önbellek temizleme hatası', request.error);
            resolve(0);
          };
        } catch (error) {
          console.error('Önbellek temizleme işlemi hatası:', error);
          resolve(0);
        }
      });
    } catch (error) {
      console.error('Eski önbellek kayıtları temizleme hatası:', error);
      return 0;
    }
  }

  /**
   * Metni hash'e dönüştür (önbellek anahtarı için)
   */
  private hashText(text: string): string {
    // Basit hash fonksiyonu
    let hash = 0;
    const normalizedText = text.trim().toLowerCase();
    
    for (let i = 0; i < normalizedText.length; i++) {
      hash = ((hash << 5) - hash) + normalizedText.charCodeAt(i);
      hash |= 0;
    }
    
    return hash.toString(16);
  }
}

// Singleton olarak dışa aktar
export const translationCache = new TranslationCache();

/**
 * API kullanım metriklerini izleme
 */
export class APIUsageTracker {
  private usageData = {
    dailyRequests: 0,
    monthlyRequests: 0,
    dailyTokens: 0,
    monthlyTokens: 0,
    lastReset: Date.now()
  };
  
  constructor() {
    this.loadUsageData();
    
    // Tarayıcıda localStorage yoksa boş obje olarak kabul et
    if (typeof window === 'undefined' || !('localStorage' in window)) {
      this.saveUsageData = () => {}; 
      this.loadUsageData = () => {};
    }
  }
  
  /**
   * API isteği kullanımını takip et
   */
  trackRequest(tokenCount: number = 0) {
    this.checkResetNeeded();
    
    this.usageData.dailyRequests++;
    this.usageData.monthlyRequests++;
    this.usageData.dailyTokens += tokenCount;
    this.usageData.monthlyTokens += tokenCount;
    
    this.saveUsageData();
    
    // Limitlere yaklaşıldığında kullanıcıyı uyar
    this.checkLimits();
  }
  
  /**
   * Kalan istek sayısını döndür
   */
  getRemainingRequests(dailyLimit: number = 200): number {
    return Math.max(0, dailyLimit - this.usageData.dailyRequests);
  }
  
  /**
   * Kullanım özeti al
   */
  getUsageSummary() {
    return {
      dailyRequests: this.usageData.dailyRequests,
      monthlyRequests: this.usageData.monthlyRequests,
      dailyTokens: this.usageData.dailyTokens,
      monthlyTokens: this.usageData.monthlyTokens,
      lastReset: this.usageData.lastReset
    };
  }
  
  /**
   * Limitleri kontrol et
   */
  private checkLimits() {
    // Günlük limit aşılma riski varsa kullanıcıyı bilgilendir
    const dailyLimit = 200; // Ücretsiz hesap varsayılan değeri
    
    if (this.usageData.dailyRequests >= dailyLimit * 0.8) {
      console.warn(`API kullanımı günlük limitin %${Math.round(this.usageData.dailyRequests / dailyLimit * 100)}'ine ulaştı. Dikkatli kullanın.`);
      
      // İsteğe bağlı olarak UI'da göster
      if (typeof window !== 'undefined' && 'CustomEvent' in window) {
        window.dispatchEvent(new CustomEvent('api-limit-warning', { 
          detail: { 
            percentage: Math.round(this.usageData.dailyRequests / dailyLimit * 100),
            remaining: dailyLimit - this.usageData.dailyRequests
          } 
        }));
      }
    }
  }
  
  /**
   * Sıfırlama gerekip gerekmediğini kontrol et
   */
  private checkResetNeeded() {
    const now = new Date();
    const lastReset = new Date(this.usageData.lastReset);
    
    // Ay değiştiyse aylık sayaçları sıfırla
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      this.resetMonthlyCounters();
    }
    
    // Gün değiştiyse günlük sayaçları sıfırla
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      this.resetDailyCounters();
    }
  }
  
  /**
   * Günlük sayaçları sıfırla
   */
  private resetDailyCounters() {
    this.usageData.dailyRequests = 0;
    this.usageData.dailyTokens = 0;
    this.usageData.lastReset = Date.now();
    this.saveUsageData();
  }
  
  /**
   * Aylık sayaçları sıfırla
   */
  private resetMonthlyCounters() {
    this.usageData.monthlyRequests = 0;
    this.usageData.monthlyTokens = 0;
    this.saveUsageData();
  }
  
  /**
   * Kullanım verilerini kaydet
   */
  private saveUsageData() {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.setItem('api_usage', JSON.stringify(this.usageData));
      }
    } catch (e) {
      console.warn('API kullanım verileri kaydedilemedi', e);
    }
  }
  
  /**
   * Kullanım verilerini yükle
   */
  private loadUsageData() {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const stored = localStorage.getItem('api_usage');
        if (stored) {
          this.usageData = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('API kullanım verileri yüklenemedi', e);
    }
  }

  /**
   * Get daily request count
   */
  getDailyRequests(): number {
    this.checkResetNeeded();
    return this.usageData.dailyRequests;
  }
  
  /**
   * Get monthly request count
   */
  getMonthlyRequests(): number {
    this.checkResetNeeded();
    return this.usageData.monthlyRequests;
  }
  
  /**
   * Get remaining daily requests
   */
  getRemainingDailyRequests(dailyLimit: number = 200): number {
    this.checkResetNeeded();
    return Math.max(0, dailyLimit - this.usageData.dailyRequests);
  }
  
  /**
   * Check if daily limit is exceeded
   */
  isDailyLimitExceeded(dailyLimit: number = 200): boolean {
    this.checkResetNeeded();
    return this.usageData.dailyRequests >= dailyLimit;
  }
}

// Singleton olarak dışa aktar
export const apiUsageTracker = new APIUsageTracker();

/**
 * API anahtarı rotasyonu
 */
export class APIKeyRotator {
  private currentKeyIndex = 0;
  private keyUsageCount: Record<number, number> = {};
  private keyLastUsed: Record<number, number> = {};
  
  constructor(private apiKeys: string[], private maxUsagePerHour: number = 50) {
    // Her anahtar için kullanım sayacını sıfırla
    apiKeys.forEach((_, index) => {
      this.keyUsageCount[index] = 0;
      this.keyLastUsed[index] = 0;
    });
  }
  
  /**
   * Mevcut API anahtarını al
   */
  getCurrentKey(): string {
    // Hiç anahtar yoksa boş döndür
    if (this.apiKeys.length === 0) {
      return '';
    }
    
    // Son kullanımdan beri 1 saat geçtiyse sayacı sıfırla
    if (Date.now() - this.keyLastUsed[this.currentKeyIndex] > 3600000) {
      this.keyUsageCount[this.currentKeyIndex] = 0;
    }
    
    // Eğer mevcut anahtar limiti aştıysa bir sonraki anahtara geç
    if (this.keyUsageCount[this.currentKeyIndex] >= this.maxUsagePerHour) {
      this.rotateKey();
    }
    
    return this.apiKeys[this.currentKeyIndex];
  }
  
  /**
   * Anahtar kullanımını işaretle
   */
  markKeyUsed() {
    if (this.apiKeys.length === 0) return;
    
    this.keyUsageCount[this.currentKeyIndex]++;
    this.keyLastUsed[this.currentKeyIndex] = Date.now();
  }
  
  /**
   * Bir sonraki anahtara geç
   */
  rotateKey() {
    if (this.apiKeys.length <= 1) return;
    
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    
    // Tüm anahtarlar limitli mi kontrol et
    let allKeysLimited = true;
    for (let i = 0; i < this.apiKeys.length; i++) {
      if (this.keyUsageCount[i] < this.maxUsagePerHour || 
          Date.now() - this.keyLastUsed[i] > 3600000) {
        allKeysLimited = false;
        this.currentKeyIndex = i;
        break;
      }
    }
    
    if (allKeysLimited) {
      console.warn('Tüm API anahtarları saatlik limitlerini doldurdu. Hizmet kısıtlı olabilir.');
    }
  }
  
  /**
   * Tüm anahtarların kullanım durumunu al
   */
  getKeyStatuses(): Array<{index: number; usageCount: number; lastUsed: number}> {
    return Object.keys(this.keyUsageCount).map(key => {
      const index = parseInt(key);
      return {
        index,
        usageCount: this.keyUsageCount[index],
        lastUsed: this.keyLastUsed[index]
      };
    });
  }
} 