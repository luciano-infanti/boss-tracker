import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next";
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import Sidebar from '@/components/Sidebar';
import UnifiedUploadButton from '@/components/UnifiedUploadButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RubinOT Boss Tracker',
  description: 'Track boss spawns and kills across all worlds',
  openGraph: {
    title: 'RubinOT Boss Tracker',
    description: 'Track boss spawns and kills across all worlds',
    url: 'https://rubinot-boss-tracker.vercel.app', // Assuming this is the URL, can be updated
    siteName: 'RubinOT Boss Tracker',
    images: [
      {
        url: '/icon.png', // Using the existing icon
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
      <body className={`${inter.className} text-white relative min-h-screen`}>
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
          <div className="relative flex flex-col md:flex-row h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-transparent relative">
              <div className="absolute top-4 right-4 z-50">
                <UnifiedUploadButton />
              </div>
              <div className="p-8 md:p-12">

                {children}
              </div>
            </main>
          </div>
        </DataProvider>
        <Analytics />
      </body>
    </html>
  );
}
