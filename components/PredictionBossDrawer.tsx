import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { getBossImage } from '@/utils/bossImages';
import { Prediction } from '@/utils/spawnLogic';

interface PredictionBossDrawerProps {
    prediction: Prediction | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PredictionBossDrawer({ prediction, isOpen, onClose }: PredictionBossDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!mounted || !prediction) return null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Calculate Last Seen text
    const lastSeenDate = prediction.lastKill;
    const lastSeenStr = formatDate(lastSeenDate);
    const daysSinceLast = Math.floor((new Date().getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));

    const stats = prediction.stats;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl z-[9999] overflow-y-auto"
                    >
                        <div className="p-6 pb-24 space-y-8">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-surface-hover border border-border/50 flex items-center justify-center p-2">
                                        <img
                                            src={getBossImage(prediction.bossName) || undefined}
                                            alt={prediction.bossName}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{prediction.bossName}</h2>
                                        <p className="text-secondary">{prediction.world}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-surface-hover rounded-full text-secondary hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Confidence Section (Moved here) */}
                            <div className="p-3 rounded bg-surface-hover/30 border border-border/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-secondary">Confidence Score</span>
                                    <span className={`text-sm font-bold ${prediction.confidenceLabel === 'High' ? 'text-emerald-400' :
                                        prediction.confidenceLabel === 'Medium' ? 'text-yellow-400' :
                                            'text-red-400'
                                        }`}>
                                        {prediction.confidence}% ({prediction.confidenceLabel})
                                    </span>
                                </div>
                                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${prediction.confidenceLabel === 'High' ? 'bg-emerald-500' :
                                            prediction.confidenceLabel === 'Medium' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                        style={{ width: `${prediction.confidence}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-secondary mt-2">
                                    Based on sample size ({stats?.sampleSize ?? 0}), consistency (stdDev: {stats?.stdDev?.toFixed(2) ?? '?'}), and cross-server verification.
                                </p>
                            </div>

                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg border ${prediction.status === 'OVERDUE' ? 'bg-red-500/10 border-red-500/20' :
                                prediction.status === 'WINDOW_OPEN' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                    'bg-blue-500/10 border-blue-500/20'
                                }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {prediction.status === 'OVERDUE' ? <AlertCircle size={18} className="text-red-400" /> :
                                        prediction.status === 'WINDOW_OPEN' ? <TrendingUp size={18} className="text-emerald-400" /> :
                                            <Clock size={18} className="text-blue-400" />
                                    }
                                    <span className={`font-bold ${prediction.status === 'OVERDUE' ? 'text-red-400' :
                                        prediction.status === 'WINDOW_OPEN' ? 'text-emerald-400' :
                                            'text-blue-400'
                                        }`}>
                                        {prediction.probabilityLabel}
                                    </span>
                                </div>
                                <p className="text-xs text-secondary/80">
                                    {prediction.status === 'OVERDUE' ? 'This boss has exceeded its maximum expected spawn time.' :
                                        prediction.status === 'WINDOW_OPEN' ? 'The spawn window is currently active.' :
                                            'The boss is currently in its cooldown period.'
                                    }
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-secondary">
                                    <span>Window Progress</span>
                                    <span>{Math.round(prediction.windowProgress)}%</span>
                                </div>
                                <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${prediction.status === 'OVERDUE' ? 'bg-red-500' :
                                            prediction.windowProgress > 80 ? 'bg-orange-500' :
                                                prediction.windowProgress > 40 ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min(prediction.windowProgress, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Key Dates (Moved up) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface-hover/50 p-3 rounded-lg border border-border/50">
                                    <div className="text-xs text-secondary mb-1">Window Opens</div>
                                    <div className="font-medium text-white">{formatDate(prediction.nextMinSpawn)}</div>
                                </div>
                                <div className="bg-surface-hover/50 p-3 rounded-lg border border-border/50">
                                    <div className="text-xs text-secondary mb-1">Window Closes</div>
                                    <div className="font-medium text-white">{formatDate(prediction.nextMaxSpawn)}</div>
                                </div>
                            </div>

                            {/* Last Seen (Moved down) */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover/50 border border-border/50">
                                <div className="flex items-center gap-2 text-secondary">
                                    <Clock size={16} />
                                    <span className="text-sm">Last Seen</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">{lastSeenStr}</div>
                                    <div className="text-xs text-secondary">{daysSinceLast} days ago</div>
                                </div>
                            </div>

                            {/* Advanced Stats */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Info size={14} />
                                    Prediction Statistics
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between p-2 rounded bg-surface-hover/30">
                                        <span className="text-secondary">Min Gap</span>
                                        <span className="text-white font-mono">{stats?.minGap ?? '?'} days</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-surface-hover/30">
                                        <span className="text-secondary">Max Gap</span>
                                        <span className="text-white font-mono">{stats?.maxGap ?? '?'} days</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-surface-hover/30">
                                        <span className="text-secondary">Avg Gap</span>
                                        <span className="text-white font-mono">{stats?.avgGap ?? '?'} days</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-surface-hover/30">
                                        <span className="text-secondary">Samples</span>
                                        <span className="text-white font-mono">{stats?.sampleSize ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}


