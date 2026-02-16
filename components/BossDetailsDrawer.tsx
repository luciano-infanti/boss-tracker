import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boss, CombinedBoss, DailyKill } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import { X, Calendar, Server, Clock, ChevronDown, ChevronRight, Check, ChevronLeft, ExternalLink } from 'lucide-react';
import { useData } from '@/context/DataContext';
import BossMap from './BossMap';
import { getBossExtraInfo } from '@/utils/bossExtraData';
import { getAdjustedKillCount, isSoulpitBoss } from '@/utils/soulpitUtils';
import { formatNumber } from '@/utils/formatNumber';
import { BOSS_KNOWN_PATTERNS, BOSS_MINIMUM_INTERVALS } from '@/utils/bossSpawnConstants';

interface BossDetailsDrawerProps {
    boss: Boss | CombinedBoss;
    isOpen: boolean;
    onClose: () => void;
    dailyKill?: DailyKill;
    worldName?: string;
}

type SortMode = 'server' | 'date';

export default function BossDetailsDrawer({ boss, isOpen, onClose, dailyKill, worldName }: BossDetailsDrawerProps) {
    const { data } = useData();
    const [sortMode, setSortMode] = useState<SortMode>('server');
    const [expandedWorlds, setExpandedWorlds] = useState<Record<string, boolean>>({});
    const bossImage = getBossImage(boss.name);

    const toggleWorld = (worldName: string) => {
        setExpandedWorlds(prev => ({
            ...prev,
            [worldName]: !prev[worldName]
        }));
    };

    // Helper to parse history string for World view
    const parseHistoryString = (historyStr: string) => {
        if (!historyStr || historyStr === 'None') return [];
        const entries = historyStr.split(',').map(s => s.trim());

        if (!isSoulpitBoss(boss.name)) return entries;

        return entries.map(entry => {
            const match = entry.match(/^(\d{2}\/\d{2}\/\d{4})(?:\s*\((\d+)x\))?$/);
            if (!match) return entry;
            const [_, date, countStr] = match;
            const count = countStr ? parseInt(countStr) : 1;
            const adjusted = getAdjustedKillCount(boss.name, count);
            if (adjusted === 0) return null;
            return adjusted > 1 ? `${date} (${adjusted}x)` : date;
        }).filter(Boolean) as string[];
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

        return Object.entries(grouped).map(([date, count]) => {
            const adjusted = getAdjustedKillCount(boss.name, count);
            if (adjusted === 0) return null;
            return `${date}${adjusted > 1 ? ` (${adjusted}x)` : ''}`;
        }).filter(Boolean) as string[];
    };

    // Aggregate all kills for Date sort AND Server sort (now unified)
    const allKillsByDate = useMemo(() => {
        const kills: { date: string; world: string; count: number; timestamp: number }[] = [];
        const seen = new Set<string>(); // key: date-world

        // DEBUG: Trace Yeti
        const isDebug = boss.name === 'Yeti' || boss.name === 'Mahatheb';
        if (isDebug) {
            console.log(`🔍 [Drawer] Calculating kills for ${boss.name}`, {
                hasDailyKill: !!dailyKill,
                dailyKillData: dailyKill,
                hasKillDates: !!data.killDates,
                killDatesEntry: data.killDates?.find(h => h.bossName === boss.name),
                historyString: 'history' in boss ? boss.history : 'N/A'
            });
        }

        const addKill = (date: string, world: string, count: number) => {
            const key = `${date}-${world}`;
            if (seen.has(key)) return; // Avoid duplicates from multiple sources

            // Filter by world if provided
            if (worldName && world !== worldName) return;

            const [day, month, year] = date.split('/');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            if (isDebug) console.log(`   -> Adding kill: ${date} in ${world} (${count})`);

            kills.push({
                date,
                world,
                count,
                timestamp: dateObj.getTime()
            });
            seen.add(key);
        };

        // 1. Daily Kills (Highest Priority for today)
        if (dailyKill) {
            dailyKill.worlds.forEach(w => {
                const date = data.daily?.date || new Date().toLocaleDateString('en-GB');
                const adjusted = getAdjustedKillCount(boss.name, w.count);
                if (adjusted > 0) {
                    addKill(date, w.world, adjusted);
                }
            });
        }

        // 2. Complete Kill Dates (Primary History Source)
        if (data.killDates) {
            const bossHistory = data.killDates.find(h => h.bossName === boss.name);
            if (bossHistory) {
                Object.entries(bossHistory.killsByWorld).forEach(([world, entries]) => {
                    // Group by date for this world to handle multiple entries per day if any
                    const byDate: Record<string, number> = {};
                    entries.forEach(e => {
                        byDate[e.date] = (byDate[e.date] || 0) + e.count;
                    });

                    Object.entries(byDate).forEach(([date, count]) => {
                        const adjusted = getAdjustedKillCount(boss.name, count);
                        if (adjusted > 0) addKill(date, world, adjusted);
                    });
                });
            }
        }

        // 3. Boss History (Fallback for single world files not in killDates yet)
        if ('history' in boss && boss.history && boss.history !== 'None') {
            const targetWorld = worldName || 'Current World';
            const dates = parseHistoryString(boss.history);
            dates.forEach(dateStr => {
                const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*\((\d+)x\))?$/);
                if (match) {
                    const [_, day, month, year, countStr] = match;
                    const count = countStr ? parseInt(countStr) : 1;
                    const date = `${day}/${month}/${year}`;
                    // parseHistoryString already adjusts the count, so we pass it directly
                    addKill(date, targetWorld, count);
                }
            });
        }

        // Sort by date descending
        return kills.sort((a, b) => b.timestamp - a.timestamp);
    }, [boss, data.killDates, data.daily, worldName, dailyKill]);

    const adjustedTotalKills = useMemo(() => {
        const aggregatedTotal = allKillsByDate.reduce((acc, kill) => acc + kill.count, 0);

        // Debug logging for Yeti/Mahatheb
        if (boss.name === 'Yeti' || boss.name === 'Mahatheb') {
            console.log(`🔍 Drawer Total Calc (${boss.name}):`, {
                bossTotal: boss.totalKills,
                aggregatedTotal,
                dailyKill: dailyKill,
                historyCount: allKillsByDate.length
            });
        }

        // If aggregated total (which includes daily + history) is greater than boss.totalKills,
        // it means we have more recent data (like today's kill) that isn't in the combined file yet.
        // In this case, use the aggregated total.
        if (aggregatedTotal > (boss.totalKills || 0)) {
            return aggregatedTotal;
        }

        // Otherwise, fallback to boss.totalKills as it might contain historical data 
        // that isn't fully represented in the parsed history strings.
        return boss.totalKills || 0;
    }, [boss.name, boss.totalKills, allKillsByDate, dailyKill]);

    const isZeroKills = adjustedTotalKills === 0;

    // Mini Calendar Component
    const MiniCalendar = () => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [selectedServer, setSelectedServer] = useState<string>(worldName || 'all');

        // Update selected server if worldName changes
        useEffect(() => {
            if (worldName) setSelectedServer(worldName);
        }, [worldName]);

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
        }, [boss]);

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
            <div className="bg-surface-hover/20 rounded-lg border border-border/50 p-3 mb-6">
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

                    {/* Server Filter (only for combined view and if no world forced) */}
                    {availableServers.length > 0 && !worldName && (
                        <select
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(e.target.value)}
                            className="bg-surface border border-border rounded text-xs text-secondary px-2 py-1 focus:outline-none focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                            <option value="all">Todos os Servidores</option>
                            {availableServers.map(server => (
                                <option key={server} value={server}>{server}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-[10px] text-secondary font-medium aspect-square flex items-center justify-center">{d}</div>
                    ))}
                    {padding.map(p => <div key={`pad-${p}`} className="aspect-square" />)}
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

    // Merge perWorldStats with daily kills for Server view
    const serverStats = useMemo(() => {
        const stats = new Map<string, { spawns: number; kills: number; frequency: string }>();

        // 1. Add existing perWorldStats
        if ('perWorldStats' in boss) {
            boss.perWorldStats.forEach(s => {
                if (worldName && s.world !== worldName) return;
                stats.set(s.world, { ...s });
            });
        }

        // 2. Merge daily kills
        if (dailyKill) {
            dailyKill.worlds.forEach(w => {
                // If filtering by world, skip others
                if (worldName && w.world !== worldName) return;

                const existing = stats.get(w.world) || { spawns: 0, kills: 0, frequency: 'N/A' };
                // If this daily kill isn't already accounted for in the total (rough check)
                // Actually, for display purposes in the list, we just want to ensure the world exists
                // and maybe update the count if it looks stale? 
                // For now, let's just ensure the world is in the list.
                // If it's a placeholder boss, stats is empty, so this populates it.
                if (!stats.has(w.world)) {
                    stats.set(w.world, {
                        spawns: 0, // We don't know total spawns for new boss
                        kills: w.count,
                        frequency: 'N/A'
                    });
                } else {
                    // If we have stats, we assume they might include today's kill if the combined file was updated.
                    // But if the combined file is old, the count might be lower.
                    // Let's just trust the combined file for totals if it exists, 
                    // but if it's a placeholder (0 kills), use daily.
                    if (existing.kills === 0) {
                        existing.kills = w.count;
                    }
                }
            });
        }

        return Array.from(stats.entries()).map(([world, stat]) => ({
            world,
            ...stat
        })).sort((a, b) => b.kills - a.kills);
    }, [boss, dailyKill]);

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
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{boss.name}</h2>
                                    <p className="text-sm text-secondary">Detalhes do Boss</p>
                                </div>
                                {(() => {
                                    const extraInfo = getBossExtraInfo(boss.name);
                                    if (extraInfo?.wiki) {
                                        return (
                                            <a
                                                href={extraInfo.wiki}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-full bg-surface-hover/50 text-secondary hover:text-primary hover:bg-surface-hover transition-colors border border-border/50"
                                                title="Abrir TibiaWiki"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close"
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
                                        <div className="text-xs text-secondary mb-1 uppercase tracking-wide">Total de Mortes</div>
                                        <div className="text-2xl font-bold text-white">{formatNumber(adjustedTotalKills)}</div>
                                    </div>
                                    <div className="bg-surface-hover/30 p-4 rounded-lg border border-border/50 text-center">
                                        <div className="text-xs text-secondary mb-1 uppercase tracking-wide">Frequência</div>
                                        <div className="text-lg font-medium text-white">
                                            {(() => {
                                                let freq = 'spawnFrequency' in boss ? boss.spawnFrequency :
                                                    'typicalSpawnFrequency' in boss ? boss.typicalSpawnFrequency : 'N/A';

                                                // Fallback if data is missing/N/A
                                                if (!freq || freq === 'N/A') {
                                                    const knownPattern = BOSS_KNOWN_PATTERNS[boss.name];
                                                    if (knownPattern) {
                                                        return knownPattern.type === 'FIXED'
                                                            ? `${knownPattern.min} dias (Fixo)`
                                                            : `${knownPattern.min}-${knownPattern.max} dias`;
                                                    }

                                                    const minInterval = BOSS_MINIMUM_INTERVALS[boss.name];
                                                    if (minInterval) {
                                                        return `~${minInterval} dias`;
                                                    }
                                                }

                                                return freq;
                                            })()}
                                        </div>
                                    </div>
                                    {/* Last Seen - Only for World View */}
                                    {'history' in boss && (
                                        <div className="col-span-2 bg-surface-hover/30 p-4 rounded-lg border border-border/50 text-center">
                                            <div className="text-xs text-secondary mb-1 uppercase tracking-wide">Última Aparição</div>
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

                                                    if (!latestDate || !dateStr || dateStr === 'Never') return 'Nunca';

                                                    const now = new Date();
                                                    // Normalize to midnight
                                                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                    const lastSeen = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());

                                                    const diffTime = Math.abs(today.getTime() - lastSeen.getTime());
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                    return (
                                                        <>
                                                            {dateStr}
                                                            <span className="text-sm text-secondary ml-2 font-normal">
                                                                ({diffDays} dias atrás)
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description Section */}
                            {(() => {
                                const extraInfo = getBossExtraInfo(boss.name);
                                if (extraInfo?.description) {
                                    return (
                                        <div className="bg-surface-hover/20 rounded-lg border border-border/50 p-4">
                                            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                <span className="text-blue-400">ℹ️</span> Informações
                                            </h3>
                                            <p className="text-sm text-secondary/90 leading-relaxed">
                                                {extraInfo.description}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Extra Info: Loot & Location (Hidden for now) */}
                            {false && (() => {
                                const extraInfo = getBossExtraInfo(boss.name);
                                if (!extraInfo) return null;

                                return (
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Valuable Loot */}
                                        {(extraInfo?.loot?.length ?? 0) > 0 && (
                                            <div className="bg-surface-hover/20 rounded-lg border border-border/50 p-4">
                                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                                    <span className="text-yellow-400">✨</span> Valuable Loot
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {extraInfo!.loot!.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2 bg-surface-hover/50 px-2 py-1 rounded border border-border/30">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                                                            )}
                                                            <span className="text-xs font-medium text-secondary">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Location Map */}
                                        {(extraInfo?.locations?.length ?? 0) > 0 && (
                                            <div className="space-y-6">
                                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                    <span className="text-emerald-400">📍</span> Locations
                                                </h3>

                                                <div className="grid grid-cols-1 gap-6">
                                                    {extraInfo!.locations!.map((location, index) => (
                                                        <div key={index} className="space-y-2">
                                                            {location.description && (
                                                                <div className="text-xs text-secondary flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                    {location.description}
                                                                </div>
                                                            )}
                                                            <BossMap
                                                                x={location.x}
                                                                y={location.y}
                                                                z={location.z}
                                                                name={`${boss.name} - ${location.description || `Location ${index + 1}`}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Mini Calendar */}
                            <div>
                                <MiniCalendar />
                            </div>

                            {/* History Section */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Clock size={18} className="text-primary" />
                                        Histórico de Mortes
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
                                            Servidor
                                        </button>
                                        <button
                                            onClick={() => setSortMode('date')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sortMode === 'date'
                                                ? 'bg-primary text-black shadow-sm'
                                                : 'text-secondary hover:text-white'
                                                }`}
                                        >
                                            <Calendar size={12} />
                                            Data
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-surface-hover/20 rounded-xl border border-border/50 overflow-hidden flex-1">
                                    {sortMode === 'server' ? (
                                        <div className="p-4 space-y-2">
                                            {'history' in boss || worldName ? (
                                                // World View (Single World or Filtered)
                                                allKillsByDate.length > 0 ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-white mb-2">
                                                            {worldName || 'Mundo Atual'}
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {allKillsByDate.map((kill, i) => (
                                                                <li key={i} className="flex items-center gap-3 text-sm text-secondary bg-surface-hover/30 p-2 rounded border border-border/30">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                                    {kill.date}
                                                                    {kill.count > 1 && <span className="text-emerald-400 font-bold">({kill.count}x)</span>}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-secondary py-8">Sem histórico disponível</div>
                                                )
                                            ) : (
                                                // Combined View - Use serverStats
                                                serverStats.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {serverStats.map(stat => (
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
                                                                        {formatNumber(getAdjustedKillCount(boss.name, stat.kills))} mortes
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
                                                                                {getDatesForWorld(stat.world).length > 0 ? (
                                                                                    getDatesForWorld(stat.world).map((date, i) => (
                                                                                        <div key={i} className="text-sm text-secondary/80 flex items-center gap-2 pl-6">
                                                                                            <div className="w-1 h-1 rounded-full bg-secondary/50"></div>
                                                                                            {date}
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <div className="text-xs text-secondary/50 pl-6 py-1 italic">
                                                                                        Datas detalhadas não disponíveis
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-secondary py-8">Sem histórico disponível</div>
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
                                                <div className="text-center text-secondary py-8">Sem histórico disponível</div>
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
