'use client';

import { useState } from 'react';
import { verifyBackupPassword } from '@/app/actions/auth';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

interface PasswordProtectionProps {
    onSuccess?: () => void;
}

export default function PasswordProtection({ onSuccess }: PasswordProtectionProps) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await verifyBackupPassword(password);
            if (result.success) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            } else {
                setError(result.error || 'Incorrect password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 shadow-lg">
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="p-3 bg-surface-hover rounded-full">
                        <img
                            src="https://www.tibiawiki.com.br/images/0/01/Chayenne%27s_Magical_Key.gif"
                            alt="Protected"
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-1">Protected Area</h2>
                        <p className="text-secondary text-sm">Please enter the password to access backups.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 bg-background border border-border rounded-md text-white placeholder-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full py-2 bg-primary hover:bg-primary/90 text-background font-medium rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                Access Backups
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
