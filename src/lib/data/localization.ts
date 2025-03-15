export type LocalizationKey = 
  | 'app_title'
  | 'app_description'
  | 'translate'
  | 'history'
  | 'settings'
  | 'source_language'
  | 'target_language'
  | 'advanced_mode'
  | 'start_recording'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'recording'
  | 'paused'
  | 'original_text'
  | 'translation'
  | 'browser_not_supported'
  | 'browser_not_supported_description'
  | 'translation_settings'
  | 'processing_audio'
  | 'microphone_access_denied'
  | 'speech_recognition_error'
  | 'audio_processing_error'
  | 'translation_error'
  | 'browser_https_required'
  | 'speech_recognition_error_not_allowed'
  | 'speech_recognition_error_mic_denied'
  | 'speech_recognition_error_no_speech'
  | 'speech_recognition_error_network'
  | 'speech_recognition_start_error'
  | 'speech_recognition_not_available';

type LocalizationMap = Record<LocalizationKey, string>;

export type Localizations = Record<string, LocalizationMap>;

export const localizations: Localizations = {
  en: {
    app_title: 'Simultane Translation',
    app_description: 'Real-time speech translation with high accuracy and low latency. Speak in one language, get instant translations in another.',
    translate: 'Translate',
    history: 'History',
    settings: 'Settings',
    source_language: 'Source language',
    target_language: 'Target language',
    advanced_mode: 'Advanced mode (high accuracy)',
    start_recording: 'Start Recording',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    recording: 'Recording...',
    paused: 'Paused',
    original_text: 'Original Text',
    translation: 'Translation',
    browser_not_supported: 'Browser Not Supported',
    browser_not_supported_description: 'Your browser does not support speech recognition. Please try using Chrome, Edge, or Safari.',
    translation_settings: 'Translation Settings',
    processing_audio: 'Processing audio and converting to text...',
    microphone_access_denied: 'Microphone access denied. Please check browser permissions.',
    speech_recognition_error: 'Speech recognition error: {0}',
    audio_processing_error: 'Audio recording processing error: {0}',
    translation_error: 'Translation error: {0}',
    browser_https_required: 'Speech recognition feature is only available over HTTPS. Please use a secure connection.',
    speech_recognition_error_not_allowed: 'Access to speech recognition service was denied. Please check browser permissions and ensure you are using an HTTPS connection.',
    speech_recognition_error_mic_denied: 'Microphone access denied. Please check browser permissions.',
    speech_recognition_error_no_speech: 'No speech detected. Please check your microphone and try again.',
    speech_recognition_error_network: 'Network error. Please check your internet connection.',
    speech_recognition_start_error: 'Failed to start speech recognition. Please check browser permissions.',
    speech_recognition_not_available: 'Speech recognition service is not available.'
  },
  bs: {
    app_title: 'Simultano Prevođenje',
    app_description: 'Prevođenje govora u realnom vremenu s visokom tačnošću i niskom latencijom. Govorite na jednom jeziku, dobijte trenutne prevode na drugom.',
    translate: 'Prevedi',
    history: 'Historija',
    settings: 'Postavke',
    source_language: 'Izvorni jezik',
    target_language: 'Ciljni jezik',
    advanced_mode: 'Napredni način (visoka tačnost)',
    start_recording: 'Počni Snimanje',
    pause: 'Pauziraj',
    resume: 'Nastavi',
    stop: 'Zaustavi',
    recording: 'Snimanje...',
    paused: 'Pauzirano',
    original_text: 'Originalni Tekst',
    translation: 'Prijevod',
    browser_not_supported: 'Preglednik Nije Podržan',
    browser_not_supported_description: 'Vaš preglednik ne podržava prepoznavanje govora. Pokušajte koristiti Chrome, Edge ili Safari.',
    translation_settings: 'Postavke Prevođenja',
    processing_audio: 'Obrada zvuka i pretvaranje u tekst...',
    microphone_access_denied: 'Pristup mikrofonu odbijen. Provjerite dozvole preglednika.',
    speech_recognition_error: 'Greška prepoznavanja govora: {0}',
    audio_processing_error: 'Greška obrade zvučnog zapisa: {0}',
    translation_error: 'Greška prevođenja: {0}',
    browser_https_required: 'Funkcija prepoznavanja govora dostupna je samo preko HTTPS-a. Koristite sigurnu vezu.',
    speech_recognition_error_not_allowed: 'Pristup usluzi prepoznavanja govora je odbijen. Provjerite dozvole preglednika i osigurajte da koristite HTTPS vezu.',
    speech_recognition_error_mic_denied: 'Pristup mikrofonu odbijen. Provjerite dozvole preglednika.',
    speech_recognition_error_no_speech: 'Govor nije otkriven. Provjerite mikrofon i pokušajte ponovo.',
    speech_recognition_error_network: 'Greška mreže. Provjerite internetsku vezu.',
    speech_recognition_start_error: 'Nije uspjelo pokretanje prepoznavanja govora. Provjerite dozvole preglednika.',
    speech_recognition_not_available: 'Usluga prepoznavanja govora nije dostupna.'
  },
  tr: {
    app_title: 'Eşzamanlı Çeviri',
    app_description: 'Yüksek doğruluk ve düşük gecikme ile gerçek zamanlı konuşma çevirisi. Bir dilde konuşun, anında başka bir dilde çeviri alın.',
    translate: 'Çevir',
    history: 'Geçmiş',
    settings: 'Ayarlar',
    source_language: 'Kaynak dil',
    target_language: 'Hedef dil',
    advanced_mode: 'Gelişmiş mod (yüksek doğruluk)',
    start_recording: 'Kayda Başla',
    pause: 'Duraklat',
    resume: 'Devam Et',
    stop: 'Durdur',
    recording: 'Kaydediyor...',
    paused: 'Duraklatıldı',
    original_text: 'Orijinal Metin',
    translation: 'Çeviri',
    browser_not_supported: 'Tarayıcı Desteklenmiyor',
    browser_not_supported_description: 'Tarayıcınız konuşma tanıma özelliğini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.',
    translation_settings: 'Çeviri Ayarları',
    processing_audio: 'Ses işleniyor ve metne dönüştürülüyor...',
    microphone_access_denied: 'Mikrofon erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.',
    speech_recognition_error: 'Konuşma tanıma hatası: {0}',
    audio_processing_error: 'Ses kaydı işleme hatası: {0}',
    translation_error: 'Çeviri hatası: {0}',
    browser_https_required: 'Ses tanıma özelliği yalnızca HTTPS üzerinden kullanılabilir. Lütfen güvenli bir bağlantı kullanın.',
    speech_recognition_error_not_allowed: 'Ses tanıma servisine erişim izni verilmedi. Lütfen tarayıcı izinlerini kontrol edin ve HTTPS bağlantısı kullandığınızdan emin olun.',
    speech_recognition_error_mic_denied: 'Mikrofon erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.',
    speech_recognition_error_no_speech: 'Ses algılanamadı. Lütfen mikrofonunuzu kontrol edin ve tekrar deneyin.',
    speech_recognition_error_network: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
    speech_recognition_start_error: 'Ses tanıma başlatılamadı. Lütfen tarayıcı izinlerini kontrol edin.',
    speech_recognition_not_available: 'Ses tanıma servisi kullanılamıyor.'
  }
};

export const getLocalizedString = (key: LocalizationKey, locale: string = 'en', ...args: string[]): string => {
  const localization = localizations[locale] || localizations.en;
  let text = localization[key] || localizations.en[key];
  
  // Replace placeholders with arguments
  args.forEach((arg, index) => {
    text = text.replace(`{${index}}`, arg);
  });
  
  return text;
}; 