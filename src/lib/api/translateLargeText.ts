/**
 * Büyük metinleri çevirme yardımcı işlevi
 * Metin çok büyükse parçalara ayırıp çevirir
 */
 
import { translateText } from './requestManager';

// Maksimum parça boyutu (karakter sayısı)
const MAX_CHUNK_SIZE = 2000;

// Büyük metni çevir
export async function translateLargeText(
  text: string, 
  sourceLang: string, 
  targetLang: string
): Promise<{ translatedText: string; confidence: number }> {
  // Metin boşsa boş sonuç döndür
  if (!text || text.trim() === '') {
    return { translatedText: '', confidence: 0 };
  }
  
  try {
    // Metin yeterince küçükse direkt çevir
    if (text.length <= MAX_CHUNK_SIZE) {
      const result = await translateText(text, sourceLang, targetLang);
      return { 
        translatedText: result.text,
        confidence: result.confidence || 0.95
      };
    }
    
    // Metni cümlelere böl
    const sentences = splitIntoSentences(text);
    
    // Cümleleri grupla
    const chunks = groupSentencesIntoChunks(sentences, MAX_CHUNK_SIZE);
    
    // Her grubu ayrı çevir
    const translatedChunks = await Promise.all(
      chunks.map(chunk => translateText(chunk, sourceLang, targetLang))
    );
    
    // Çevirileri birleştir
    const translatedText = translatedChunks
      .map(result => result.text)
      .join(' ')
      .replace(/\s+/g, ' ') // Fazla boşlukları temizle
      .trim();
    
    // Ortalama güven skorunu hesapla
    const confidenceValues = translatedChunks
      .map(result => result.confidence || 0)
      .filter(confidence => confidence > 0);
    
    const averageConfidence = confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : 0.95;
    
    return {
      translatedText,
      confidence: averageConfidence
    };
  } catch (error) {
    console.error('Büyük metin çeviri hatası:', error);
    throw error;
  }
}

// Metni cümlelere ayır
function splitIntoSentences(text: string): string[] {
  // Basit bir cümle ayırıcı
  // NOT: Dil spesifik daha gelişmiş bir ayırıcı kullanılabilir
  return text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .filter(sentence => sentence.trim() !== '');
}

// Cümleleri grupla
function groupSentencesIntoChunks(sentences: string[], maxChunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // Eğer mevcut grup ve yeni cümle maxChunkSize'dan küçükse
    if (currentChunk.length + sentence.length + 1 <= maxChunkSize) {
      // Cümleyi mevcut gruba ekle
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      // Mevcut grup doluysa, yeni bir grup başlat
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // Çok uzun bir cümlede karakterleri böl
      if (sentence.length > maxChunkSize) {
        let remainingSentence = sentence;
        
        while (remainingSentence.length > 0) {
          const chunk = remainingSentence.slice(0, maxChunkSize);
          chunks.push(chunk);
          remainingSentence = remainingSentence.slice(maxChunkSize);
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  
  // Son grubu ekle
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

export default translateLargeText; 