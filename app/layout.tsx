import type { Metadata, Viewport } from 'next'; // Viewport қосылды
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/AuthContext';
import './globals.css';
import PWARegister from '@/components/PWARegister';



const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Ashyq Bilim',
  description: 'Интерактивное обучение веб-разработке с тестами, отслеживанием прогресса и админ-панелью.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ashyq Bilim',
  },
  // themeColor мұнда БОЛМАУЫ КЕРЕК
};

// themeColor-ды осылай бөлек шығарамыз:
export const viewport: Viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">

        <PWARegister />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}