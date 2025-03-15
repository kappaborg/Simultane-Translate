import { AudioRecorderService } from '@/lib/api/audioRecorderService';
import { transcribeAudio, translateText as translate } from '@/lib/api/translationService';
import { useLocalization } from '@/lib/hooks/useLocalization';
import { translationSessionService } from '@/lib/services/translationSessionService';
import { debounce } from '@/lib/utils/helpers';
import { RecordingState, TranslationResult, TranslationSession } from '@/types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MicrophoneIcon, PauseIcon, PlayIcon, ShieldExclamationIcon, StopIcon } from '@heroicons/react/24/solid';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ExportPanel from './ExportPanel';
import LanguageSelector from './LanguageSelector';

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

// İzin Yardımcısı bilgi paneli bileşeni
const PermissionHelper: React.FC<{
  permissionType: 'microphone' | 'speech-recognition';
  onRequestPermission: () => void;
}> = ({ permissionType, onRequestPermission }) => {
  const { t } = useLocalization();
  
  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
      <div className="flex items-start">
        <ShieldExclamationIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {permissionType === 'microphone' 
              ? t('permission_helper_mic_title', 'Mikrofon İzni Gerekli') 
              : t('permission_helper_speech_title', 'Konuşma Tanıma İzni Gerekli')}
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-200 space-y-2">
            <p>
              {permissionType === 'microphone' 
                ? t('permission_helper_mic_desc', 'Bu özelliği kullanmak için tarayıcınızın mikrofon erişimine izin vermeniz gerekiyor.') 
                : t('permission_helper_speech_desc', 'Konuşma tanıma hizmetinin düzgün çalışması için tarayıcı izinlerini güncellemeniz gerekiyor.')}
            </p>
            <div className="space-y-1">
              <p className="font-medium">{t('permission_helper_steps', 'Yapmanız gerekenler:')}</p>
              <ul className="list-disc list-inside ml-2 text-xs">
                <li>{t('permission_helper_step1', 'Tarayıcı adres çubuğundaki kilit/izin simgesine tıklayın')}</li>
                <li>{t('permission_helper_step2', 'Site ayarları veya izinler menüsünü açın')}</li>
                <li>{t('permission_helper_step3', 'Mikrofon izinlerini "İzin Ver" olarak ayarlayın')}</li>
                <li>{t('permission_helper_step4', 'Sayfayı yenileyin ve tekrar deneyin')}</li>
              </ul>
            </div>
            <button
              onClick={onRequestPermission}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 text-xs rounded-md inline-flex items-center"
            >
              <MicrophoneIcon className="h-4 w-4 mr-1" />
              {t('permission_helper_request_button', 'İzin İste')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TranslationPanel: React.FC = () => {
  const { t, locale } = useLocalization();
  
  // Configuration and state
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [transcript, setTranscript] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [currentSession, setCurrentSession] = useState<TranslationSession | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true); // Default to true to avoid hydration mismatch
  const [showPermissionHelper, setShowPermissionHelper] = useState(false);
  const [permissionType, setPermissionType] = useState<'microphone' | 'speech-recognition'>('microphone');
  
  // Refs
  const audioRecorder = useRef<AudioRecorderService | null>(null);
  
  // Check browser support for speech recognition on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const speechRecognitionCheck = checkSpeechRecognitionAvailability();
      const supported = speechRecognitionCheck.available;
      
      setBrowserSupported(supported);
      
      // Eğer API destekleniyor ama güvenlik nedeniyle kullanılamıyorsa
      if (!supported && speechRecognitionCheck.reason === 'not-secure') {
        setError(t('browser_https_required', 'Ses tanıma özelliği yalnızca HTTPS üzerinden kullanılabilir. Lütfen HTTPS bağlantısı kullanın.'));
      }
    }
  }, []);
  
  // Effect to initialize audioRecorder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRecorder.current = new AudioRecorderService();
    }
    
    // Clean up on unmount
    return () => {
      if (speechRecognitionInstance) {
        (speechRecognitionInstance as any).stop();
      }
      
      if (audioRecorder.current) {
        audioRecorder.current.stopRecording();
      }
      
      // End and save session if active
      if (currentSession) {
        translationSessionService.endSession(currentSession);
      }
    };
  }, []);
  
  // Handle speech recognition result
  const handleSpeechResult = useCallback((event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript;
    setTranscript(text);
    
    // If this is a final result, translate it
    if (result.isFinal) {
      translateText(text);
    }
  }, [sourceLanguage, targetLanguage]);
  
  // Debounced translation to avoid too many API calls
  const debouncedTranslate = useRef(
    debounce((text: string) => translateText(text), 800)
  ).current;
  
  // Translate the given text
  const translateText = async (text: string) => {
    if (!text || text.trim() === '') return;
    
    try {
      setIsTranslating(true);
      
      // Call the real translation API through our service
      const result = await translate(text, sourceLanguage, targetLanguage);
      setTranslation(result.translatedText);
      
      // Add to current session if one exists
      if (currentSession) {
        const translationResult: Omit<TranslationResult, 'id' | 'timestamp'> = {
          originalText: text,
          translatedText: result.translatedText,
          sourceLanguage,
          targetLanguage,
          confidence: result.confidence || 0.85,
          duration: 500
        };
        
        const updatedSession = translationSessionService.addTranslation(
          currentSession,
          translationResult
        );
        
        setCurrentSession(updatedSession);
        translationSessionService.saveSession(updatedSession);
      }
      
      setIsTranslating(false);
      
    } catch (err) {
      setError(t('translation_error', err instanceof Error ? err.message : String(err)));
      setIsTranslating(false);
    }
  };
  
  // Function to process audio blobs for advanced mode
  const processAudioForAdvancedMode = async (blob: Blob) => {
    try {
      setIsTranslating(true);
      setError(null); // Clear previous errors
      
      // Temporary message to inform user about processing
      setTranscript(t('processing_audio'));
      
      // Use our transcription service to transcribe the audio
      const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
      
      try {
        const transcription = await transcribeAudio(audioFile, sourceLanguage);
        
        // Transcription result is now an object, use the text property
        setTranscript(transcription.text);
        
        // Now translate the transcribed text
        await translateText(transcription.text);
      } catch (err) {
        // Display API error message directly
        setError(`${err instanceof Error ? err.message : String(err)}`);
        setTranscript(""); // Clear transcript on error
        setIsTranslating(false);
        return;
      }
      
    } catch (err) {
      setError(t('audio_processing_error', err instanceof Error ? err.message : String(err)));
      setIsTranslating(false);
    }
  };
  
  // Mikrofon izni iste ve erişim durumunu kontrol et
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Tarayıcıda değilsek hemen false döndür
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        return false;
      }

      // Mevcut izin durumunu kontrol et (varsa)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permissionStatus.state === 'granted') {
            return true;
          } else if (permissionStatus.state === 'denied') {
            setError(t('speech_recognition_error_mic_denied'));
            return false;
          }
          // 'prompt' durumunda devam et ve izin iste
        } catch (err) {
          // Bazı tarayıcılar permissions API'yi desteklemez, bu durumda doğrudan izin isteyeceğiz
          console.log('Permissions API not fully supported, proceeding to request access directly');
        }
      }

      // Kullanıcıdan açık şekilde mikrofon erişimi iste
      // Bu, kullanıcının izin vermesi için tarayıcı izin isteğini tetikler
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // İzin verildi, stream'i kapat (zaten amacımız sadece izin istemekti)
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setError(t('speech_recognition_error_mic_denied'));
      return false;
    }
  };

  // Error handling helper function
  const handleRecognitionError = useCallback((errorType: string, errorMsg: string) => {
    console.error('Speech Recognition Error:', errorType);
    setError(errorMsg);
    
    // Show permission helper for specific permission errors
    if (errorType === 'service-not-allowed' || errorType === 'not-allowed') {
      setPermissionType(errorType === 'service-not-allowed' ? 'speech-recognition' : 'microphone');
      setShowPermissionHelper(true);
    } else {
      setShowPermissionHelper(false);
    }
  }, []);
  
  // Request permission helper action
  const handleRequestPermission = useCallback(async () => {
    // Request microphone permission again
    const result = await requestMicrophonePermission();
    if (result) {
      setShowPermissionHelper(false);
      setError(null);
      // Wait a bit to give browser time to update permissions
      setTimeout(() => startRecording(), 500);
    }
  }, []);

  // Start recording
  const startRecording = async () => {
    setError(null);
    setTranscript("");
    setTranslation("");
    
    // Önce SpeechRecognition API'nin kullanılabilirliğini kontrol edelim
    const speechCheck = checkSpeechRecognitionAvailability();
    if (!speechCheck.available) {
      if (speechCheck.reason === 'not-supported') {
        setError(t('browser_not_supported_description'));
      } else if (speechCheck.reason === 'not-secure') {
        setError(t('browser_https_required'));
      } else {
        setError(t('speech_recognition_not_available'));
      }
      return;
    }
    
    // Mikrofon izni iste
    const hasMicPermission = await requestMicrophonePermission();
    if (!hasMicPermission) {
      return; // Error already set in the function
    }
    
    // Create a new session if we don't have one
    if (!currentSession) {
      const newSession = translationSessionService.createSession(sourceLanguage, targetLanguage);
      setCurrentSession(newSession);
    }
    
    if (isAdvancedMode) {
      // Advanced mode - use AudioRecorderService
      if (audioRecorder.current) {
        try {
          audioRecorder.current.startRecording(
            undefined, // Real-time processing not needed
            (blob) => processAudioForAdvancedMode(blob)
          );
          setRecordingState('recording');
        } catch (error) {
          setError(t('microphone_access_denied'));
        }
      }
    } else {
      // Basic mode - use Web Speech API
      if (SpeechRecognitionConstructor) {
        try {
          // Önce mevcut instance'ı temizle
          if (speechRecognitionInstance) {
            try {
              (speechRecognitionInstance as any).stop();
              (speechRecognitionInstance as any).onresult = null;
              (speechRecognitionInstance as any).onerror = null;
              (speechRecognitionInstance as any).onend = null;
            } catch (e) {
              console.error('Error cleaning up previous instance:', e);
            }
            speechRecognitionInstance = null;
          }
          
          // Tip dönüşümü ile tarayıcı API'sını kullanıyoruz
          speechRecognitionInstance = new SpeechRecognitionConstructor() as any;
          
          // Tarayıcı desteğine göre ayarları yapılandır
          const recognition = speechRecognitionInstance as any;
          
          // Non-null assertion ile TypeScript hatasını gideriyoruz
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = sourceLanguage;
          recognition.maxAlternatives = 1;
          
          // Tarayıcı desteğine göre ek ayarlar
          if ('serviceURI' in recognition) {
            // Bu özellik sadece Firefox'ta mevcut, ancak Chrome uyumluluğu için de kontrol ediyoruz
            // recognition.serviceURI = 'https://...'; // Eğer özel bir hizmet kullanıyorsanız
          }
          
          // SpeechRecognition servisinin durumu için yeni bir takip mekanizması
          let recognitionActive = false;
          
          // Result handling
          recognition.onresult = handleSpeechResult;
          
          // Error handling with detailed logging
          recognition.onerror = (event: any) => {
            console.error('Speech Recognition Error Details:', {
              error: event.error,
              message: event.message || 'No message provided',
              eventTime: new Date().toISOString()
            });
            
            if (event.error === 'service-not-allowed' || event.error === 'not-allowed') {
              handleRecognitionError(
                event.error, 
                t(event.error === 'service-not-allowed' 
                  ? 'speech_recognition_error_not_allowed' 
                  : 'speech_recognition_error_mic_denied')
              );
            } else if (event.error === 'no-speech') {
              setError(t('speech_recognition_error_no_speech'));
            } else if (event.error === 'network') {
              setError(t('speech_recognition_error_network'));
            } else {
              setError(t('speech_recognition_error', event.error));
            }
            
            recognitionActive = false;
          };
          
          // On end event, restart if active
          recognition.onend = () => {
            console.log('SpeechRecognition ended, active status:', recognitionActive);
            
            if (recognitionActive && recordingState === 'recording') {
              console.log('Attempting to restart recognition service...');
              try {
                // SpeechRecognition servisinin yeniden başlatılması
                recognition.start();
              } catch (restartError) {
                console.error('Error restarting recognition:', restartError);
                setError(t('speech_recognition_start_error'));
                setRecordingState('inactive');
              }
            } else {
              // Normal bir sonlandırma ise kayıt durumunu güncelle
              if (recordingState !== 'paused') {
                setRecordingState('inactive');
              }
            }
          };
          
          // Başlatma öncesi son bir kontrol daha
          console.log('Initializing SpeechRecognition with settings:', {
            language: sourceLanguage,
            continuous: true,
            interimResults: true
          });
          
          try {
            // Servisin etkinleştirilmiş olduğunu işaretle
            recognitionActive = true;
            
            // Servisi başlat
            recognition.start();
            console.log('SpeechRecognition started successfully');
            
            // UI'ı güncelle
            setRecordingState('recording');
          } catch (startError) {
            console.error('Speech Recognition Start Error:', startError);
            recognitionActive = false;
            setError(t('speech_recognition_start_error'));
          }
        } catch (error) {
          console.error('Speech Recognition Init Error:', error);
          setError(t('speech_recognition_error', error instanceof Error ? error.message : String(error)));
        }
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (isAdvancedMode) {
      if (audioRecorder.current) {
        audioRecorder.current.stopRecording();
      }
    } else {
      if (speechRecognitionInstance) {
        (speechRecognitionInstance as any).stop();
      }
    }
    
    setRecordingState('inactive');
    
    // Save the completed session if it exists and has translations
    if (currentSession && currentSession.translations.length > 0) {
      translationSessionService.endSession(currentSession);
      // We don't reset currentSession here to allow exporting
    }
  };
  
  // Pause/resume recording
  const togglePauseRecording = () => {
    if (recordingState === 'recording') {
      if (isAdvancedMode && audioRecorder.current) {
        audioRecorder.current.pauseRecording();
      } else if (speechRecognitionInstance) {
        (speechRecognitionInstance as any).stop();
      }
      setRecordingState('paused');
    } else if (recordingState === 'paused') {
      if (isAdvancedMode && audioRecorder.current) {
        audioRecorder.current.resumeRecording();
      } else if (speechRecognitionInstance) {
        (speechRecognitionInstance as any).start();
      }
      setRecordingState('recording');
    }
  };
  
  // Handle language changes
  const handleSourceLanguageChange = (code: string) => {
    setSourceLanguage(code);
    
    // Update speech recognition language if active
    if (speechRecognitionInstance && recordingState !== 'inactive') {
      (speechRecognitionInstance as any).stop();
      (speechRecognitionInstance as any).lang = code;
      (speechRecognitionInstance as any).start();
    }
    
    // Update session if active
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        sourceLanguage: code
      };
      setCurrentSession(updatedSession);
      translationSessionService.saveSession(updatedSession);
    }
  };
  
  const handleTargetLanguageChange = (code: string) => {
    setTargetLanguage(code);
    
    // Update session if active
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        targetLanguage: code
      };
      setCurrentSession(updatedSession);
      translationSessionService.saveSession(updatedSession);
    }
  };
  
  const toggleAdvancedMode = () => {
    // Can't switch modes while recording
    if (recordingState !== 'inactive') return;
    
    setIsAdvancedMode(!isAdvancedMode);
  };
  
  // Instead of conditional rendering at the component level, use state to show browser warning
  if (!browserSupported) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900 rounded-lg text-center">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
          {t('browser_not_supported')}
        </h2>
        <p className="text-red-600 dark:text-red-200">
          {t('browser_not_supported_description')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{t('translation_settings')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LanguageSelector
            label={t('source_language')}
            value={sourceLanguage}
            onChange={handleSourceLanguageChange}
            showDetect={true}
            disabled={recordingState !== 'inactive'}
          />
          
          <LanguageSelector
            label={t('target_language')}
            value={targetLanguage}
            onChange={handleTargetLanguageChange}
            disabled={recordingState !== 'inactive'}
          />
        </div>
        
        <div className="mt-4 flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded"
              checked={isAdvancedMode}
              onChange={toggleAdvancedMode}
              disabled={recordingState !== 'inactive'}
            />
            <span className="ml-2 text-sm">{t('advanced_mode')}</span>
          </label>
          
          <div className="ml-auto">
            {recordingState === 'inactive' ? (
              <button
                onClick={startRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <MicrophoneIcon className="h-5 w-5 mr-2" />
                {t('start_recording')}
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={togglePauseRecording}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md flex items-center"
                >
                  {recordingState === 'recording' ? (
                    <>
                      <PauseIcon className="h-5 w-5 mr-2" />
                      {t('pause')}
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5 mr-2" />
                      {t('resume')}
                    </>
                  )}
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center"
                >
                  <StopIcon className="h-5 w-5 mr-2" />
                  {t('stop')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {recordingState !== 'inactive' && (
        <div className="mb-6 flex items-center">
          <div className="relative mr-3">
            <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-sm font-medium">
            {recordingState === 'recording' ? t('recording') : t('paused')}
          </span>
        </div>
      )}
      
      {showPermissionHelper && (
        <PermissionHelper 
          permissionType={permissionType}
          onRequestPermission={handleRequestPermission}
        />
      )}
      
      {error && !showPermissionHelper && (
        <div className="mb-6 bg-red-50 dark:bg-red-900 p-4 rounded-md flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {(transcript || translation) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{t('original_text')}</h3>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {sourceLanguage}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="whitespace-pre-wrap">{transcript}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{t('translation')}</h3>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {targetLanguage}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              {isTranslating ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{translation}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {currentSession && currentSession.translations.length > 0 && (
        <ExportPanel 
          session={currentSession} 
          className="mt-6"
        />
      )}
    </div>
  );
};

export default TranslationPanel; 