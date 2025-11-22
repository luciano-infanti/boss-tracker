import { cookies } from 'next/headers';
import BackupManager from '@/components/BackupManager';
import PasswordProtection from '@/components/PasswordProtection';

export default async function BackupsPage() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('backup_auth')?.value === 'true';

    if (!isAuthenticated) {
        return <PasswordProtection />;
    }

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
