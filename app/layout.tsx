import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next";
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import { WorldProvider } from '@/context/WorldContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RubinOT Boss Tracker',
  description: 'Track boss spawns and kills across all worlds',
  openGraph: {
    title: 'RubinOT Boss Tracker',
    description: 'Track boss spawns and kills across all worlds',
    url: 'https://rubinot-boss-tracker.vercel.app',
    siteName: 'RubinOT Boss Tracker',
    images: [
      {
        url: '/icon.png',
        width: 800,
        height: 600,
        alt: 'RubinOT Boss Tracker Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RubinOT Boss Tracker',
    description: 'Track boss spawns and kills across all worlds',
    images: ['/icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} text-white relative min-h-screen flex flex-col`}>
        {/* Global Background Image */}
        <div
          className="fixed inset-0 z-[-1]"
          style={{
            backgroundImage: 'url("/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.3
          }}
        />



        <DataProvider>
          <WorldProvider>
            <div className="relative flex flex-col min-h-screen">
              {/* Top Navigation */}
              <Header />

              {/* Main Content Area - Centered */}
              <main className="flex-1 overflow-y-auto bg-transparent relative">
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
                  {children}
                </div>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </WorldProvider>
        </DataProvider>
        <Analytics />
      </body>
    </html>
  );
}
