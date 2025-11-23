import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import { X, Calendar, Server, Clock, ChevronDown, ChevronRight, Check, ChevronLeft } from 'lucide-react';
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
    const [expandedWorlds, setExpandedWorlds] = useState<Record<string, boolean>>({});
    const bossImage = getBossImage(boss.name);
    const totalKills = boss.totalKills || 0;
    const isZeroKills = totalKills === 0;

    const toggleWorld = (worldName: string) => {
        setExpandedWorlds(prev => ({
            ...prev,
            [worldName]: !prev[worldName]
        }));
    };

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
                        world: 'Current World',
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

    // Mini Calendar Component
    const MiniCalendar = () => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [selectedServer, setSelectedServer] = useState<string>('all');

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

        const changeMonth = (offset: number) => {
            setCurrentDate(new Date(currentYear, currentMonth + offset, 1));
        };

        // Get available servers for filter
        const availableServers = useMemo(() => {
            if ('perWorldStats' in boss) {
                return boss.perWorldStats.map(s => s.world).sort();
            }
            return [];
        }, []);

        // Map kills to days
        const killsOnDay: Record<number, { world: string, count: number }[]> = {};

        allKillsByDate.forEach(kill => {
            const [day, month, year] = kill.date.split('/').map(Number);
            if (month === currentMonth + 1 && year === currentYear) {
                // Filter by server if selected
                if (selectedServer === 'all' || kill.world === selectedServer) {
                    if (!killsOnDay[day]) killsOnDay[day] = [];
                    killsOnDay[day].push({ world: kill.world, count: kill.count });
                }
            }
        });

        return (
            <div className="bg-surface-hover/20 rounded-lg border border-border/50 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-1 hover:bg-surface-hover rounded text-secondary hover:text-white transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <h4 className="text-sm font-medium text-white min-w-[100px] text-center">
                            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-1 hover:bg-surface-hover rounded text-secondary hover:text-white transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Server Filter (only for combined view) */}
                    {availableServers.length > 0 && (
                        <select
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(e.target.value)}
                            className="bg-surface border border-border rounded text-xs text-secondary px-2 py-1 focus:outline-none focus:border-primary/50"
                        >
                            <option value="all">All Servers</option>
                            {availableServers.map(server => (
                                <option key={server} value={server}>{server}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-[10px] text-secondary font-medium py-1">{d}</div>
                    ))}
                    {padding.map(p => <div key={`pad-${p}`} />)}
                    {days.map(day => {
                        const kills = killsOnDay[day];
                        const hasKill = kills && kills.length > 0;

                        return (
                            <div key={day} className="relative group">
                                <div className={`
                                aspect-square flex items-center justify-center rounded text-xs transition-colors
                                ${hasKill
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-help'
                                        : 'text-secondary/50 hover:bg-surface-hover'
                                    }
                            `}>
                                    {hasKill ? <Check size={12} strokeWidth={3} /> : day}
                                </div>

                                {hasKill && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-max max-w-[200px]">
                                        <div className="bg-surface-hover text-xs text-white px-2 py-1.5 rounded shadow-xl border border-border">
                                            <div className="font-medium mb-1 border-b border-white/10 pb-1">
                                                {day}/{currentMonth + 1}/{currentYear}
                                            </div>
                                            <div className="space-y-0.5">
                                                {kills.map((k, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-3 text-[10px]">
                                                        <span className="text-secondary">{k.world}</span>
                                                        {k.count > 1 && <span className="text-emerald-400">x{k.count}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-hover"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

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
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-surface border-l border-border shadow-2xl flex flex-col"
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

                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
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
                                    {/* Last Seen - Only for World View */}
                                    {'history' in boss && (
                                        <div className="col-span-2 bg-surface-hover/30 p-4 rounded-lg border border-border/50 text-center">
                                            <div className="text-xs text-secondary mb-1 uppercase tracking-wide">Last Seen</div>
                                            <div className="text-lg font-medium text-white">
                                                {(() => {
                                                    let latestDate: Date | null = null;
                                                    let dateStr = boss.lastKillDate;

                                                    // 1. Try to parse from history first (most accurate)
                                                    if (boss.history && boss.history !== 'None') {
                                                        const entries = boss.history.split(',').map(s => s.trim());
                                                        entries.forEach(entry => {
                                                            const match = entry.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                                                            if (match) {
                                                                const [_, day, month, year] = match;
                                                                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                                if (!latestDate || date > latestDate) {
                                                                    latestDate = date;
                                                                    dateStr = `${day}/${month}/${year}`;
                                                                }
                                                            }
                                                        });
                                                    }

                                                    // 2. Fallback to lastKillDate
                                                    if (!latestDate && dateStr && dateStr !== 'Never') {
                                                        const [day, month, year] = dateStr.split('/').map(Number);
                                                        latestDate = new Date(year, month - 1, day);
                                                    }

                                                    if (!latestDate || !dateStr || dateStr === 'Never') return 'Never';

                                                    const now = new Date();
                                                    const diffTime = Math.abs(now.getTime() - latestDate.getTime());
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                    return (
                                                        <>
                                                            {dateStr}
                                                            <span className="text-sm text-secondary ml-2 font-normal">
                                                                ({diffDays} days ago)
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mini Calendar */}
                            <MiniCalendar />

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
                                        <div className="p-4 space-y-2">
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
                                                    <div className="space-y-2">
                                                        {boss.perWorldStats.map(stat => (
                                                            <div key={stat.world} className="border border-border/30 rounded-lg overflow-hidden bg-surface-hover/10">
                                                                <button
                                                                    onClick={() => toggleWorld(stat.world)}
                                                                    className="w-full flex items-center justify-between p-3 hover:bg-surface-hover/30 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {expandedWorlds[stat.world] ? <ChevronDown size={16} className="text-secondary" /> : <ChevronRight size={16} className="text-secondary" />}
                                                                        <span className="font-medium text-white">{stat.world}</span>
                                                                    </div>
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-medium">
                                                                        {stat.kills} kills
                                                                    </span>
                                                                </button>

                                                                <AnimatePresence>
                                                                    {expandedWorlds[stat.world] && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="p-3 pt-0 border-t border-border/30 space-y-1.5 bg-black/20">
                                                                                {getDatesForWorld(stat.world).map((date, i) => (
                                                                                    <div key={i} className="text-sm text-secondary/80 flex items-center gap-2 pl-6">
                                                                                        <div className="w-1 h-1 rounded-full bg-secondary/50"></div>
                                                                                        {date}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
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
                            </div >
                        </div >
                    </motion.div >
                </>
            )}
        </AnimatePresence >
    );
}
