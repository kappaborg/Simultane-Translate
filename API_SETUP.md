# Simultane Translation - API Kurulum Rehberi

Bu projenin çalışması için iki API hizmetine ihtiyaç vardır:

1. **OpenAI API** - Ses tanıma (speech-to-text) için
2. **Çeviri API'leri** - Metin çevirisi için (LibreTranslate veya Microsoft Translator)

## 1. OpenAI API Anahtarı

OpenAI API, Whisper modelini kullanarak ses dosyalarını metne dönüştürmek için kullanılır.

### Nasıl Alınır:

1. [OpenAI'ın resmi sitesine](https://platform.openai.com/signup) gidin
2. Bir hesap oluşturun (hesabınız varsa giriş yapın)
3. [API Keys](https://platform.openai.com/api-keys) bölümüne gidin
4. "Create new secret key" butonuna tıklayın
5. API anahtarınızı kaydedin (anahtar sadece bir kez gösterilir)

## 2. Çeviri API'si Seçenekleri

DeepL yerine iki alternatif API sunuyoruz:

### Seçenek A: LibreTranslate API (Önerilen, Açık Kaynak)

[LibreTranslate](https://libretranslate.com/) açık kaynaklı bir çeviri API'sidir ve şu seçeneklere sahiptir:

1. **Ücretsiz Public API**: Sınırlı kullanım, API anahtarı isteğe bağlı
   - [LibreTranslate API](https://libretranslate.com/docs) sayfasından kullanabilirsiniz
   - `.env.local` dosyasında `LIBRETRANSLATE_API_URL=https://libretranslate.com/translate` ayarlayın

2. **Yerel Kurulum**: Sınırsız kullanım, API anahtarı gerektirmez
   - [GitHub Repo](https://github.com/LibreTranslate/LibreTranslate) üzerinden kurulum yapın
   - Yerel sunucunuz için `.env.local` dosyasında `LIBRETRANSLATE_API_URL=http://localhost:5000/translate` ayarlayın

3. **Özel Sunucular**: Çeşitli topluluk tarafından sağlanan sunucular
   - [Alternatif Sunucular Listesi](https://github.com/LibreTranslate/LibreTranslate#mirrors)

### Seçenek B: Microsoft Translator API

Microsoft Translator daha geniş dil desteği sunar ve Azure portalı üzerinden alınabilir.

1. [Azure portalına](https://portal.azure.com/) gidin
2. Bir Azure hesabı oluşturun (hesabınız varsa giriş yapın)
3. "Create a resource" > "AI + Machine Learning" > "Translator" seçin
4. Gerekli bilgileri girin ve servisi oluşturun
5. Servis oluşturulduktan sonra "Keys and Endpoint" bölümünden API anahtarınızı alın
6. `.env.local` dosyasında `TRANSLATION_API_PROVIDER=microsoft` olarak ayarlayın

## API Anahtarlarını Yapılandırma

1. Proje kök dizininde `.env.local` dosyası oluşturun
2. Aşağıdaki şablonu kullanarak API anahtarlarınızı ekleyin:

```
# OpenAI API anahtarı (Whisper ses tanıma için)
OPENAI_API_KEY=sk-your_openai_key_here

# Hangi çeviri API'sini kullanacağınızı seçin: 'microsoft' veya 'libre'
TRANSLATION_API_PROVIDER=libre

# LibreTranslate kullanmak istiyorsanız:
LIBRETRANSLATE_API_URL=https://libretranslate.com/translate
LIBRETRANSLATE_API_KEY=your_libretranslate_api_key_here  # Opsiyonel

# Microsoft Translator kullanmak istiyorsanız:
MICROSOFT_TRANSLATOR_KEY=your_microsoft_translator_key_here
MICROSOFT_TRANSLATOR_REGION=global  # Veya uygun Azure bölgesi
```

3. Uygulamayı başlatın:

```
npm run dev
```

## Demo Modu

Eğer API anahtarlarını yapılandırmazsanız, uygulama otomatik olarak "demo modunda" çalışır. Bu modda, gerçek API çağrıları yerine simüle edilmiş yanıtlar kullanılır. Bu, geliştirme aşamasında API anahtarları olmadan temel işlevselliği test etmenize olanak tanır.

## Not

- API anahtarlarınızı kimseyle paylaşmayın
- API kullanımı, ilgili servis sağlayıcısının kullanım koşullarına ve fiyatlandırma planına tabidir
- Geliştirme aşamasında, kullanım maliyetlerini düşük tutmak için küçük ses dosyaları ve kısa metinlerle test etmeniz önerilir 