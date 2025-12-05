'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function UploadButton() {
  const { stageFiles, isLoading } = useData();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await stageFiles(Array.from(files));
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.json"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-secondary hover:text-white rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
      >
        <Upload size={14} />
        {isLoading ? 'Uploading...' : 'Upload Data'}
      </button>
    </>
  );
}
