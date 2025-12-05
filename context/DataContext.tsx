'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ParsedData, UploadLog } from '@/types';
import { parseSingleWorldFile, parseCombinedFile, extractWorldName, aggregateKillHistory } from '@/utils/parser';
import { detectFileType } from '@/utils/fileDetector';
import { parseCompleteKillDates } from '@/utils/killDatesParser';
import { parseDailyUpdate } from '@/utils/dailyParser';
import UploadReviewModal from '@/components/UploadReviewModal';

interface DataContextType {
  data: ParsedData;
  stageFiles: (files: FileList | File[]) => Promise<void>;
  restoreData: (data: ParsedData) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParsedData>({ worlds: {}, combined: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Staging State
  const [pendingData, setPendingData] = useState<ParsedData | null>(null);
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

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

  const stageFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    setUploadLogs([]);
    setPendingData(null);

    try {
      console.log('📤 Staging files:', files.length);
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      // Start with current data to merge into
      let newData = { ...data };
      let worldsUpdated = false;
      let killDatesUpdated = false;
      const logs: UploadLog[] = [];

      for (const file of fileArray) {
        try {
          const content = await file.text();
          const fileType = detectFileType(file.name, content);
          console.log(`📝 File: ${file.name}, Type: ${fileType}`);

          if (fileType === 'combined') {
            newData.combined = parseCombinedFile(content);
            logs.push({ fileName: file.name, status: 'success', message: 'Parsed Combined Statistics' });
          } else if (fileType === 'world') {
            const worldName = extractWorldName(file.name, content);
            if (worldName) {
              newData.worlds = { ...newData.worlds, [worldName]: parseSingleWorldFile(content) };
              worldsUpdated = true;
              logs.push({ fileName: file.name, status: 'success', message: `Parsed World Data: ${worldName}` });
            } else {
              logs.push({ fileName: file.name, status: 'error', message: 'Could not extract World Name' });
            }
          } else if (fileType === 'daily') {
            const parsed = parseDailyUpdate(content);
            if (parsed) {
              newData.daily = parsed;
              logs.push({ fileName: file.name, status: 'success', message: `Parsed Daily Update: ${parsed.date}` });
            } else {
              logs.push({ fileName: file.name, status: 'error', message: 'Failed to parse Daily Update' });
            }
          } else if (fileType === 'killDates') {
            try {
              const parsed = parseCompleteKillDates(content);
              newData.killDates = parsed;
              killDatesUpdated = true;
              logs.push({ fileName: file.name, status: 'success', message: `Parsed Complete Kill Dates: ${parsed.length} bosses` });
            } catch (e: any) {
              logs.push({ fileName: file.name, status: 'error', message: `Failed to parse Kill Dates: ${e.message}` });
            }
          } else {
            logs.push({ fileName: file.name, status: 'error', message: 'Unknown file type' });
          }
        } catch (err: any) {
          logs.push({ fileName: file.name, status: 'error', message: `Parsing error: ${err.message}` });
        }
      }

      if (worldsUpdated && !killDatesUpdated) {
        console.log('🔄 Aggregating kill history...');
        try {
          newData.killDates = aggregateKillHistory(newData.worlds);
        } catch (err: any) {
          logs.push({ fileName: 'Aggregation', status: 'warning', message: `History aggregation warning: ${err.message}` });
        }
      }

      setPendingData(newData);
      setUploadLogs(logs);
      setIsReviewModalOpen(true);

    } catch (error) {
      console.error('❌ Error staging files:', error);
      alert('Error processing files. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  const commitUpload = async () => {
    if (!pendingData) return;
    setIsCommitting(true);

    try {
      console.log('💾 Committing to Supabase...');
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: pendingData })
      });

      if (response.ok) {
        console.log('✅ Upload successful, refreshing data...');
        // Re-fetch data to ensure we have the complete picture
        const freshData = await (await fetch('/api/data')).json();
        setData(freshData);
        setIsReviewModalOpen(false);
        setPendingData(null);
        setUploadLogs([]);
      } else {
        const error = await response.json();
        console.error('❌ Upload failed:', error);
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Error committing files:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  const cancelUpload = () => {
    setIsReviewModalOpen(false);
    setPendingData(null);
    setUploadLogs([]);
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
    <DataContext.Provider value={{ data, stageFiles, restoreData, isLoading }}>
      {children}
      <UploadReviewModal
        isOpen={isReviewModalOpen}
        logs={uploadLogs}
        isCommitting={isCommitting}
        onConfirm={commitUpload}
        onCancel={cancelUpload}
      />
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
