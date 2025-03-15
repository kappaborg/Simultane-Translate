/**
 * audioUtils.ts
 * 
 * Ses işleme ve optimizasyon yardımcı fonksiyonları.
 * Bu modül, ses dosyalarını API'ye gönderilecek şekilde optimize eder 
 * ve gerektiğinde büyük ses dosyalarını parçalara ayırır.
 */

/**
 * Ses dosyasını API için optimize eder.
 * 16kHz mono WAV formatına dönüştürür (Whisper API için optimize edilmiş).
 * 
 * @param audioBlob Orijinal ses blobu
 * @returns Optimize edilmiş ses blobu
 */
export const optimizeAudioForAPI = async (audioBlob: Blob): Promise<Blob> => {
  try {
    // AudioContext desteğini kontrol et
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      console.warn('AudioContext desteklenmiyor, orijinal ses dosyası kullanılacak');
      return audioBlob;
    }
    
    // Blob'u ArrayBuffer'a dönüştür
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // AudioContext oluştur
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const context = new AudioContext();
    
    // ArrayBuffer'ı decode et
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    // Orijinal boyutu kaydet
    const originalSize = audioBlob.size;
    
    // Offline context oluştur (16kHz, mono)
    const offlineContext = new OfflineAudioContext(
      1, // Mono (1 kanal)
      Math.ceil(audioBuffer.duration * 16000), // 16kHz için örnek sayısı
      16000 // 16kHz örnekleme hızı (Whisper API için optimize)
    );
    
    // Ses kaynağı oluştur
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Ses kaynağını offline context'e bağla
    source.connect(offlineContext.destination);
    
    // Oynatmayı başlat
    source.start(0);
    
    // Render'ı gerçekleştir
    const renderedBuffer = await offlineContext.startRendering();
    
    // AudioBuffer'ı WAV formatına dönüştür
    const wavBlob = await audioBufferToWavBlob(renderedBuffer);
    
    // Boyut değişimini göster
    const newSize = wavBlob.size;
    const reductionPercent = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    console.log(`Ses optimizasyonu: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB (-%${reductionPercent})`);
    
    return wavBlob;
  } catch (error) {
    console.error('Ses optimizasyonu başarısız:', error);
    // Hata durumunda orijinal blobu döndür
    return audioBlob;
  }
};

/**
 * Büyük ses dosyasını belirli uzunluktaki parçalara böler.
 * 
 * @param audioBlob Orijinal ses blobu
 * @param segmentLengthSec Segment uzunluğu (saniye) - Varsayılan: 30 saniye
 * @returns Ses segmentleri dizisi
 */
export const splitAudioIntoSegments = async (
  audioBlob: Blob, 
  segmentLengthSec: number = 30
): Promise<Blob[]> => {
  try {
    // Çok küçük dosyalar için bölmeye gerek yok
    const fileSizeMB = audioBlob.size / (1024 * 1024);
    if (fileSizeMB < 1) {
      return [audioBlob];
    }
    
    // AudioContext desteğini kontrol et
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      console.warn('AudioContext desteklenmiyor, ses bölme yapılamıyor');
      return [audioBlob];
    }
    
    // ArrayBuffer'a dönüştür
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // AudioContext oluştur
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const context = new AudioContext();
    
    // ArrayBuffer'ı decode et
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    // Toplam süre
    const totalDuration = audioBuffer.duration;
    console.log(`Toplam ses süresi: ${totalDuration.toFixed(1)} saniye`);
    
    // Tek segment yeterli mi?
    if (totalDuration <= segmentLengthSec) {
      return [audioBlob];
    }
    
    // Segment sayısını hesapla
    const numSegments = Math.ceil(totalDuration / segmentLengthSec);
    console.log(`Ses ${numSegments} parçaya bölünüyor (her biri ~${segmentLengthSec} saniye)`);
    
    // Her segment için bir blob oluştur
    const segmentBlobs: Blob[] = [];
    
    for (let i = 0; i < numSegments; i++) {
      // Segment başlangıç ve bitiş zamanlarını hesapla
      const startTime = i * segmentLengthSec;
      const endTime = Math.min((i + 1) * segmentLengthSec, totalDuration);
      const segmentDuration = endTime - startTime;
      
      // Bu segment için offline context oluştur
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        Math.ceil(segmentDuration * audioBuffer.sampleRate),
        audioBuffer.sampleRate
      );
      
      // Geçici buffer oluştur ve ses verilerini kopyala
      const segmentBuffer = offlineContext.createBuffer(
        audioBuffer.numberOfChannels,
        Math.ceil(segmentDuration * audioBuffer.sampleRate),
        audioBuffer.sampleRate
      );
      
      // Her kanal için verileri kopyala
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = new Float32Array(segmentBuffer.length);
        const sourceData = audioBuffer.getChannelData(channel);
        
        // Verileri kopyala
        const startSample = Math.floor(startTime * audioBuffer.sampleRate);
        const endSample = Math.min(
          startSample + segmentBuffer.length,
          audioBuffer.length
        );
        
        for (let j = 0; j < endSample - startSample; j++) {
          channelData[j] = sourceData[startSample + j];
        }
        
        segmentBuffer.copyToChannel(channelData, channel);
      }
      
      // Ses kaynağı oluştur
      const source = offlineContext.createBufferSource();
      source.buffer = segmentBuffer;
      source.connect(offlineContext.destination);
      source.start(0);
      
      // Render'ı gerçekleştir
      const renderedBuffer = await offlineContext.startRendering();
      
      // AudioBuffer'ı WAV formatına dönüştür
      const wavBlob = await audioBufferToWavBlob(renderedBuffer);
      
      segmentBlobs.push(wavBlob);
      console.log(`Segment ${i+1}/${numSegments} oluşturuldu: ${(wavBlob.size / 1024).toFixed(1)}KB`);
    }
    
    return segmentBlobs;
  } catch (error) {
    console.error('Ses bölme işlemi başarısız:', error);
    // Hata durumunda orijinal blobu döndür
    return [audioBlob];
  }
};

