import BackupManager from '@/components/BackupManager';

export default function BackupsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Backups</h1>
                <p className="text-gray-400">Manage and restore previous data states.</p>
            </div>

            <BackupManager />
        </div>
    );
}
