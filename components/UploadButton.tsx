'use client';

import { Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useRef } from 'react';

export default function UploadButton() {
  const { uploadFile, isLoading } = useData();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
      >
        <Upload size={18} />
        {isLoading ? 'Uploading...' : 'Upload Data'}
      </button>
    </div>
  );
}