/**
 * Blob'u ArrayBuffer'a dönüştürür.
 * 
 * @param blob Dönüştürülecek blob
 * @returns ArrayBuffer
 */
export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = () => {
      reject(new Error('Blob ArrayBuffer\'a dönüştürülemedi'));
    };
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * AudioBuffer'ı WAV formatında bir Blob'a dönüştürür.
 * 
 * @param audioBuffer Dönüştürülecek audio buffer
 * @returns WAV formatında blob
 */
export const audioBufferToWavBlob = (audioBuffer: AudioBuffer): Promise<Blob> => {
  return new Promise((resolve) => {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * numChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV dosya başlığı (44 byte)
    writeString(view, 0, 'RIFF');                      // ChunkID
    view.setUint32(4, 36 + dataSize, true);           // ChunkSize
    writeString(view, 8, 'WAVE');                      // Format
    writeString(view, 12, 'fmt ');                     // Subchunk1ID
    view.setUint32(16, 16, true);                     // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);                      // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);            // NumChannels
    view.setUint32(24, sampleRate, true);             // SampleRate
    view.setUint32(28, byteRate, true);               // ByteRate
    view.setUint16(32, blockAlign, true);             // BlockAlign
    view.setUint16(34, bitsPerSample, true);          // BitsPerSample
    writeString(view, 36, 'data');                     // Subchunk2ID
    view.setUint32(40, dataSize, true);               // Subchunk2Size

    // Ses verilerini dönüştür
    const channelData = [];
    // Her kanal için verileri al
    for (let i = 0; i < numChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }

    // Örnek pozisyonu
    let offset = 44;
    // Her örnek için
    for (let i = 0; i < length; i++) {
      // Her kanal için
      for (let channel = 0; channel < numChannels; channel++) {
        // Float32 ses verisini Int16 olarak dönüştür
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, value, true);
        offset += bytesPerSample;
      }
    }

    // ArrayBuffer'ı blob'a dönüştür
    const wavBlob = new Blob([buffer], { type: 'audio/wav' });
    resolve(wavBlob);
  });
};

/**
 * DataView'a string yazar.
 * 
 * @param view DataView
 * @param offset Başlangıç pozisyonu
 * @param string Yazılacak string
 */
const writeString = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Ses dosyası kalitesini kontrol eder.
 * 
 * @param audioBlob Kontrol edilecek ses dosyası
 * @returns Kontrol sonucu
 */
export const checkAudioQuality = (audioBlob: Blob): { warning: string | null; tooBig: boolean; tooSmall: boolean } => {
  const fileSizeKB = audioBlob.size / 1024;
  
  // Çok küçük (muhtemelen boş veya çok kısa kayıt)
  if (fileSizeKB < 5) {
    return {
      warning: `Ses dosyası çok küçük (${fileSizeKB.toFixed(1)}KB). Kayıt çok kısa veya ses algılanmamış olabilir.`,
      tooBig: false,
      tooSmall: true
    };
  }
  
  // Çok büyük (API'nin işlemesi zor olabilir)
  if (fileSizeKB > 25 * 1024) {
    return {
      warning: `Ses dosyası çok büyük (${(fileSizeKB / 1024).toFixed(1)}MB). API'nin işlemesi uzun sürebilir.`,
      tooBig: true,
      tooSmall: false
    };
  }
  
  return { warning: null, tooBig: false, tooSmall: false };
}; 