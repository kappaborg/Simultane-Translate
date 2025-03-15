# Simultane Translation

Real-time translation application for multilingual conversations. This application allows users to record speech in one language and get translations in another language in real-time.

## Features

- ✅ Real-time speech recognition
- ✅ Text-to-text translation
- ✅ Multiple language support
- ✅ Advanced recording mode for high-accuracy transcription
- ✅ Basic mode using Web Speech API
- ✅ Dark/Light theme support
- ✅ Mobile responsive design

## Technologies Used

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **API Integration:** OpenAI Whisper API, Microsoft Translator, LibreTranslate
- **Styling:** Tailwind CSS, Heroicons, shadcn/ui
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/simultane-translation.git
   cd simultane-translation
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Choose 'microsoft' or 'libre'
   TRANSLATION_API_PROVIDER=libre
   
   # For Microsoft Translator
   MICROSOFT_TRANSLATOR_KEY=your_key_here
   MICROSOFT_TRANSLATOR_REGION=your_region_here
   
   # For LibreTranslate
   LIBRETRANSLATE_API_URL=https://libretranslate.com/translate
   LIBRETRANSLATE_API_KEY=your_key_here
   
   # For OpenAI (Whisper API)
   OPENAI_API_KEY=your_key_here
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Select the source language (the language you will speak)
2. Select the target language (the language you want to translate to)
3. Toggle advanced mode if you want higher accuracy (uses OpenAI Whisper API)
4. Click "Start Recording" and begin speaking
5. Your speech will be transcribed and translated in real-time
6. Click "Stop" when finished

## Deployment

This project is configured for easy deployment on Vercel:

1. Fork this repository
2. Connect to Vercel
3. Set up your environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI Whisper API](https://platform.openai.com/docs/api-reference/audio) for advanced speech transcription
- [Microsoft Translator](https://www.microsoft.com/en-us/translator/) for high-quality translation
- [LibreTranslate](https://libretranslate.com/) for open-source translation
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com/) for hosting
