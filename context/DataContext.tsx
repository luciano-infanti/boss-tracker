'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ParsedData } from '@/types';
import { parseSingleWorldFile, parseCombinedFile, detectFileType, extractWorldName } from '@/utils/parser';
import { parseDailyUpdate } from '@/utils/dailyParser';

interface DataContextType {
  data: ParsedData;
  uploadFile: (file: File) => Promise<void>;
  uploadDailyFile: (file: File) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParsedData>({ worlds: {}, combined: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 DataContext: Fetching initial data from API');
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        console.log('✅ DataContext: Data loaded from API:', data);
        console.log('✅ Combined bosses count:', data.combined?.length);
        if (data.combined?.[0]) {
          console.log('✅ First boss example:', data.combined[0]);
        }
        setData(data);
      })
      .catch((err) => {
        console.error('❌ DataContext: Failed to load data:', err);
        setData({ worlds: {}, combined: [] });
      });
  }, []);

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      console.log('📤 Uploading file:', file.name);
      const content = await file.text();
      const fileType = detectFileType(file.name);
      console.log('📝 File type detected:', fileType);

      let newData = { ...data };

      if (fileType === 'combined') {
        console.log('🔍 Parsing combined file...');
        const parsed = parseCombinedFile(content);
        console.log('✅ Parsed combined data:', parsed);
        console.log('✅ Parsed bosses count:', parsed.length);
        if (parsed[0]) {
          console.log('✅ First parsed boss:', parsed[0]);
        }
        newData = { ...newData, combined: parsed };
      } else if (fileType === 'world') {
        const worldName = extractWorldName(file.name);
        console.log('🌍 World name:', worldName);
        if (worldName) {
          const parsed = parseSingleWorldFile(content);
          console.log('✅ Parsed world data:', parsed.length, 'bosses');
          newData = {
            ...newData,
            worlds: { ...newData.worlds, [worldName]: parsed }
          };
        }
      }

      console.log('💾 Saving to blob storage...');
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData })
      });

      if (response.ok) {
        console.log('✅ Upload successful, updating state');
        setData(newData);
      } else {
        const error = await response.json();
        console.error('❌ Upload failed:', error);
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDailyFile = async (file: File) => {
    setIsLoading(true);
    try {
      const content = await file.text();
      const parsed = parseDailyUpdate(content);
      
      if (!parsed) {
        throw new Error('Failed to parse daily update');
      }

      const newData = { ...data, daily: parsed };

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
      console.error('Error parsing daily file:', error);
      alert('Error parsing daily file. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ data, uploadFile, uploadDailyFile, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
