'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UploadLog } from '@/types';
import { CheckCircle, AlertTriangle, XCircle, FileText, Loader2 } from 'lucide-react';

interface UploadReviewModalProps {
    isOpen: boolean;
    logs: UploadLog[];
    isCommitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function UploadReviewModal({ isOpen, logs, isCommitting, onConfirm, onCancel }: UploadReviewModalProps) {
    const hasErrors = logs.some(log => log.status === 'error');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={!isCommitting ? onCancel : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none"
                    >
                        <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[80vh]">
                            {/* Header */}
                            <div className="p-6 border-b border-border">
                                <h2 className="text-xl font-bold text-white">Review Upload</h2>
                                <p className="text-sm text-secondary mt-1">
                                    Please review the parsing results before committing to the database.
                                </p>
                            </div>

                            {/* Logs List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {logs.length === 0 ? (
                                    <div className="text-center text-secondary py-8">
                                        No files processed.
                                    </div>
                                ) : (
                                    logs.map((log, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3 p-3 rounded-lg border ${log.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                                    log.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                        'bg-red-500/10 border-red-500/20'
                                                }`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {log.status === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
                                                {log.status === 'warning' && <AlertTriangle size={18} className="text-yellow-400" />}
                                                {log.status === 'error' && <XCircle size={18} className="text-red-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <FileText size={12} className="text-secondary" />
                                                    <span className="text-sm font-medium text-white truncate">
                                                        {log.fileName}
                                                    </span>
                                                </div>
                                                <p className={`text-xs ${log.status === 'success' ? 'text-emerald-200/70' :
                                                        log.status === 'warning' ? 'text-yellow-200/70' :
                                                            'text-red-200/70'
                                                    }`}>
                                                    {log.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-border bg-surface-hover/20 rounded-b-xl flex justify-end gap-3">
                                <button
                                    onClick={onCancel}
                                    disabled={isCommitting}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-white hover:bg-surface-hover transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isCommitting || hasErrors}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${hasErrors
                                            ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                                            : 'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isCommitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Committing...
                                        </>
                                    ) : (
                                        hasErrors ? 'Fix Errors to Continue' : 'Approve & Upload'
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
