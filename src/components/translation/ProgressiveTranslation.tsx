'use client';

import { translateText } from '@/lib/api/requestManager';
import { track } from '@vercel/analytics';
import { useEffect, useState } from 'react';

export const ProgressiveTranslation: React.FC<{
  text: string;
  sourceLang: string;
  targetLang: string;
  onTranslating?: (translating: boolean) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (fullTranslation: string) => void;
}> = ({ 
  text, 
  sourceLang, 
  targetLang, 
  onTranslating, 
  onProgress,
  onComplete 
}) => {
  const [translation, setTranslation] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  useEffect(() => {
    // Metin boşsa veya aynıysa
    if (!text) {
      setTranslation('');
      setProgress(0);
      if (onTranslating) onTranslating(false);
      if (onProgress) onProgress(0);
      return;
    }
    
    // Çeviri işlemi
    const translate = async () => {
      setIsTranslating(true);
      if (onTranslating) onTranslating(true);
      
      try {
        // Metni cümlelere böl
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        let partialTranslation = '';
        
        for (let i = 0; i < sentences.length; i++) {
          // Her cümleyi ayrı çevir
          const result = await translateText(
            sentences[i],
            sourceLang,
            targetLang
          );
          
          // Kademeli olarak çeviriyi göster
          partialTranslation += result.text + ' ';
          const cleanTranslation = partialTranslation.trim();
          setTranslation(cleanTranslation);
          
          // İlerlemeyi güncelle
          const newProgress = Math.round(((i + 1) / sentences.length) * 100);
          setProgress(newProgress);
          if (onProgress) onProgress(newProgress);
          
          // Analitik izleme - her bir cümle çevirisi
          if (i === 0 || i === sentences.length - 1) {
            track('Progressive Translation Progress', {
              sentenceIndex: i,
              totalSentences: sentences.length,
              progress: newProgress,
              sourceLang,
              targetLang
            });
          }
        }
        
        // Tamamlandı
        if (onComplete) onComplete(partialTranslation.trim());
        
        // Analitik izleme - çeviri tamamlandı
        track('Progressive Translation Complete', {
          textLength: text.length,
          sentenceCount: sentences.length,
          sourceLang,
          targetLang
        });
      } catch (error) {
        console.error('Translation error:', error);
        
        // Analitik izleme - çeviri hatası
        track('Progressive Translation Error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          sourceLang,
          targetLang
        });
      } finally {
        setIsTranslating(false);
        if (onTranslating) onTranslating(false);
      }
    };
    
    translate();
  }, [text, sourceLang, targetLang, onTranslating, onProgress, onComplete]);
  
  return (
    <div className="progressive-translation">
      {isTranslating && (
        <div className="translation-progress">
          <div 
            className="progress-bar bg-gray-200 dark:bg-gray-700 h-1 w-full overflow-hidden rounded-full mt-2 mb-4"
          >
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {progress}%
          </div>
        </div>
      )}
      
      <div className="translation-result">
        {translation || (isTranslating ? 'Çevriliyor...' : '')}
      </div>
    </div>
  );
}; 