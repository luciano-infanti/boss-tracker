'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ParsedData } from '@/types';
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
    // Fetch data from Blob on mount
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => setData({ worlds: {}, combined: [] }));
  }, []);

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const content = await file.text();
      const fileType = detectFileType(file.name);

      let newData = { ...data };

      if (fileType === 'combined') {
        const parsed = parseCombinedFile(content);
        newData = { ...newData, combined: parsed };
      } else if (fileType === 'world') {
        const worldName = extractWorldName(file.name);
        if (worldName) {
          const parsed = parseSingleWorldFile(content);
          newData = {
            ...newData,
            worlds: { ...newData.worlds, [worldName]: parsed }
          };
        }
      }

      // Upload to Blob
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData })
      });

      if (response.ok) {
        setData(newData);
      } else {
        throw new Error('Upload failed');
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
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
