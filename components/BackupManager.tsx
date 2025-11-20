'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { History, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface Backup {
    url: string;
    uploadedAt: string;
    pathname: string;
}

export default function BackupManager() {
    const { restoreData, isLoading: isGlobalLoading } = useData();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    const fetchBackups = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/backups');
            const data = await res.json();
            if (data.backups) {
                setBackups(data.backups);
            }
        } catch (error) {
            console.error('Failed to fetch backups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleRestore = async (backup: Backup) => {
        if (!confirm(`Are you sure you want to restore the backup from ${new Date(backup.uploadedAt).toLocaleString()}? This will overwrite current data.`)) {
            return;
        }

        setRestoringId(backup.url);
        try {
            const res = await fetch(backup.url);
            const data = await res.json();
            await restoreData(data);
            alert('Backup restored successfully!');
            fetchBackups(); // Refresh list to see the new "backup" created by the restore
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Failed to restore backup.');
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-white">Data Backups</h2>
                <button
                    onClick={fetchBackups}
                    disabled={isLoading}
                    className="p-2 hover:bg-surface-hover rounded-md text-secondary hover:text-white transition-colors"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : backups.length === 0 ? (
                    <div className="p-8 text-center text-secondary flex flex-col items-center gap-3">
                        <History size={32} className="opacity-50" />
                        <p>No backups found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {backups.map((backup) => (
                            <div key={backup.url} className="p-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-white">
                                        {new Date(backup.uploadedAt).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-secondary font-mono">
                                        {backup.pathname.split('/').pop()}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleRestore(backup)}
                                    disabled={isGlobalLoading || restoringId !== null}
                                    className="px-3 py-1.5 bg-surface-hover hover:bg-primary/20 border border-border hover:border-primary/50 text-xs font-medium text-secondary hover:text-primary rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {restoringId === backup.url ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <History size={12} />
                                    )}
                                    Restore
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200/80 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>
                    Restoring a backup will replace all current data with the data from the backup file.
                    This action creates a new backup of the restored state automatically.
                </p>
            </div>
        </div>
    );
}
