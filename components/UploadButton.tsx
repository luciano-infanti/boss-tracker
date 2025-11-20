'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function UploadButton() {
  const { uploadFiles, isLoading } = useData();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
      // Reset input so same files can be uploaded again
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        multiple
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
    </>
  );
}
