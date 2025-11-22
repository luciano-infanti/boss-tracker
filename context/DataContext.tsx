'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ParsedData } from '@/types';
import { parseSingleWorldFile, parseCombinedFile, detectFileType, extractWorldName, aggregateKillHistory } from '@/utils/parser';
import { parseDailyUpdate } from '@/utils/dailyParser';

interface DataContextType {
  data: ParsedData;
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  restoreData: (data: ParsedData) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParsedData>({ worlds: {}, combined: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 DataContext: Fetching initial data from API');
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        console.log('✅ DataContext: Data loaded from API:', data);
        setData(data);
      })
      .catch((err) => {
        console.error('❌ DataContext: Failed to load data:', err);
        setData({ worlds: {}, combined: [] });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    try {
      console.log('📤 Uploading files:', files.length);
      const fileArray = files instanceof FileList ? Array.from(files) : files;
      let newData = { ...data };
      let worldsUpdated = false;

      for (const file of fileArray) {
        const content = await file.text();
        const fileType = detectFileType(file.name, content);
        console.log(`📝 File: ${file.name}, Type: ${fileType}`);

        if (fileType === 'combined') {
          newData.combined = parseCombinedFile(content);
        } else if (fileType === 'world') {
          const worldName = extractWorldName(file.name);
          if (worldName) {
            newData.worlds = { ...newData.worlds, [worldName]: parseSingleWorldFile(content) };
            worldsUpdated = true;
          }
        } else if (fileType === 'daily') {
          const parsed = parseDailyUpdate(content);
          if (parsed) newData.daily = parsed;
        }
      }

      if (worldsUpdated) {
        console.log('🔄 Aggregating kill history...');
        newData.killDates = aggregateKillHistory(newData.worlds);
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
      console.error('❌ Error processing files:', error);
      alert('Error processing files. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreData = async (newData: ParsedData) => {
    setIsLoading(true);
    try {
      console.log('🔄 Restoring data...');

      // Update state immediately
      setData(newData);

      // Save to blob storage (this will also trigger a new backup via the API)
      console.log('💾 Saving restored data to blob storage...');
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData })
      });

      if (response.ok) {
        console.log('✅ Restore and save successful');
      } else {
        const error = await response.json();
        console.error('❌ Save failed during restore:', error);
        throw new Error('Save failed during restore');
      }
    } catch (error) {
      console.error('❌ Error restoring data:', error);
      alert('Error restoring data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ data, uploadFiles, restoreData, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
