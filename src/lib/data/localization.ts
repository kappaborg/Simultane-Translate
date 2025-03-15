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
  | 'speech_recognition_not_available'
  | 'permission_helper_mic_title'
  | 'permission_helper_speech_title'
  | 'permission_helper_mic_desc'
  | 'permission_helper_speech_desc'
  | 'permission_helper_steps'
  | 'permission_helper_step1'
  | 'permission_helper_step2'
  | 'permission_helper_step3'
  | 'permission_helper_step4'
  | 'permission_helper_request_button'
  | 'rate_limit_error'
  | 'rate_limit_description'
  | 'rate_limit_wait_message'
  | 'rate_limit_retry_now'
  | 'rate_limit_retry_button'
  | 'translating';

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
    speech_recognition_not_available: 'Speech recognition service is not available.',
    permission_helper_mic_title: 'Microphone Permission Required',
    permission_helper_speech_title: 'Speech Recognition Permission Required',
    permission_helper_mic_desc: 'To use this feature, you need to allow your browser to access your microphone.',
    permission_helper_speech_desc: 'You need to update your browser permissions for the speech recognition service to work properly.',
    permission_helper_steps: 'What you need to do:',
    permission_helper_step1: 'Click on the lock/permission icon in your browser address bar',
    permission_helper_step2: 'Open site settings or permissions menu',
    permission_helper_step3: 'Set microphone permissions to "Allow"',
    permission_helper_step4: 'Refresh the page and try again',
    permission_helper_request_button: 'Request Permission',
    rate_limit_error: 'OpenAI API rate limit exceeded',
    rate_limit_description: 'The OpenAI API rate limit has been reached. This means the API is receiving too many requests and is temporarily limiting new requests.',
    rate_limit_wait_message: 'Please wait {0} seconds and try again.',
    rate_limit_retry_now: 'You can try again now.',
    rate_limit_retry_button: 'Retry',
    translating: 'Translating your text...'
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
    speech_recognition_not_available: 'Usluga prepoznavanja govora nije dostupna.',
    permission_helper_mic_title: 'Potrebna Dozvola za Mikrofon',
    permission_helper_speech_title: 'Potrebna Dozvola za Prepoznavanje Govora',
    permission_helper_mic_desc: 'Da biste koristili ovu funkciju, trebate dopustiti svom pregledniku pristup mikrofonu.',
    permission_helper_speech_desc: 'Trebate ažurirati dozvole preglednika da bi usluga prepoznavanja govora radila ispravno.',
    permission_helper_steps: 'Što trebate učiniti:',
    permission_helper_step1: 'Kliknite na ikonu brave/dozvole u adresnoj traci preglednika',
    permission_helper_step2: 'Otvorite postavke stranice ili izbornik dozvola',
    permission_helper_step3: 'Postavite dozvole za mikrofon na "Dozvoli"',
    permission_helper_step4: 'Osvježite stranicu i pokušajte ponovo',
    permission_helper_request_button: 'Zatraži Dozvolu',
    rate_limit_error: 'OpenAI API ograničenje stope je prekoračeno',
    rate_limit_description: 'Dosegnuto je ograničenje stope OpenAI API-ja. To znači da API prima previše zahtjeva i privremeno ograničava nove zahtjeve.',
    rate_limit_wait_message: 'Pričekajte {0} sekundi i pokušajte ponovo.',
    rate_limit_retry_now: 'Sada možete pokušati ponovo.',
    rate_limit_retry_button: 'Pokušaj ponovo',
    translating: 'Prevođenje vašeg teksta...'
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
    speech_recognition_not_available: 'Ses tanıma servisi kullanılamıyor.',
    permission_helper_mic_title: 'Mikrofon İzni Gerekli',
    permission_helper_speech_title: 'Konuşma Tanıma İzni Gerekli',
    permission_helper_mic_desc: 'Bu özelliği kullanmak için tarayıcınızın mikrofonunuza erişmesine izin vermeniz gerekiyor.',
    permission_helper_speech_desc: 'Konuşma tanıma hizmetinin düzgün çalışması için tarayıcı izinlerini güncellemeniz gerekiyor.',
    permission_helper_steps: 'Yapmanız gerekenler:',
    permission_helper_step1: 'Tarayıcı adres çubuğundaki kilit/izin simgesine tıklayın',
    permission_helper_step2: 'Site ayarları veya izinler menüsünü açın',
    permission_helper_step3: 'Mikrofon izinlerini "İzin Ver" olarak ayarlayın',
    permission_helper_step4: 'Sayfayı yenileyin ve tekrar deneyin',
    permission_helper_request_button: 'İzin İste',
    rate_limit_error: 'OpenAI API istek limiti aşıldı',
    rate_limit_description: 'OpenAI API istek sınırlarına ulaşıldı. Bu, API\'nin çok fazla istek aldığı ve geçici olarak yeni istekleri sınırladığı anlamına gelir.',
    rate_limit_wait_message: 'Lütfen {0} saniye bekleyin ve tekrar deneyin.',
    rate_limit_retry_now: 'Şimdi tekrar deneyebilirsiniz.',
    rate_limit_retry_button: 'Tekrar Dene',
    translating: 'Metniniz çevriliyor...'
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