'use client';

import { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { Upload } from 'lucide-react';
import BackupManager from '@/components/BackupManager';
import PasswordProtection from '@/components/PasswordProtection';
import { checkAuth } from '@/app/actions/auth';
import { useEffect } from 'react';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const { stageFiles, isLoading: isUploading } = useData();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checkAuth().then(isAuth => {
            setIsAuthenticated(isAuth);
            setIsLoadingAuth(false);
        });
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await stageFiles(Array.from(files));
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    if (isLoadingAuth) {
        return <div className="p-8 text-center text-secondary">Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return <PasswordProtection onSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">Manage data, backups, and system settings.</p>
                </div>

                <div>
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
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
                    >
                        <Upload size={18} />
                        {isUploading ? 'Uploading...' : 'Upload Data'}
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Backups</h2>
                    <BackupManager />
                </section>
            </div>
        </div>
    );
}
