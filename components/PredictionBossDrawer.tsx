import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, TrendingUp, AlertCircle, Info, BarChart3, Calculator } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'overview' | 'breakdown'>('overview');

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

    // Reset tab when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab('overview');
        }
    }, [isOpen]);

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

    // Gap distribution calculation
    const gapFrequency: Record<number, number> = {};
    if (stats?.rawGaps) {
        stats.rawGaps.forEach(gap => {
            gapFrequency[gap] = (gapFrequency[gap] || 0) + 1;
        });
    }

    const maxFrequency = Math.max(...Object.values(gapFrequency), 1);

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
                        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-surface border-l border-border shadow-2xl z-[9999] overflow-y-auto"
                    >
                        <div className="p-6 pb-24">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
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

                            {/* Tab Navigation */}
                            <div className="flex items-center gap-2 mb-6 border-b border-border">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview'
                                        ? 'text-primary border-primary'
                                        : 'text-secondary border-transparent hover:text-white'
                                        }`}
                                >
                                    <Info size={16} />
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('breakdown')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'breakdown'
                                        ? 'text-primary border-primary'
                                        : 'text-secondary border-transparent hover:text-white'
                                        }`}
                                >
                                    <Calculator size={16} />
                                    Math Breakdown
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'overview' ? (
                                <div className="space-y-6">
                                    {/* Confidence Section */}
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

                                    {/* Key Dates */}
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

                                    {/* Last Seen */}
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

                                    {/* Enhanced Results Table */}
                                    <div className="bg-surface-hover/20 rounded-lg border border-border/50 overflow-hidden">
                                        <div className="bg-surface-hover/50 px-4 py-2 border-b border-border/50">
                                            <h3 className="text-sm font-bold text-white">Prediction Statistics</h3>
                                        </div>
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-4 py-3 text-secondary">Min Gap</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{stats?.minGap ?? '?'} days</td>
                                                    <td className="px-4 py-3 text-xs text-secondary/70">Spawn window opens at earliest</td>
                                                </tr>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-4 py-3 text-secondary">Max Gap</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{stats?.maxGap ?? '?'} days</td>
                                                    <td className="px-4 py-3 text-xs text-secondary/70">Spawn window closes at latest</td>
                                                </tr>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-4 py-3 text-secondary">Avg Gap</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{stats?.avgGap ?? '?'} days</td>
                                                    <td className="px-4 py-3 text-xs text-secondary/70">Expected respawn time</td>
                                                </tr>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-4 py-3 text-secondary">StdDev</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{stats?.stdDev?.toFixed(2) ?? '?'} days</td>
                                                    <td className="px-4 py-3 text-xs text-secondary/70">Consistency measure</td>
                                                </tr>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-4 py-3 text-secondary">Confidence</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{prediction.confidence}%</td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <span className={`font-bold ${prediction.confidenceLabel === 'High' ? 'text-emerald-400' :
                                                            prediction.confidenceLabel === 'Medium' ? 'text-yellow-400' :
                                                                'text-red-400'
                                                            }`}>
                                                            {prediction.confidenceLabel}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-4 py-3 text-secondary">Sample Size</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{stats?.sampleSize ?? 0} gaps</td>
                                                    <td className="px-4 py-3 text-xs text-secondary/70">Data coverage</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-secondary">Worlds</td>
                                                    <td className="px-4 py-3 text-white font-mono text-right">{stats?.worldGaps ? Object.keys(stats.worldGaps).length : 0}</td>
                                                    <td className="px-4 py-3 text-xs text-secondary/70">Cross-verification</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* World-by-World Breakdown */}
                                    {stats?.worldGaps && Object.keys(stats.worldGaps).length > 0 && (
                                        <div className="bg-surface-hover/20 rounded-lg border border-border/50 overflow-hidden">
                                            <div className="bg-surface-hover/50 px-4 py-2 border-b border-border/50">
                                                <h3 className="text-sm font-bold text-white">World-by-World Gap Breakdown</h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {Object.entries(stats.worldGaps).map(([world, gaps]) => (
                                                    <div key={world} className="bg-surface-hover/30 p-3 rounded border border-border/30">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-medium text-white">{world}</span>
                                                            <span className="text-xs text-secondary">{gaps.length} gaps</span>
                                                        </div>
                                                        <div className="text-xs text-secondary font-mono">
                                                            [{gaps.join(', ')}] days
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Gap Distribution Chart */}
                                    {stats?.rawGaps && stats.rawGaps.length > 0 && (
                                        <div className="bg-surface-hover/20 rounded-lg border border-border/50 overflow-hidden">
                                            <div className="bg-surface-hover/50 px-4 py-2 border-b border-border/50 flex items-center gap-2">
                                                <BarChart3 size={16} className="text-primary" />
                                                <h3 className="text-sm font-bold text-white">Gap Distribution</h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-end justify-between gap-1 h-32">
                                                    {Object.entries(gapFrequency).sort((a, b) => Number(a[0]) - Number(b[0])).map(([gap, freq]) => {
                                                        const height = (freq / maxFrequency) * 100;
                                                        const isMedian = Number(gap) === stats.avgGap;
                                                        const isOutlier = stats.filteredGaps && !stats.filteredGaps.includes(Number(gap));

                                                        return (
                                                            <div key={gap} className="flex-1 flex flex-col items-center gap-1">
                                                                <div className="text-[10px] text-secondary">{freq}</div>
                                                                <div
                                                                    className={`w-full rounded-t transition-all ${isOutlier ? 'bg-red-500/50' :
                                                                        isMedian ? 'bg-blue-500' :
                                                                            'bg-surface-hover/70'
                                                                        }`}
                                                                    style={{ height: `${height}%`, minHeight: '4px' }}
                                                                />
                                                                <div className={`text-[10px] font-mono ${isMedian ? 'text-blue-400 font-bold' :
                                                                    isOutlier ? 'text-red-400' :
                                                                        'text-secondary'
                                                                    }`}>
                                                                    {gap}d
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-4 flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                                        <span className="text-secondary">Median (Avg)</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 bg-red-500/50 rounded"></div>
                                                        <span className="text-secondary">Filtered Out (Outliers)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step-by-Step Calculations */}
                                    <div className="bg-surface-hover/20 rounded-lg border border-border/50 overflow-hidden">
                                        <div className="bg-surface-hover/50 px-4 py-2 border-b border-border/50">
                                            <h3 className="text-sm font-bold text-white">Step-by-Step Calculations</h3>
                                        </div>
                                        <div className="p-4 space-y-4 text-sm">
                                            {/* Step 1 */}
                                            <div>
                                                <div className="text-primary font-bold mb-1">1. Collect All Gaps</div>
                                                <div className="text-secondary text-xs mb-1">
                                                    Calculated time difference between consecutive kills across all worlds
                                                </div>
                                                <div className="bg-surface-hover/50 p-2 rounded text-xs font-mono text-white">
                                                    All Gaps = [{stats?.rawGaps?.join(', ')}]
                                                </div>
                                                <div className="text-xs text-secondary mt-1">
                                                    Total: {stats?.rawGaps?.length} gaps collected
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div>
                                                <div className="text-primary font-bold mb-1">2. Apply 80th Percentile Filter</div>
                                                <div className="text-secondary text-xs mb-1">
                                                    Remove outliers caused by "ghost spawns" (missed kills)
                                                </div>
                                                <div className="bg-surface-hover/50 p-2 rounded text-xs font-mono text-white">
                                                    Filtered Gaps = [{stats?.filteredGaps?.join(', ')}]
                                                </div>
                                                <div className="text-xs text-secondary mt-1">
                                                    Kept: {stats?.filteredGaps?.length} gaps | Removed: {(stats?.rawGaps?.length ?? 0) - (stats?.filteredGaps?.length ?? 0)} outliers
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div>
                                                <div className="text-primary font-bold mb-1">3. Calculate Statistics</div>
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-secondary">Min Gap:</span>
                                                        <span className="font-mono text-white">{stats?.minGap} days (earliest respawn)</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-secondary">Max Gap:</span>
                                                        <span className="font-mono text-white">{stats?.maxGap} days (80th percentile)</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-secondary">Avg Gap (Median):</span>
                                                        <span className="font-mono text-white">{stats?.avgGap} days</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-secondary">Std Deviation:</span>
                                                        <span className="font-mono text-white">{stats?.stdDev?.toFixed(2)} days</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div>
                                                <div className="text-primary font-bold mb-1">4. Calculate Confidence Score</div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary">Sample Size Factor:</span>
                                                        <span className="text-white">{stats?.sampleSize} gaps</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary">Consistency (Range):</span>
                                                        <span className="text-white">{(stats?.maxGap ?? 0) - (stats?.minGap ?? 0)} days spread</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary">Cross-Server Bonus:</span>
                                                        <span className="text-white">{stats?.worldGaps ? Object.keys(stats.worldGaps).length : 0} worlds</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                                        <span className="text-secondary font-bold">Final Confidence:</span>
                                                        <span className={`font-bold ${prediction.confidenceLabel === 'High' ? 'text-emerald-400' :
                                                            prediction.confidenceLabel === 'Medium' ? 'text-yellow-400' :
                                                                'text-red-400'
                                                            }`}>
                                                            {prediction.confidence}% ({prediction.confidenceLabel})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
