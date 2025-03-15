import ClientAnalytics from '@/components/analytics/ClientAnalytics';
import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true, // Kullanıcının zoom yapabilmesine izin ver
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export const metadata: Metadata = {
  title: 'Simultane Translation',
  description: 'Real-time translation app for multilingual conversations',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Simultane Translation',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

// Analytics bileşenini kaldırıyoruz - gerekirse daha sonra ekleyebiliriz
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth h-full" suppressHydrationWarning>
      <head />
      <body 
        className={`${inter.className} bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen 
                  transition-colors duration-300 flex flex-col antialiased`} 
        suppressHydrationWarning
      >
        {/* 
          Tema script'i - vanilla JavaScript ile tarayıcıda çalışır.
          Sunucu tarafında çalışmaz, hydration sorunlarına neden olmaz.
        */}
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var savedTheme = localStorage.getItem('theme');
                  
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Sessizce devam et
                }
              })();
            `
          }}
        />
        <div className="flex flex-col flex-grow">
          {children}
        </div>
        <ClientAnalytics />
      </body>
    </html>
  );
}
