import { AudioRecorderService } from '@/lib/api/audioRecorderService';
import { transcribeAudio, translateLargeText } from '@/lib/api/translationService';
import SupportedLanguages from '@/lib/data/languages';
import { useLocalization } from '@/lib/hooks/useLocalization';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { CopyIcon, MicIcon, PauseIconCustom, SpeakerIcon, SpinnerIcon, TranslateIcon, XMarkIcon } from '@/lib/icons';
import { checkAudioQuality, optimizeAudioForAPI } from '@/lib/utils/audioUtils';
import { apiUsageTracker, translationCache } from '@/lib/utils/cacheUtils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import PermissionHelper from './PermissionHelper';
import RateLimitHelper from './RateLimitHelper';

// Tarayıcı API'lerini tutan değişkenler
let SpeechRecognitionConstructor: typeof SpeechRecognition | null = null;
let speechRecognitionInstance: SpeechRecognition | null = null;

// Yalnızca tarayıcı tarafında çalışacak kodu lazy-load ile yükleme
if (typeof window !== 'undefined') {
  // Web Speech API
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (SpeechRecognitionAPI) {
    SpeechRecognitionConstructor = SpeechRecognitionAPI;
  }
}

// SpeechRecognition API'sinin kullanılabilirliğini ve güvenlik gereksinimlerini kontrol et
const checkSpeechRecognitionAvailability = (): { available: boolean; reason?: string } => {
  // Tarayıcı tarafında değilsek kullanılamaz
  if (typeof window === 'undefined') {
    return { available: false, reason: 'server-side' };
  }
  
  // SpeechRecognition API desteği var mı?
  if (!SpeechRecognitionConstructor) {
    return { available: false, reason: 'not-supported' };
  }
  
  // HTTPS kullanılıyor mu?
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return { available: false, reason: 'not-secure' };
  }
  
  return { available: true };
};

