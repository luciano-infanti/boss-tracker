'use client';

import { Upload, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useRef } from 'react';

export default function UnifiedUploadButton() {
    const { uploadFiles, isLoading } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFiles(e.target.files);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".txt,.json"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <Upload size={20} />
                )}
                Upload Data
            </button>
        </div>
    );
}
