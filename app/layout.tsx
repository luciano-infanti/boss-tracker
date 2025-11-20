import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Boss Statistics</h1>
                  <UnifiedUploadButton />
                </div>
                {children}
              </div>
            </main>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