export const TranslationPanel: React.FC = () => {
  const { t, locale, changeLanguage } = useTranslation();
  const { t: localizationT } = useLocalization();
  
  // Configuration and state
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('tr');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [showPermissionHelper, setShowPermissionHelper] = useState(false);
  const [permissionType, setPermissionType] = useState<'microphone' | 'speech-recognition'>('microphone');
  const [showRateLimitHelper, setShowRateLimitHelper] = useState(false);
  const [apiCooldownEndTime, setApiCooldownEndTime] = useState(0);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRecorderRef = useRef<AudioRecorderService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceLangSelectRef = useRef<HTMLSelectElement>(null);
  const targetLangSelectRef = useRef<HTMLSelectElement>(null);
  const isTranscribing = useRef<boolean>(false);
  const isRecognitionActive = useRef<boolean>(false);
  const lastRecognitionRestart = useRef<number>(0);
  
  // API Kullanım durumunu gösteren bilgiler
  const [apiUsageInfo, setApiUsageInfo] = useState({
    dailyRequests: 0,
    monthlyRequests: 0,
    dailyRemaining: 0,
  });

  // Update API usage information
  const updateApiUsageInfo = useCallback(() => {
    setApiUsageInfo({
      dailyRequests: apiUsageTracker.getDailyRequests(),
      monthlyRequests: apiUsageTracker.getMonthlyRequests(),
      dailyRemaining: apiUsageTracker.getRemainingDailyRequests(),
    });
  }, []);

  // Bileşen yüklendiğinde API kullanım bilgilerini güncelle
  useEffect(() => {
    updateApiUsageInfo();
    
    // Önbelleği temizleme işlemi (30 günden eski girişleri)
    const cleanCache = async () => {
      try {
        await translationCache.cleanExpired();
      } catch (err) {
        console.warn('Önbellek temizleme hatası:', err);
      }
    };
    
    cleanCache();
  }, [updateApiUsageInfo]);

  // Initialize the audio recorder when the component mounts
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorderService();
    
    // Web Audio API için AudioContext oluştur
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    } catch (err) {
      console.warn('AudioContext oluşturulamadı:', err);
    }
    
    // Tarayıcı kapatıldığında kaynakları temizle
    const handleUnload = () => {
      cleanupRecognition();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, []);

  // Function to clean up SpeechRecognition resources
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        isRecognitionActive.current = false;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
        console.log('SpeechRecognition kaynakları temizlendi');
      } catch (error) {
        console.error('SpeechRecognition temizleme hatası:', error);
      }
    }
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices) {
        console.error('mediaDevices API kullanılamıyor');
        setErrorMessage(t('speech_recognition_not_available'));
        return false;
      }

      // Check if permission is already granted
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (result.state === 'granted') {
          return true;
        } else if (result.state === 'denied') {
          setPermissionType('microphone');
          setShowPermissionHelper(true);
          setErrorMessage(t('speech_recognition_error_mic_denied'));
          return false;
        }
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately after permission is granted
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error: any) {
      console.error('Mikrofon erişim hatası:', error);
      
      // Set specific error message based on the error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionType('microphone');
        setShowPermissionHelper(true);
        setErrorMessage(t('speech_recognition_error_mic_denied'));
      } else {
        setErrorMessage(t('speech_recognition_error_not_allowed'));
      }
      
      return false;
    }
  }, [t]);

  // Check speech recognition availability
  const checkSpeechRecognitionAvailability = useCallback((): boolean => {
    // Check for HTTPS or localhost
    const isSecureContext = window.location.protocol === 'https:' || 
                          window.location.hostname === 'localhost';
    
    if (!isSecureContext) {
      setErrorMessage(t('browser_https_required'));
      return false;
    }
    
    // Check if SpeechRecognition API is available
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('SpeechRecognition API desteklenmiyor');
      setErrorMessage(t('speech_recognition_not_available'));
      return false;
    }
    
    return true;
  }, [t]);

  // Handle SpeechRecognition errors
  const handleRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error('SpeechRecognition hatası:', event.error, event.message);
    
    // Ses tanıma durduysa kayıt modunu da kapat
    if (isRecording) {
      audioRecorderRef.current?.stopRecording();
      setIsRecording(false);
    }
    
    // Error türüne göre uygun mesajı göster
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        setPermissionType('speech-recognition');
        setShowPermissionHelper(true);
        setErrorMessage(t('speech_recognition_error_mic_denied'));
        break;
      case 'no-speech':
        setErrorMessage(t('speech_recognition_error_no_speech'));
        break;
      case 'network':
        setErrorMessage(t('speech_recognition_error_network'));
        break;
      case 'aborted':
        // Kullanıcı tarafından durdurulduğunda hata gösterme
        break;
      default:
        setErrorMessage(t('speech_recognition_start_error'));
    }
    
    isRecognitionActive.current = false;
  }, [isRecording, t]);

  // Initial setup for SpeechRecognition
  const initSpeechRecognition = useCallback(() => {
    // Önce mevcut tanımayı temizle
    cleanupRecognition();
    
    // SpeechRecognition API'yi kontrol et
    if (!checkSpeechRecognitionAvailability()) {
      return false;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure recognition settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Try to set language based on selected source language
      try {
        if (sourceLanguage && sourceLanguage !== 'auto') {
          recognition.lang = sourceLanguage;
        }
      } catch (e) {
        console.warn('Dil ayarlama hatası:', e);
      }
      
      // Handle recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const result = event.results[last];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        
        if (isFinal) {
          // Final sonuç için kaynak metni güncelle (mevcut metne ekle)
          setSourceText(prevText => {
            // Eğer önceki metin boşsa veya nokta ile bitiyorsa
            const separator = prevText && !prevText.trim().endsWith('.') ? '. ' : ' ';
            return prevText + (prevText ? separator : '') + transcript;
          });
        }
      };
      
      // Handle errors
      recognition.onerror = handleRecognitionError;
      
      // Handle recognition end
      recognition.onend = () => {
        console.log('SpeechRecognition bitti');
        isRecognitionActive.current = false;
        
        // Eğer hala kayıt yapılıyorsa ve yeni bir yeniden başlatma zamanlanmadıysa
        // SpeechRecognition hizmetini yeniden başlat
        if (isRecording && !isTranscribing.current) {
          const now = Date.now();
          // Son yeniden başlatmadan en az 1 saniye geçtiyse
          if (now - lastRecognitionRestart.current > 1000) {
            console.log('SpeechRecognition yeniden başlatılıyor...');
            lastRecognitionRestart.current = now;
            
            // Kısa bir gecikme ile yeniden başlat
            setTimeout(() => {
              if (isRecording) {
                try {
                  recognition.start();
                  isRecognitionActive.current = true;
                  console.log('SpeechRecognition yeniden başlatıldı');
                } catch (error) {
                  console.error('SpeechRecognition yeniden başlatma hatası:', error);
                  // Başarısız olursa tamamen yeniden başlat
                  setIsRecording(false);
                  startRecording();
                }
              }
            }, 300);
          }
        }
      };
      
      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error('SpeechRecognition başlatma hatası:', error);
      setErrorMessage(t('speech_recognition_start_error'));
      return false;
    }
  }, [cleanupRecognition, checkSpeechRecognitionAvailability, handleRecognitionError, isRecording, sourceLanguage, t]);

  // Start recording function
  const startRecording = useCallback(async () => {
    setErrorMessage('');
    setShowPermissionHelper(false);
    setShowRateLimitHelper(false);
    
    // Check if we're in cooldown period for API rate limits
    if (apiCooldownEndTime > Date.now()) {
      setShowRateLimitHelper(true);
      return;
    }

    // API kullanım limitlerini kontrol et
    if (apiUsageTracker.isDailyLimitExceeded()) {
      setErrorMessage(t('api_rate_limit_exceeded_daily'));
      setShowRateLimitHelper(true);
      return;
    }
    
    // Mikrofon izni iste
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) {
      return;
    }
    
    // SpeechRecognition API'yi yapılandır
    const recognitionInitialized = initSpeechRecognition();
    if (!recognitionInitialized) {
      return;
    }
    
    try {
      // AudioRecorder'ı başlat
      audioRecorderRef.current?.startRecording();
      
      // SpeechRecognition'ı başlat
      if (recognitionRef.current && !isRecognitionActive.current) {
        recognitionRef.current.start();
        isRecognitionActive.current = true;
        console.log('SpeechRecognition başlatıldı');
      }
      
      // Kayıt durumunu güncelle
      setIsRecording(true);
      setTargetText('');
      setAudioURL(null);
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error);
      setErrorMessage(t('speech_recognition_start_error'));
      
      // Hata durumunda kaynakları temizle
      audioRecorderRef.current?.stopRecording();
      cleanupRecognition();
    }
  }, [cleanupRecognition, initSpeechRecognition, requestMicrophonePermission, t, apiCooldownEndTime]);

  // Stop recording function
  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    setErrorMessage('');
    
    // SpeechRecognition API'yi durdur
    cleanupRecognition();
    
    // AudioRecorder'ı durdur ve ses blobunu al
    try {
      isTranscribing.current = true;
      setIsTranslating(true);
      
      const audioBlob = await audioRecorderRef.current?.stopRecording();
      
      if (!audioBlob) {
        throw new Error('Ses kaydı alınamadı');
      }
      
      // Ses dosyasının kalitesini kontrol et
      const qualityCheck = checkAudioQuality(audioBlob);
      if (qualityCheck.warning) {
        console.warn(qualityCheck.warning);
        // Çok küçük ses dosyaları için uyarı
        if (qualityCheck.tooSmall) {
          toast.warn(qualityCheck.warning);
          setIsTranslating(false);
          isTranscribing.current = false;
          return;
        }
      }
      
      // Ses URL'ini oluştur
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      
      // Ses dosyasını API için optimize et
      let processedAudioBlob = audioBlob;
      try {
        processedAudioBlob = await optimizeAudioForAPI(audioBlob);
      } catch (error) {
        console.warn('Ses optimizasyonu başarısız, orijinal ses kullanılıyor:', error);
      }
      
      // Ses dosyasını metne dönüştür
      const transcribeLanguage = sourceLanguage === 'auto' ? undefined : sourceLanguage;
      const { text } = await transcribeAudio(processedAudioBlob, transcribeLanguage);
      
      if (!text || text.trim() === '') {
        toast.warn(t('no_speech_detected'));
        setIsTranslating(false);
        isTranscribing.current = false;
        return;
      }
      
      setSourceText(text);
      
      // Metni tercüme et ve sonuçları göster
      await translateSourceText(text, sourceLanguage, targetLanguage);
      
      // API kullanım bilgilerini güncelle
      updateApiUsageInfo();
      
    } catch (error: any) {
      console.error('Ses işleme hatası:', error);
      
      if (error.message?.includes('API istek limiti aşıldı')) {
        // Rate limit hatası - cooldown süresi ayarla
        const cooldownMinutes = 10;
        const cooldownEndTime = Date.now() + (cooldownMinutes * 60 * 1000);
        setApiCooldownEndTime(cooldownEndTime);
        setShowRateLimitHelper(true);
        setErrorMessage(`${t('api_rate_limit_exceeded')} ${cooldownMinutes} ${t('minutes')}.`);
      } else {
        setErrorMessage(error.message || t('transcription_error'));
      }
    } finally {
      setIsTranslating(false);
      isTranscribing.current = false;
    }
  }, [cleanupRecognition, sourceLanguage, targetLanguage, t, updateApiUsageInfo]);

  // Translate the source text
  const translateSourceText = useCallback(async (
    text: string,
    fromLang: string,
    toLang: string
  ) => {
    if (!text || text.trim() === '') {
      setTargetText('');
      return;
    }
    
    setIsTranslating(true);
    setErrorMessage('');
    
    try {
      // Önbellekte çeviri var mı kontrol et
      try {
        const cachedTranslation = await translationCache.get(text, fromLang, toLang);
        if (cachedTranslation) {
          setTargetText(cachedTranslation.translatedText);
          setConfidence(cachedTranslation.confidence);
          setIsTranslating(false);
          console.log('Çeviri önbellekten alındı');
          return;
        }
      } catch (error) {
        console.warn('Önbellek kontrolü başarısız:', error);
      }
      
      // Büyük metinler için bölümlere ayırarak çeviri yap
      const result = await translateLargeText(text, fromLang, toLang);
      
      setTargetText(result.translatedText);
      setConfidence(result.confidence);
      
      // Başarılı çeviriyi önbelleğe kaydet
      try {
        await translationCache.set(
          text,
          result.translatedText,
          fromLang,
          toLang,
          result.confidence
        );
      } catch (error) {
        console.warn('Çeviri önbelleğe kaydedilemedi:', error);
      }
      
    } catch (error: any) {
      console.error('Çeviri hatası:', error);
      
      if (error.message?.includes('API istek limiti aşıldı')) {
        // Rate limit hatası - cooldown süresi ayarla
        const cooldownMinutes = 10;
        const cooldownEndTime = Date.now() + (cooldownMinutes * 60 * 1000);
        setApiCooldownEndTime(cooldownEndTime);
        setShowRateLimitHelper(true);
        setErrorMessage(`${t('api_rate_limit_exceeded')} ${cooldownMinutes} ${t('minutes')}.`);
      } else {
        setErrorMessage(error.message || t('translation_error'));
      }
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Handle source text change
  const handleSourceTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
  }, []);

  // Handle translate button click
  const handleTranslateClick = useCallback(() => {
    translateSourceText(sourceText, sourceLanguage, targetLanguage);
  }, [sourceText, sourceLanguage, targetLanguage, translateSourceText]);

  // Handle source language change
  const handleSourceLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceLanguage(e.target.value);
  }, []);

  // Handle target language change
  const handleTargetLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetLanguage(e.target.value);
  }, []);

  // Swap languages
  const handleSwapLanguages = useCallback(() => {
    if (sourceLanguage === 'auto') return;
    
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
    
    // Select elementlerini de güncelle
    if (sourceLangSelectRef.current) {
      sourceLangSelectRef.current.value = targetLanguage;
    }
    
    if (targetLangSelectRef.current) {
      targetLangSelectRef.current.value = sourceLanguage;
    }
  }, [sourceLanguage, targetLanguage, sourceText, targetText]);

  // Copy text to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('text_copied'));
    }).catch(err => {
      console.error('Panoya kopyalama hatası:', err);
      toast.error(t('copy_failed'));
    });
  }, [t]);

  // Play audio
  const playAudio = useCallback(() => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play().catch(error => {
        console.error('Ses çalma hatası:', error);
        toast.error(t('audio_play_error'));
      });
    }
  }, [audioURL, t]);

  // Clear texts
  const clearTexts = useCallback(() => {
    setSourceText('');
    setTargetText('');
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    setErrorMessage('');
  }, [audioURL]);

  // Handle clear cache button click
  const handleClearCache = useCallback(async () => {
    try {
      await translationCache.clearCache();
      toast.success(t('cache_cleared'));
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
      toast.error(t('cache_clear_error'));
    }
  }, [t]);

  // Remaining time for API cooldown
  const remainingCooldownTime = useCallback(() => {
    if (apiCooldownEndTime <= Date.now()) return '';
    
    const remainingSecs = Math.ceil((apiCooldownEndTime - Date.now()) / 1000);
    const mins = Math.floor(remainingSecs / 60);
    const secs = remainingSecs % 60;
    
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [apiCooldownEndTime]);

  return (
    <div className="translation-panel">
      {/* Source text area */}
      <div className="translation-box source-box">
        <div className="language-selector">
          <select 
            value={sourceLanguage}
            onChange={handleSourceLanguageChange}
            ref={sourceLangSelectRef}
          >
            <option value="auto">{t('auto_detect')}</option>
            {Object.entries(SupportedLanguages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          
          <div className="recording-controls">
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="record-button recording"
                title={t('stop_recording')}
              >
                {isTranslating ? <SpinnerIcon /> : <PauseIconCustom />}
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="record-button"
                title={t('start_recording')}
                disabled={isTranslating}
              >
                <MicIcon />
              </button>
            )}
          </div>
        </div>
        
        <textarea 
          value={sourceText}
          onChange={handleSourceTextChange}
          placeholder={t('enter_source_text')}
          disabled={isRecording || isTranslating}
        />
        
        <div className="actions">
          {audioURL && (
            <button onClick={playAudio} title={t('play_audio')}>
              <SpeakerIcon />
            </button>
          )}
          
          <button 
            onClick={() => copyToClipboard(sourceText)}
            disabled={!sourceText}
            title={t('copy_text')}
          >
            <CopyIcon />
          </button>
          
          <button 
            onClick={clearTexts}
            disabled={!sourceText && !targetText}
            title={t('clear_text')}
          >
            <XMarkIcon />
          </button>
        </div>
      </div>
      
      {/* Swap button */}
      <button 
        className="swap-button"
        onClick={handleSwapLanguages}
        disabled={sourceLanguage === 'auto' || isRecording || isTranslating}
        title={t('swap_languages')}
      >
        ↔
      </button>
      
      {/* Target text area */}
      <div className="translation-box target-box">
        <div className="language-selector">
          <select 
            value={targetLanguage}
            onChange={handleTargetLanguageChange}
            ref={targetLangSelectRef}
          >
            {Object.entries(SupportedLanguages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleTranslateClick}
            disabled={!sourceText || isTranslating || isRecording}
            className="translate-button"
            title={t('translate')}
          >
            {isTranslating ? <SpinnerIcon /> : <TranslateIcon />}
          </button>
        </div>
        
        <textarea 
          value={targetText}
          readOnly 
          placeholder={t('translation_will_appear_here')}
        />
        
        <div className="actions">
          <button 
            onClick={() => copyToClipboard(targetText)}
            disabled={!targetText}
            title={t('copy_text')}
          >
            <CopyIcon />
          </button>
          
          {/* API Kullanım bilgileri */}
          <div className="api-usage-info">
            <span title={t('daily_api_usage')}>
              {apiUsageInfo.dailyRequests}/{apiUsageInfo.dailyRequests + apiUsageInfo.dailyRemaining}
            </span>
            
            {/* Önbellek temizleme butonu */}
            <button 
              onClick={handleClearCache}
              className="clear-cache-button"
              title={t('clear_cache')}
            >
              🗑️
            </button>
            
            {/* API cooldown süresi */}
            {apiCooldownEndTime > Date.now() && (
              <span className="cooldown-timer" title={t('api_cooldown')}>
                ⏱️ {remainingCooldownTime()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Translation confidence */}
      {confidence > 0 && (
        <div className="confidence">
          {t('confidence')}: {Math.round(confidence * 100)}%
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {/* Permission Helper */}
      {showPermissionHelper && (
        <PermissionHelper 
          permissionType={permissionType}
          onRequestPermission={() => {
            setShowPermissionHelper(false);
            requestMicrophonePermission().then(granted => {
              if (granted) {
                startRecording();
              }
            });
          }}
          onClose={() => setShowPermissionHelper(false)}
        />
      )}
      
      {/* Rate Limit Helper */}
      {showRateLimitHelper && (
        <RateLimitHelper
          cooldownEndTime={apiCooldownEndTime}
          dailyUsage={apiUsageInfo.dailyRequests}
          dailyLimit={apiUsageInfo.dailyRequests + apiUsageInfo.dailyRemaining}
          onClose={() => setShowRateLimitHelper(false)}
        />
      )}
    </div>
  );
};

export default TranslationPanel; 