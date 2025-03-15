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
  | 'translating'
  | 'simultane_translation'
  | 'swap_languages'
  | 'clear_text'
  | 'copy_text'
  | 'text_copied'
  | 'copy_failed'
  | 'stop_recording'
  | 'play_audio'
  | 'audio_play_error'
  | 'enter_source_text'
  | 'translation_will_appear_here'
  | 'auto_detect'
  | 'confidence'
  | 'no_speech_detected'
  | 'transcription_error'
  | 'rate_limit_helper_title'
  | 'rate_limit_helper_desc'
  | 'rate_limit_helper_cooldown'
  | 'rate_limit_helper_recommendations'
  | 'rate_limit_helper_rec1'
  | 'rate_limit_helper_rec2'
  | 'rate_limit_helper_rec3'
  | 'rate_limit_helper_rec4'
  | 'api_rate_limit_exceeded'
  | 'api_rate_limit_exceeded_daily'
  | 'api_cooldown'
  | 'daily_api_usage'
  | 'clear_cache'
  | 'cache_cleared'
  | 'cache_clear_error'
  | 'minutes';

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
    translating: 'Translating your text...',
    simultane_translation: 'Simultaneous Translation',
    swap_languages: 'Swap languages',
    clear_text: 'Clear text',
    copy_text: 'Copy text',
    text_copied: 'Text copied to clipboard',
    copy_failed: 'Failed to copy text',
    stop_recording: 'Stop recording',
    play_audio: 'Play audio',
    audio_play_error: 'Error playing audio',
    enter_source_text: 'Enter text or start recording',
    translation_will_appear_here: 'Translation will appear here',
    auto_detect: 'Auto detect',
    confidence: 'Confidence',
    no_speech_detected: 'No speech detected. Please try again.',
    transcription_error: 'Error converting speech to text',
    rate_limit_helper_title: 'API Usage Limit Reached',
    rate_limit_helper_desc: 'You have reached the API usage limit. This is in place to prevent abuse and ensure service availability for everyone.',
    rate_limit_helper_cooldown: 'Cooldown Time Remaining:',
    rate_limit_helper_recommendations: 'Recommendations:',
    rate_limit_helper_rec1: 'Wait until the cooldown period ends',
    rate_limit_helper_rec2: 'Use shorter audio recordings',
    rate_limit_helper_rec3: 'Type text instead of recording when possible',
    rate_limit_helper_rec4: 'Use translated content from the cache',
    api_rate_limit_exceeded: 'API request limit exceeded. Please try again in',
    api_rate_limit_exceeded_daily: 'Daily API limit exceeded. Please try again tomorrow.',
    api_cooldown: 'API cooldown time remaining',
    daily_api_usage: 'Daily API usage',
    clear_cache: 'Clear translation cache',
    cache_cleared: 'Translation cache cleared successfully',
    cache_clear_error: 'Error clearing translation cache',
    minutes: 'minutes'
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
    translating: 'Prevođenje vašeg teksta...',
    simultane_translation: 'Simultani prevod',
    swap_languages: 'Zamijeni jezike',
    clear_text: 'Obriši tekst',
    copy_text: 'Kopiraj tekst',
    text_copied: 'Tekst kopiran u međuspremnik',
    copy_failed: 'Nije uspjelo kopiranje teksta',
    stop_recording: 'Zaustavi snimanje',
    play_audio: 'Reproduciraj audio',
    audio_play_error: 'Greška pri reprodukciji zvuka',
    enter_source_text: 'Unesite tekst ili započnite snimanje',
    translation_will_appear_here: 'Prijevod će se pojaviti ovdje',
    auto_detect: 'Automatsko prepoznavanje',
    confidence: 'Pouzdanost',
    no_speech_detected: 'Govor nije detektiran. Molimo pokušajte ponovo.',
    transcription_error: 'Greška pri pretvaranju govora u tekst',
    rate_limit_helper_title: 'Dostignut limit korištenja API-ja',
    rate_limit_helper_desc: 'Dostigli ste limit korištenja API-ja. Ovo je postavljeno kako bi se spriječila zloupotreba i osigurala dostupnost usluge za sve.',
    rate_limit_helper_cooldown: 'Preostalo vrijeme hlađenja:',
    rate_limit_helper_recommendations: 'Preporuke:',
    rate_limit_helper_rec1: 'Sačekajte dok period hlađenja ne završi',
    rate_limit_helper_rec2: 'Koristite kraće audio snimke',
    rate_limit_helper_rec3: 'Ukucajte tekst umjesto snimanja kada je moguće',
    rate_limit_helper_rec4: 'Koristite prevedeni sadržaj iz keša',
    api_rate_limit_exceeded: 'Prekoračeno ograničenje API zahtjeva. Pokušajte ponovo za',
    api_rate_limit_exceeded_daily: 'Dnevno ograničenje API-ja prekoračeno. Pokušajte ponovo sutra.',
    api_cooldown: 'Preostalo vrijeme hlađenja API-ja',
    daily_api_usage: 'Dnevno korištenje API-ja',
    clear_cache: 'Očisti keš prijevoda',
    cache_cleared: 'Keš prijevoda uspješno očišćen',
    cache_clear_error: 'Greška prilikom čišćenja keša prijevoda',
    minutes: 'minuta'
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
    translating: 'Metniniz çevriliyor...',
    simultane_translation: 'Eşzamanlı Çeviri',
    swap_languages: 'Dilleri değiştir',
    clear_text: 'Metni temizle',
    copy_text: 'Metni kopyala',
    text_copied: 'Metin panoya kopyalandı',
    copy_failed: 'Metin kopyalanamadı',
    stop_recording: 'Kaydı durdur',
    play_audio: 'Sesi oynat',
    audio_play_error: 'Ses oynatma hatası',
    enter_source_text: 'Metin girin veya kayıt başlatın',
    translation_will_appear_here: 'Çeviri burada görünecek',
    auto_detect: 'Otomatik algıla',
    confidence: 'Güven',
    no_speech_detected: 'Konuşma algılanmadı. Lütfen tekrar deneyin.',
    transcription_error: 'Konuşmayı metne dönüştürme hatası',
    rate_limit_helper_title: 'API Kullanım Limiti Aşıldı',
    rate_limit_helper_desc: 'API kullanım limitine ulaştınız. Bu sınırlama, kötüye kullanımı önlemek ve herkes için hizmet kullanılabilirliğini sağlamak için konulmuştur.',
    rate_limit_helper_cooldown: 'Kalan Bekleme Süresi:',
    rate_limit_helper_recommendations: 'Öneriler:',
    rate_limit_helper_rec1: 'Bekleme süresi bitene kadar bekleyin',
    rate_limit_helper_rec2: 'Daha kısa ses kayıtları kullanın',
    rate_limit_helper_rec3: 'Mümkün olduğunda kayıt yerine metin yazın',
    rate_limit_helper_rec4: 'Önbellekteki çevrilmiş içeriği kullanın',
    api_rate_limit_exceeded: 'API istek limiti aşıldı. Lütfen şu kadar süre sonra tekrar deneyin:',
    api_rate_limit_exceeded_daily: 'Günlük API limiti aşıldı. Lütfen yarın tekrar deneyin.',
    api_cooldown: 'API bekleme süresi',
    daily_api_usage: 'Günlük API kullanımı',
    clear_cache: 'Çeviri önbelleğini temizle',
    cache_cleared: 'Çeviri önbelleği başarıyla temizlendi',
    cache_clear_error: 'Çeviri önbelleği temizlenirken hata oluştu',
    minutes: 'dakika'
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