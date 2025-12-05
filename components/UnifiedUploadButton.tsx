'use client';

import { Upload, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useRef } from 'react';

export default function UnifiedUploadButton() {
    const { stageFiles, isLoading } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await stageFiles(e.target.files);
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
                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-secondary hover:text-white rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={14} />
                ) : (
                    <Upload size={14} />
                )}
                Upload Data
            </button>
        </div>
    );
}
