import { track } from '@vercel/analytics/server';
import { NextRequest, NextResponse } from 'next/server';

// Çoklu çeviri isteği arayüzü
interface TranslationBatchRequest {
  requests: Array<{
    text: string;
    sourceLang: string;
    targetLang: string;
  }>;
}

// Çeviri sonucu arayüzü
interface TranslationResult {
  text: string;
  confidence?: number;
}

export async function POST(request: NextRequest) {
  try {
    // İstek verisini al
    const data = await request.json() as TranslationBatchRequest;
    
    if (!data.requests || !Array.isArray(data.requests) || data.requests.length === 0) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Metrik toplama
    track('Batch Translation Request', {
      batchSize: data.requests.length,
      languages: [...new Set(data.requests.map(req => `${req.sourceLang}-${req.targetLang}`))].join(',')
    });
    
    // Batch olarak çeviri işlemi
    const results: TranslationResult[] = await Promise.all(
      data.requests.map(async (req) => {
        try {
          // Her bir metin için çeviri yap
          const result = await translateSingle(req.text, req.sourceLang, req.targetLang);
          return result;
        } catch (error) {
          console.error('Error translating single text:', error);
          // Hata durumunda boş sonuç döndür
          return { text: '' };
        }
      })
    );
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Batch translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

// Tek metin çevirisi (OpenAI API kullanarak)
async function translateSingle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
  // Boş metin kontrolü
  if (!text || text.trim() === '') {
    return { text: '' };
  }
  
  try {
    // Burada OpenAI API çağrısı yapılacak
    // Bu örnek için basit bir simülasyon yapıyoruz
    // Gerçek implementasyonda OpenAI API kullanılmalı
    
    // Mevcut projenizde kullanılan OpenAI çağrı mantığını buraya entegre edin
    
    // Örnek için simüle edilmiş çeviri
    const translatedText = `[${targetLang}] ${text}`;
    
    return {
      text: translatedText,
      confidence: 0.95
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
} 