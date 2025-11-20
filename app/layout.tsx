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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <DataProvider>
          <div className="flex flex-col md:flex-row h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h1 className="text-xl md:text-2xl font-bold">Boss Statistics</h1>
                  <UnifiedUploadButton />
                </div>
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
