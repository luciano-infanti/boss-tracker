'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ParsedData, Boss, CombinedBoss } from '@/types';
import { parseSingleWorldFile, parseCombinedFile, detectFileType, extractWorldName } from '@/utils/parser';

interface DataContextType {
  data: ParsedData;
  uploadFile: (file: File) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParsedData>({ worlds: {}, combined: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('bossTrackerData');
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const content = await file.text();
      const fileType = detectFileType(file.name);

      if (fileType === 'combined') {
        const parsed = parseCombinedFile(content);
        const newData = { ...data, combined: parsed };
        setData(newData);
        localStorage.setItem('bossTrackerData', JSON.stringify(newData));
      } else if (fileType === 'world') {
        const worldName = extractWorldName(file.name);
        if (worldName) {
          const parsed = parseSingleWorldFile(content);
          const newData = {
            ...data,
            worlds: { ...data.worlds, [worldName]: parsed }
          };
          setData(newData);
          localStorage.setItem('bossTrackerData', JSON.stringify(newData));
        }
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ data, uploadFile, isLoading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
