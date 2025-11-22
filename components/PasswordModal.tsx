'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { verifyBackupPassword } from '@/app/actions/auth';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const isValid = await verifyBackupPassword(password);
            if (isValid) {
                onSuccess();
                onClose();
            } else {
                setError('Incorrect password');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border bg-surface-hover/20">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Lock size={18} className="text-primary" />
                        Authentication Required
                    </h2>
                    <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-secondary text-sm">
                        Please enter the password to upload files. This ensures only authorized users can modify the data.
                    </p>

                    <div className="space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password..."
                            className="w-full px-4 py-2 bg-background border border-border rounded-md text-white placeholder-secondary/50 focus:outline-none focus:border-primary transition-colors"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-secondary hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                        >
                            {isLoading ? 'Verifying...' : 'Unlock Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
