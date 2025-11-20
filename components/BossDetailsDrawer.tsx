'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import { X, Calendar, Server, Clock } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface BossDetailsDrawerProps {
    boss: Boss | CombinedBoss;
    isOpen: boolean;
    onClose: () => void;
}

type SortMode = 'server' | 'date';

export default function BossDetailsDrawer({ boss, isOpen, onClose }: BossDetailsDrawerProps) {
    const { data } = useData();
    const [sortMode, setSortMode] = useState<SortMode>('server');
    const bossImage = getBossImage(boss.name);
    const totalKills = boss.totalKills || 0;
    const isZeroKills = totalKills === 0;

    // Helper to parse history string for World view
    const parseHistoryString = (historyStr: string) => {
        if (!historyStr || historyStr === 'None') return [];
        return historyStr.split(',').map(s => s.trim());
    };

    // Helper to get dates for Combined view
    const getDatesForWorld = (worldName: string) => {
        if (!data.killDates) return [];
        const bossHistory = data.killDates.find(h => h.bossName === boss.name);
        if (!bossHistory || !bossHistory.killsByWorld[worldName]) return [];

        // Group by date to handle multiple kills on same day
        const dates = bossHistory.killsByWorld[worldName];
        const grouped = dates.reduce((acc, curr) => {
            acc[curr.date] = (acc[curr.date] || 0) + curr.count;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([date, count]) =>
            `${date}${count > 1 ? ` (${count}x)` : ''}`
        );
    };

    // Aggregate all kills for Date sort
    const allKillsByDate = useMemo(() => {
        const kills: { date: string; world: string; count: number; timestamp: number }[] = [];

        if ('history' in boss) {
            // World View (Single World)
            const dates = parseHistoryString(boss.history);
            dates.forEach(dateStr => {
                // Format: DD/MM/YYYY (Nx) or DD/MM/YYYY
                const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*\((\d+)x\))?$/);
                if (match) {
                    const [_, day, month, year, countStr] = match;
                    const count = countStr ? parseInt(countStr) : 1;
                    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    kills.push({
                        date: `${day}/${month}/${year}`,
                        world: 'Current World', // We don't have world name here easily unless passed, but it's implied
                        count,
                        timestamp: dateObj.getTime()
                    });
                }
            });
        } else if ('perWorldStats' in boss) {
            // Combined View
            if (data.killDates) {
                const bossHistory = data.killDates.find(h => h.bossName === boss.name);
                if (bossHistory) {
                    Object.entries(bossHistory.killsByWorld).forEach(([world, entries]) => {
                        entries.forEach(entry => {
                            const [day, month, year] = entry.date.split('/');
                            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            kills.push({
                                date: entry.date,
                                world,
                                count: entry.count,
                                timestamp: dateObj.getTime()
                            });
                        });
                    });
                }
            }
        }

        // Sort by date descending
        return kills.sort((a, b) => b.timestamp - a.timestamp);
    }, [boss, data.killDates]);


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-border shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-hover/30 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white">{boss.name}</h2>
                                <p className="text-sm text-secondary">Boss Details</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-surface-hover text-secondary hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Hero Section */}
                            <div className="flex flex-col items-center">
                                <div className={`w-32 h-32 bg-surface-hover rounded-xl flex items-center justify-center border border-border/50 mb-4 ${isZeroKills ? 'grayscale' : ''}`}>
                                    {bossImage ? (
                                        <img src={bossImage} alt={boss.name} className="w-full h-full object-contain p-4" />
                                    ) : (
                                        <span className="text-3xl font-bold text-secondary">{boss.name.slice(0, 2)}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-surface-hover/30 p-4 rounded-lg border border-border/50 text-center">
                                        <div className="text-xs text-secondary mb-1 uppercase tracking-wide">Total Kills</div>
                                        <div className="text-2xl font-bold text-white">{totalKills}</div>
                                    </div>
                                    <div className="bg-surface-hover/30 p-4 rounded-lg border border-border/50 text-center">
                                        <div className="text-xs text-secondary mb-1 uppercase tracking-wide">Frequency</div>
                                        <div className="text-lg font-medium text-white">
                                            {'spawnFrequency' in boss ? boss.spawnFrequency :
                                                'typicalSpawnFrequency' in boss ? boss.typicalSpawnFrequency : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Clock size={18} className="text-primary" />
                                        Kill History
                                    </h3>

                                    {/* Sort Toggles */}
                                    <div className="flex bg-surface-hover rounded-lg p-1 border border-border/50">
                                        <button
                                            onClick={() => setSortMode('server')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sortMode === 'server'
                                                    ? 'bg-primary text-black shadow-sm'
                                                    : 'text-secondary hover:text-white'
                                                }`}
                                        >
                                            <Server size={12} />
                                            Server
                                        </button>
                                        <button
                                            onClick={() => setSortMode('date')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sortMode === 'date'
                                                    ? 'bg-primary text-black shadow-sm'
                                                    : 'text-secondary hover:text-white'
                                                }`}
                                        >
                                            <Calendar size={12} />
                                            Date
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-surface-hover/20 rounded-xl border border-border/50 overflow-hidden flex-1">
                                    {sortMode === 'server' ? (
                                        <div className="p-4 space-y-4">
                                            {'history' in boss ? (
                                                // World View (Single World)
                                                boss.history && boss.history !== 'None' ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-white mb-2">Current World</div>
                                                        <ul className="space-y-2">
                                                            {parseHistoryString(boss.history).map((date, i) => (
                                                                <li key={i} className="flex items-center gap-3 text-sm text-secondary bg-surface-hover/30 p-2 rounded border border-border/30">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                                    {date}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-secondary py-8">No history available</div>
                                                )
                                            ) : (
                                                // Combined View
                                                'perWorldStats' in boss ? (
                                                    <div className="space-y-6">
                                                        {boss.perWorldStats.map(stat => (
                                                            <div key={stat.world}>
                                                                <div className="flex justify-between items-center mb-2 px-1">
                                                                    <span className="font-semibold text-white">{stat.world}</span>
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">{stat.kills} kills</span>
                                                                </div>
                                                                <div className="space-y-1.5 pl-2 border-l-2 border-border/30 ml-1">
                                                                    {getDatesForWorld(stat.world).map((date, i) => (
                                                                        <div key={i} className="text-sm text-secondary/80 bg-surface-hover/30 p-2 rounded border border-border/30 flex items-center gap-2">
                                                                            <Calendar size={12} className="opacity-50" />
                                                                            {date}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-secondary py-8">No history available</div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        // Date View
                                        <div className="divide-y divide-border/30">
                                            {allKillsByDate.length > 0 ? (
                                                allKillsByDate.map((kill, i) => (
                                                    <div key={i} className="p-3 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-surface-hover border border-border/50 flex items-center justify-center text-secondary">
                                                                <Calendar size={14} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{kill.date}</div>
                                                                <div className="text-xs text-secondary">{kill.world}</div>
                                                            </div>
                                                        </div>
                                                        {kill.count > 1 && (
                                                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                                                                {kill.count}x
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-secondary py-8">No history available</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
