'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { checkAuth } from '@/app/actions/auth';
import PasswordModal from './PasswordModal';

export default function UploadButton() {
  const { uploadFiles, isLoading } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);

  const handleUploadClick = async () => {
    // Check if already authenticated
    const isAuth = await checkAuth();
    if (isAuth) {
      inputRef.current?.click();
    } else {
      setShowModal(true);
    }
  };

  const handleModalSuccess = () => {
    // Auth successful, open file dialog
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
      // Reset input so same files can be uploaded again
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <PasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.json"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-secondary hover:text-white rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
      >
        <Upload size={14} />
        {isLoading ? 'Uploading...' : 'Upload Data'}
      </button>
    </>
  );
}
