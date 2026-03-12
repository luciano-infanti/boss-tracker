'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ExternalLink, Trophy, Server, Calendar, Clock,
    TrendingUp, AlertCircle, Info, BarChart3, Calculator,
    ChevronDown, ChevronRight, Shield
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useWorld } from '@/context/WorldContext';
import { useBossPredictions } from '@/hooks/useBossPredictions';
import { Prediction } from '@/utils/spawnLogic';
import { getBossImage } from '@/utils/bossImages';
import { getBossExtraInfo } from '@/utils/bossExtraData';
import { getBossCategory, BossCategory, BOSS_CATEGORY_ICONS } from '@/utils/bossCategories';
import { BOSS_KNOWN_PATTERNS, BOSS_MINIMUM_INTERVALS } from '@/utils/bossSpawnConstants';
import { getAdjustedKillCount } from '@/utils/soulpitUtils';
import { formatNumber } from '@/utils/formatNumber';
import { getWorldIcon } from '@/utils/worldIcons';
import { WORLDS } from '@/utils/constants';
import BossTimeline from '@/components/BossTimeline';
import MiniCalendar from '@/components/MiniCalendar';
import Loading from '@/components/Loading';

// Normalize deprecated server names to current ones
const WORLD_NAME_MAP: Record<string, string> = {
    'Serenian I': 'Serenian',
    'Serenian II': 'Etherian',
    'Serenian III': 'Halorian',
    'Serenian IV': 'Divinian',
};
const normalizeWorld = (name: string) => WORLD_NAME_MAP[name] || name;

type SortMode = 'server' | 'date';
type ActiveTab = 'overview' | 'predictions' | 'history';

interface BossPageClientProps {
    bossName: string;
}

export default function BossPageClient({ bossName }: BossPageClientProps) {
    const router = useRouter();
    const { data, isLoading } = useData();
    const { selectedWorld } = useWorld();

    const [predictionWorld, setPredictionWorld] = useState<string>(selectedWorld || WORLDS[0]);
    const [sortMode, setSortMode] = useState<SortMode>('date');
    const [expandedWorlds, setExpandedWorlds] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [activityRange, setActivityRange] = useState<'3M' | '6M' | 'ALL'>('ALL');

    // ── Data Lookups ──────────────────────────────────────────
    const bossImage = getBossImage(bossName);
    const extraInfo = getBossExtraInfo(bossName);
    const category = getBossCategory(bossName);
    const knownPattern = BOSS_KNOWN_PATTERNS[bossName] ?? null;
    const minInterval = BOSS_MINIMUM_INTERVALS[bossName] ?? BOSS_MINIMUM_INTERVALS['DEFAULT'];

    // ── Kill History ──────────────────────────────────────────
    const allKillsByDate = useMemo(() => {
        if (!data.killDates) return [];
        const bossHistory = data.killDates.find(h => h.bossName === bossName);
        if (!bossHistory) return [];

        const kills: { date: string; world: string; count: number; timestamp: number }[] = [];
        const seen = new Set<string>();

        const addKill = (date: string, rawWorld: string, count: number) => {
            const world = normalizeWorld(rawWorld);
            const key = `${date}-${world}`;
            if (seen.has(key)) return;
            const [day, month, year] = date.split('/');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const adjusted = getAdjustedKillCount(bossName, count);
            if (adjusted > 0) {
                kills.push({ date, world, count: adjusted, timestamp: dateObj.getTime() });
                seen.add(key);
            }
        };

        // Add daily kills
        if (data.daily) {
            const dailyBoss = data.daily.kills.find(k => k.bossName === bossName);
            if (dailyBoss) {
                dailyBoss.worlds.forEach(w => {
                    const date = data.daily?.date || new Date().toLocaleDateString('en-GB');
                    addKill(date, w.world, w.count);
                });
            }
        }

        // Add all historical kills
        Object.entries(bossHistory.killsByWorld).forEach(([world, entries]) => {
            const byDate: Record<string, number> = {};
            entries.forEach(e => { byDate[e.date] = (byDate[e.date] || 0) + e.count; });
            Object.entries(byDate).forEach(([date, count]) => addKill(date, world, count));
        });

        return kills.sort((a, b) => b.timestamp - a.timestamp);
    }, [bossName, data.killDates, data.daily]);

    // ── Aggregate Stats ───────────────────────────────────────
    const globalStats = useMemo(() => {
        const totalKills = allKillsByDate.reduce((sum, k) => sum + k.count, 0);
        const worldsSet = new Set(allKillsByDate.map(k => k.world));
        const totalDays = new Set(allKillsByDate.map(k => k.date)).size;

        // Last seen
        let lastSeenStr = 'Nunca';
        let daysSinceLast = 0;
        if (allKillsByDate.length > 0) {
            const latest = allKillsByDate[0];
            lastSeenStr = latest.date;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            daysSinceLast = Math.ceil(Math.abs(today.getTime() - latest.timestamp) / (1000 * 60 * 60 * 24));
        }

        return { totalKills, worldCount: worldsSet.size, totalDays, lastSeenStr, daysSinceLast };
    }, [allKillsByDate]);

    // ── Predictions ───────────────────────────────────────────
    const { predictions: allPredictions } = useBossPredictions(data.killDates, predictionWorld);

    const prediction = useMemo(() => {
        return allPredictions.find(p => p.bossName === bossName) ?? null;
    }, [allPredictions, bossName]);

    // All-world predictions for the comparison table
    const allWorldPredictions = useMemo(() => {
        const results: Prediction[] = [];
        if (!data.killDates) return results;

        for (const world of WORLDS) {
            // This is a simplified lookup — we check if a prediction exists for each world
            const worldPreds = allPredictions.filter(p => p.bossName === bossName && p.world === world);
            results.push(...worldPreds);
        }
        return results;
    }, [allPredictions, bossName]);

    // Get predictions for ALL worlds (need separate hook calls conceptually, 
    // but we can use the existing prediction if world matches, otherwise show data from kills)
    const worldKillSummary = useMemo(() => {
        if (!data.killDates) return [];
        const bossHistory = data.killDates.find(h => h.bossName === bossName);
        if (!bossHistory) return [];

        // Group kills by normalized world name
        const worldMap: Record<string, { totalKills: number; lastKill: string; killCount: number }> = {};
        Object.entries(bossHistory.killsByWorld).forEach(([rawWorld, entries]) => {
            const world = normalizeWorld(rawWorld);
            if (!worldMap[world]) worldMap[world] = { totalKills: 0, lastKill: 'Nunca', killCount: 0 };
            const totalKills = entries.reduce((sum, e) => sum + getAdjustedKillCount(bossName, e.count), 0);
            worldMap[world].totalKills += totalKills;
            worldMap[world].killCount += entries.length;
            const sortedEntries = [...entries].sort((a, b) => {
                const [da, ma, ya] = a.date.split('/').map(Number);
                const [db, mb, yb] = b.date.split('/').map(Number);
                return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
            });
            if (sortedEntries[0]) {
                const [d, m, y] = sortedEntries[0].date.split('/').map(Number);
                const currentLast = worldMap[world].lastKill;
                if (currentLast === 'Nunca') {
                    worldMap[world].lastKill = sortedEntries[0].date;
                } else {
                    const [cd, cm, cy] = currentLast.split('/').map(Number);
                    if (new Date(y, m - 1, d) > new Date(cy, cm - 1, cd)) {
                        worldMap[world].lastKill = sortedEntries[0].date;
                    }
                }
            }
        });
        return Object.entries(worldMap)
            .map(([world, data]) => ({ world, ...data }))
            .sort((a, b) => b.totalKills - a.totalKills);
    }, [bossName, data.killDates]);



    // ── World Colors for stacked chart ───────────────────
    const WORLD_COLORS: Record<string, string> = {
        'Auroria': '#f59e0b',
        'Belaria': '#3b82f6',
        'Bellum': '#ef4444',
        'Elysian': '#a855f7',
        'Lunarian': '#6366f1',
        'Mystian': '#ec4899',
        'Serenian': '#14b8a6',
        'Etherian': '#06b6d4',
        'Halorian': '#84cc16',
        'Divinian': '#f97316',
        'Solarian': '#eab308',
        'Spectrum': '#8b5cf6',
        'Tenebrium': '#64748b',
        'Vesperia': '#22d3ee',
    };

    // ── Monthly Activity Chart Data (stacked by server) ──────
    const stackedMonthlyActivity = useMemo(() => {
        // Build per-month per-world
        const byMonthWorld: Record<string, Record<string, number>> = {};
        allKillsByDate.forEach(kill => {
            const [, month, year] = kill.date.split('/');
            const key = `${month}/${year}`;
            if (!byMonthWorld[key]) byMonthWorld[key] = {};
            byMonthWorld[key][kill.world] = (byMonthWorld[key][kill.world] || 0) + kill.count;
        });

        const entries = Object.entries(byMonthWorld)
            .map(([key, worlds]) => {
                const [m, y] = key.split('/').map(Number);
                const total = Object.values(worlds).reduce((s, v) => s + v, 0);
                return { label: key, worlds, total, timestamp: new Date(y, m - 1, 1).getTime() };
            })
            .sort((a, b) => a.timestamp - b.timestamp);

        // Apply time filter
        const now = new Date();
        let cutoff = 0;
        if (activityRange === '3M') cutoff = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime();
        else if (activityRange === '6M') cutoff = new Date(now.getFullYear(), now.getMonth() - 6, 1).getTime();

        return cutoff > 0 ? entries.filter(e => e.timestamp >= cutoff) : entries;
    }, [allKillsByDate, activityRange]);

    const maxMonthly = Math.max(...stackedMonthlyActivity.map(m => m.total), 1);
    const activeWorlds = useMemo(() => {
        const set = new Set<string>();
        stackedMonthlyActivity.forEach(m => Object.keys(m.worlds).forEach(w => set.add(w)));
        return [...set].sort();
    }, [stackedMonthlyActivity]);

    // ── Available servers for calendar filter ─────────────────
    const availableServers = useMemo(() => {
        return [...new Set(allKillsByDate.map(k => k.world))].sort();
    }, [allKillsByDate]);

    // ── Helpers ───────────────────────────────────────────────
    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        return `${weekday}, ${d}/${m}/${y}`;
    };

    const categoryColors: Record<BossCategory, string> = {
        Archdemons: 'bg-red-500/20 text-red-400 border-red-500/30',
        POI: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        Nemesis: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        Criaturas: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        RubinOT: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };

    const toggleWorld = (worldName: string) => {
        setExpandedWorlds(prev => ({ ...prev, [worldName]: !prev[worldName] }));
    };

    if (isLoading) return <Loading />;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* ── Back Button ─────────────────────────────────── */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-secondary hover:text-white transition-colors text-sm group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Voltar
            </button>

            {/* ══════════════════════════════════════════════════
                 SECTION 1: HERO HEADER
                 ══════════════════════════════════════════════════ */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Boss Image */}
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-surface-hover border border-border/50 flex items-center justify-center shrink-0 relative overflow-hidden">
                            {bossImage ? (
                                <img src={bossImage} alt={bossName} className="w-[130%] h-[130%] max-w-none object-contain absolute -top-[15%] drop-shadow-lg" />
                            ) : (
                                <span className="text-3xl font-bold text-secondary">{bossName.slice(0, 2)}</span>
                            )}
                        </div>

                        {/* Boss Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{bossName}</h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[category]}`}>
                                            {category}
                                        </span>
                                        {knownPattern && (
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-violet-500/20 text-violet-400 border-violet-500/30">
                                                {knownPattern.type === 'EVENT' ? '📅 Evento' : knownPattern.type === 'FIXED' ? '🔒 Fixo' : '⚔️ Raid'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {extraInfo?.wiki && (
                                    <a
                                        href={extraInfo.wiki}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-lg bg-surface-hover/50 text-secondary hover:text-primary hover:bg-surface-hover transition-colors border border-border/50 shrink-0"
                                        title="Abrir TibiaWiki"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>

                            {/* Description */}
                            {extraInfo?.description && (
                                <p className="text-sm text-secondary/90 leading-relaxed mb-4 max-w-2xl">
                                    {extraInfo.description}
                                </p>
                            )}

                            {/* Global Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-surface-hover/30 p-3 rounded-lg border border-border/50">
                                    <div className="text-[10px] text-secondary uppercase tracking-wider mb-1">Total de Mortes</div>
                                    <div className="text-xl font-bold text-white">{formatNumber(globalStats.totalKills)}</div>
                                </div>
                                <div className="bg-surface-hover/30 p-3 rounded-lg border border-border/50">
                                    <div className="text-[10px] text-secondary uppercase tracking-wider mb-1">Servidores Ativos</div>
                                    <div className="text-xl font-bold text-white">{globalStats.worldCount}</div>
                                </div>
                                <div className="bg-surface-hover/30 p-3 rounded-lg border border-border/50">
                                    <div className="text-[10px] text-secondary uppercase tracking-wider mb-1">Última Aparição</div>
                                    <div className="text-sm font-medium text-white">{globalStats.lastSeenStr}</div>
                                    {globalStats.daysSinceLast > 0 && (
                                        <div className="text-[10px] text-secondary">{globalStats.daysSinceLast} dias atrás</div>
                                    )}
                                </div>
                                <div className="bg-surface-hover/30 p-3 rounded-lg border border-border/50">
                                    <div className="text-[10px] text-secondary uppercase tracking-wider mb-1">Intervalo Mín.</div>
                                    <div className="text-xl font-bold text-white">
                                        {knownPattern ? `${knownPattern.min}d` : `${minInterval}d`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ───────────────────────────────── */}
            <div className="flex items-center gap-1 bg-surface rounded-lg border border-border p-1">
                {([
                    { key: 'overview' as ActiveTab, label: 'Visão Geral', icon: Info },
                    { key: 'predictions' as ActiveTab, label: 'Previsões', icon: TrendingUp },
                    { key: 'history' as ActiveTab, label: 'Histórico', icon: Clock },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-secondary hover:text-white hover:bg-surface-hover'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════
                 TAB: OVERVIEW
                 ══════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stacked Monthly Activity Chart — Full Width */}
                    <div className="bg-surface rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <BarChart3 size={16} className="text-primary" />
                                Atividade Mensal
                            </h2>
                            <div className="flex bg-surface-hover rounded-lg p-0.5 border border-border/50">
                                {(['3M', '6M', 'ALL'] as const).map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setActivityRange(range)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                            activityRange === range
                                                ? 'bg-primary/20 text-primary'
                                                : 'text-secondary hover:text-white'
                                        }`}
                                    >
                                        {range === 'ALL' ? 'Tudo' : range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {stackedMonthlyActivity.length > 0 ? (() => {
                            // Calculate nice Y-axis ticks
                            const yTicks: number[] = [];
                            const rawStep = maxMonthly / 4;
                            const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
                            const step = Math.max(1, Math.ceil(rawStep / magnitude) * magnitude);
                            for (let v = 0; v <= maxMonthly; v += step) yTicks.push(v);
                            if (yTicks[yTicks.length - 1] < maxMonthly) yTicks.push(yTicks[yTicks.length - 1] + step);
                            const yMax = yTicks[yTicks.length - 1] || 1;

                            return (
                                <>
                                    <div className="flex">
                                        {/* Y-axis labels */}
                                        <div className="flex flex-col-reverse justify-between pr-2 py-0 w-8 shrink-0 h-[450px]">
                                            {yTicks.map(v => (
                                                <span key={v} className="text-[10px] text-secondary font-mono text-right leading-none">{v}</span>
                                            ))}
                                        </div>
                                        {/* Chart area */}
                                        <div className="flex-1 relative h-[450px]">
                                            {/* Gridlines */}
                                            {yTicks.map(v => (
                                                <div
                                                    key={v}
                                                    className="absolute w-full border-t border-border/30"
                                                    style={{ bottom: `${(v / yMax) * 100}%` }}
                                                />
                                            ))}
                                            {/* Bars */}
                                            <div className="relative flex items-end gap-1.5 h-full z-10 px-1">
                                                {stackedMonthlyActivity.map((m) => {
                                                    const barHeight = (m.total / yMax) * 100;
                                                    return (
                                                        <div key={m.label} className="flex-1 relative h-full flex flex-col justify-end group">
                                                            {/* Tooltip */}
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                                                <div className="bg-black/95 border border-white/10 rounded-lg px-3 py-2 text-[11px] shadow-xl w-max">
                                                                    <div className="font-medium text-white mb-1.5 border-b border-white/10 pb-1">{m.label}</div>
                                                                    {Object.entries(m.worlds)
                                                                        .sort((a, b) => b[1] - a[1])
                                                                        .map(([world, count]) => (
                                                                            <div key={world} className="flex items-center gap-2 justify-between py-0.5">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: WORLD_COLORS[world] || '#666' }} />
                                                                                    <span className="text-secondary">{world}</span>
                                                                                </div>
                                                                                <span className="text-white font-mono ml-3">{count}</span>
                                                                            </div>
                                                                        ))}
                                                                    <div className="border-t border-white/10 mt-1 pt-1 flex justify-between font-medium">
                                                                        <span className="text-secondary">Total</span>
                                                                        <span className="text-white font-mono">{m.total}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Count label above bar (Absolute) */}
                                                            <div
                                                                className="absolute w-full text-center text-[10px] text-secondary font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1"
                                                                style={{ bottom: `${barHeight}%` }}
                                                            >
                                                                {m.total}
                                                            </div>

                                                            {/* Unified Bar */}
                                                            <div
                                                                className="w-full rounded-t-sm overflow-hidden cursor-pointer transition-all group-hover:bg-primary/40 bg-slate-500/30 border-x border-t border-white/5 shadow-lg"
                                                                style={{ height: `${barHeight}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    {/* X-axis labels */}
                                    <div className="flex ml-8 mt-1">
                                        <div className="flex-1 flex gap-1.5">
                                            {stackedMonthlyActivity.map(m => (
                                                <div key={m.label} className="flex-1 text-[9px] text-secondary text-center truncate">{m.label}</div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })() : (
                            <div className="text-center py-8 text-secondary text-sm">Dados insuficientes</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kill Calendar */}
                        <div className="bg-surface rounded-xl border border-border p-5">
                            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                Calendário de Mortes
                            </h2>
                            <MiniCalendar
                                allKillsByDate={allKillsByDate}
                                availableServers={availableServers}
                            />
                        </div>

                        {/* World Comparison */}
                        <div className="bg-surface rounded-xl border border-border p-5">
                            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Server size={16} className="text-primary" />
                                Mortes por Servidor
                            </h2>
                            {worldKillSummary.length > 0 ? (
                                <div className="space-y-2">
                                    {worldKillSummary.map((ws, i) => {
                                        const maxWorldKills = worldKillSummary[0]?.totalKills || 1;
                                        const barWidth = (ws.totalKills / maxWorldKills) * 100;
                                        return (
                                            <div key={ws.world} className="group">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: WORLD_COLORS[ws.world] || '#666' }} />
                                                        <span className="text-white font-medium">{ws.world}</span>
                                                    </div>
                                                    <span className="text-secondary">{ws.totalKills} mortes</span>
                                                </div>
                                                <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${barWidth}%` }}
                                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: WORLD_COLORS[ws.world] || '#666' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-secondary text-sm">Sem dados</div>
                            )}
                        </div>
                    </div>

                    {/* Extra Info: Loot & Locations */}
                    {extraInfo && ((extraInfo.loot?.length ?? 0) > 0 || (extraInfo.locations?.length ?? 0) > 0) && (
                        <div className="bg-surface rounded-xl border border-border p-5">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-primary" />
                                Informações Adicionais
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(extraInfo.loot?.length ?? 0) > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="text-yellow-400">✨</span> Loot Valioso
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {extraInfo.loot!.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-surface-hover/50 px-2.5 py-1.5 rounded border border-border/30">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                                                    )}
                                                    <span className="text-xs font-medium text-secondary">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(extraInfo.locations?.length ?? 0) > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="text-emerald-400">📍</span> Localização
                                        </h3>
                                        <div className="space-y-2">
                                            {extraInfo.locations!.map((loc, i) => (
                                                <div key={i} className="text-xs text-secondary bg-surface-hover/50 px-3 py-2 rounded border border-border/30 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    {loc.description || `Localização ${i + 1}`} — x:{loc.x} y:{loc.y} z:{loc.z}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════
                 TAB: PREDICTIONS
                 ══════════════════════════════════════════════════ */}
            {activeTab === 'predictions' && (
                <div className="space-y-6">
                    {/* World Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        {WORLDS.map((world) => (
                            <button
                                key={world}
                                onClick={() => setPredictionWorld(world)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${predictionWorld === world
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-surface text-secondary hover:text-white hover:bg-surface-hover border border-border/50'
                                    }`}
                            >
                                <img src={getWorldIcon(world)} alt={world} className="w-4 h-4" />
                                <span>{world}</span>
                            </button>
                        ))}
                    </div>

                    {prediction ? (
                        <>
                            {/* Status + Timeline */}
                            <div className="bg-surface rounded-xl border border-border p-5 space-y-5">
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
                                            prediction.status === 'WINDOW_OPEN' ? 'text-emerald-400' : 'text-blue-400'
                                            }`}>
                                            {prediction.probabilityLabel}
                                        </span>
                                        <span className="text-xs text-secondary ml-auto">{predictionWorld}</span>
                                    </div>
                                    <p className="text-xs text-secondary/80">
                                        {prediction.status === 'OVERDUE' ? 'Este boss excedeu seu tempo máximo de espera.' :
                                            prediction.status === 'WINDOW_OPEN' ? 'A janela de spawn está ativa.' :
                                                'O boss está atualmente em período de recarga.'}
                                    </p>
                                </div>

                                {/* Timeline */}
                                <div className="p-4 rounded-lg bg-surface-hover/30 border border-border/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-secondary">Ciclo de Spawn</span>
                                        <div className="flex items-center gap-3 text-[10px] text-secondary">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-800/50 inline-block"></span>Janela</span>
                                            {prediction.stats?.tightMinGap !== undefined && prediction.stats?.tightMaxGap !== undefined && prediction.stats.tightMinGap !== prediction.stats.tightMaxGap && (
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400/80 inline-block"></span>P25–P75</span>
                                            )}
                                        </div>
                                    </div>
                                    <BossTimeline
                                        minGap={prediction.stats?.minGap || 1}
                                        maxGap={prediction.stats?.maxGap || 1}
                                        daysSince={prediction.daysSinceKill}
                                        status={prediction.status}
                                        tightMinGap={prediction.stats?.tightMinGap}
                                        tightMaxGap={prediction.stats?.tightMaxGap}
                                    />
                                </div>



                                {/* Key Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface-hover/50 p-3 rounded-lg border border-emerald-500/20">
                                        <div className="text-xs text-secondary mb-1">Janela Abre</div>
                                        <div className="font-medium text-white text-sm">{formatDate(prediction.nextMinSpawn)}</div>
                                    </div>
                                    <div className="bg-surface-hover/50 p-3 rounded-lg border border-emerald-500/20">
                                        <div className="text-xs text-secondary mb-1">Janela Fecha</div>
                                        <div className="font-medium text-white text-sm">{formatDate(prediction.nextMaxSpawn)}</div>
                                    </div>
                                </div>

                                {prediction.tightMinSpawn && prediction.tightMaxSpawn && prediction.stats?.tightMinGap !== prediction.stats?.tightMaxGap && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-400/20">
                                            <div className="text-xs text-emerald-400/80 mb-1">Zona Provável (P25)</div>
                                            <div className="font-medium text-emerald-300 text-sm">{formatDate(prediction.tightMinSpawn)}</div>
                                        </div>
                                        <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-400/20">
                                            <div className="text-xs text-emerald-400/80 mb-1">Zona Provável (P75)</div>
                                            <div className="font-medium text-emerald-300 text-sm">{formatDate(prediction.tightMaxSpawn)}</div>
                                        </div>
                                    </div>
                                )}


                            </div>

                            {/* Stats Table */}
                            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                                <div className="bg-surface-hover/50 px-5 py-3 border-b border-border/50">
                                    <h3 className="text-sm font-bold text-white">Estatísticas de Previsão</h3>
                                </div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-border/30">
                                            <td className="px-5 py-2.5 text-secondary">Intervalo Mín</td>
                                            <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats?.minGap ?? '?'} dias</td>
                                        </tr>
                                        <tr className="border-b border-border/30">
                                            <td className="px-5 py-2.5 text-secondary">Intervalo Máx</td>
                                            <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats?.maxGap ?? '?'} dias</td>
                                        </tr>
                                        <tr className="border-b border-border/30">
                                            <td className="px-5 py-2.5 text-secondary">Intervalo Médio</td>
                                            <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats?.avgGap ?? '?'} dias</td>
                                        </tr>
                                        <tr className="border-b border-border/30">
                                            <td className="px-5 py-2.5 text-secondary">Desvio Padrão</td>
                                            <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats?.stdDev?.toFixed(2) ?? '?'} dias</td>
                                        </tr>
                                        {prediction.stats?.p25 !== undefined && prediction.stats?.p75 !== undefined && prediction.stats.p25 !== prediction.stats.p75 && (
                                            <>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-5 py-2.5 text-secondary">P25</td>
                                                    <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats.p25.toFixed(1)} dias</td>
                                                </tr>
                                                <tr className="border-b border-border/30">
                                                    <td className="px-5 py-2.5 text-secondary">P75</td>
                                                    <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats.p75.toFixed(1)} dias</td>
                                                </tr>
                                            </>
                                        )}
                                        <tr className="border-b border-border/30">
                                            <td className="px-5 py-2.5 text-secondary">Amostra</td>
                                            <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats?.sampleSize ?? 0} intervalos</td>
                                        </tr>
                                        <tr>
                                            <td className="px-5 py-2.5 text-secondary">Mundos</td>
                                            <td className="px-5 py-2.5 text-white font-mono text-right">{prediction.stats?.worldGaps ? Object.keys(prediction.stats.worldGaps).length : 0}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* World-by-World Breakdown */}
                            {prediction.stats?.worldGaps && Object.keys(prediction.stats.worldGaps).length > 0 && (
                                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                                    <div className="bg-surface-hover/50 px-5 py-3 border-b border-border/50">
                                        <h3 className="text-sm font-bold text-white">Intervalos por Mundo</h3>
                                    </div>
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(prediction.stats.worldGaps).map(([world, gaps]) => (
                                            <div key={world} className="bg-surface-hover/30 p-3 rounded border border-border/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-white flex items-center gap-2">
                                                        <img src={getWorldIcon(world)} alt={world} className="w-3.5 h-3.5" />
                                                        {world}
                                                    </span>
                                                    <span className="text-xs text-secondary">{gaps.length} intervalos</span>
                                                </div>
                                                <div className="text-xs text-secondary font-mono">
                                                    [{gaps.join(', ')}] dias
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step-by-Step Math */}
                            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                                <div className="bg-surface-hover/50 px-5 py-3 border-b border-border/50 flex items-center gap-2">
                                    <Calculator size={16} className="text-primary" />
                                    <h3 className="text-sm font-bold text-white">Cálculos Passo-a-Passo</h3>
                                </div>
                                <div className="p-5 space-y-5 text-sm">
                                    <div>
                                        <div className="text-primary font-bold mb-1">1. Coletar Todos os Intervalos</div>
                                        <div className="text-secondary text-xs mb-1">Diferença de tempo entre kills consecutivas em todos os mundos</div>
                                        <div className="bg-surface-hover/50 p-2 rounded text-xs font-mono text-white overflow-x-auto">
                                            Intervalos = [{prediction.stats?.rawGaps?.join(', ')}]
                                        </div>
                                        <div className="text-xs text-secondary mt-1">Total: {prediction.stats?.rawGaps?.length} intervalos</div>
                                    </div>
                                    <div>
                                        <div className="text-primary font-bold mb-1">2. Filtrar Outliers (80º Percentil)</div>
                                        <div className="text-secondary text-xs mb-1">Remover anomalias causadas por mortes perdidas</div>
                                        <div className="bg-surface-hover/50 p-2 rounded text-xs font-mono text-white overflow-x-auto">
                                            Filtrados = [{prediction.stats?.filteredGaps?.join(', ')}]
                                        </div>
                                        <div className="text-xs text-secondary mt-1">
                                            Mantidos: {prediction.stats?.filteredGaps?.length} | Removidos: {(prediction.stats?.rawGaps?.length ?? 0) - (prediction.stats?.filteredGaps?.length ?? 0)}
                                        </div>
                                    </div>
                                    {prediction.stats?.p25 !== undefined && prediction.stats?.p75 !== undefined && prediction.stats.p25 !== prediction.stats.p75 && (
                                        <div>
                                            <div className="text-emerald-400 font-bold mb-1">2.5. IQR (P25–P75)</div>
                                            <div className="text-secondary text-xs mb-1">Faixa onde 50% das kills historicamente ocorrem</div>
                                            <div className="bg-emerald-500/10 p-2 rounded text-xs font-mono text-emerald-300 border border-emerald-500/20">
                                                P25 = {prediction.stats.p25.toFixed(1)} dias | P75 = {prediction.stats.p75.toFixed(1)} dias
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-primary font-bold mb-1">3. Estatísticas Finais</div>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between"><span className="text-secondary">Mín:</span><span className="text-white font-mono">{prediction.stats?.minGap} dias</span></div>
                                            <div className="flex justify-between"><span className="text-secondary">Máx:</span><span className="text-white font-mono">{prediction.stats?.maxGap} dias</span></div>
                                            <div className="flex justify-between"><span className="text-secondary">Média:</span><span className="text-white font-mono">{prediction.stats?.avgGap} dias</span></div>
                                            <div className="flex justify-between"><span className="text-secondary">Desvio Padrão:</span><span className="text-white font-mono">{prediction.stats?.stdDev?.toFixed(2)} dias</span></div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-surface rounded-xl border border-border p-8 text-center">
                            <AlertCircle size={32} className="text-secondary mx-auto mb-3" />
                            <p className="text-secondary">
                                Dados de previsão insuficientes para <span className="text-white font-medium">{bossName}</span> em <span className="text-white font-medium">{predictionWorld}</span>.
                            </p>
                            <p className="text-xs text-secondary/60 mt-1">Selecione outro servidor ou aguarde mais dados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════
                 TAB: HISTORY
                 ══════════════════════════════════════════════════ */}
            {activeTab === 'history' && (
                <div className="space-y-6">
                    {/* Sort Toggles */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Histórico de Mortes
                            <span className="text-xs font-normal text-secondary bg-surface-hover px-2 py-0.5 rounded-full">
                                {allKillsByDate.length}
                            </span>
                        </h2>
                        <div className="flex bg-surface-hover rounded-lg p-1 border border-border/50">
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
                        </div>
                    </div>

                    {/* History Content */}
                    <div className="bg-surface rounded-xl border border-border overflow-hidden">
                        {sortMode === 'date' ? (
                            // ── Date View ──
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
                                                    <div className="text-xs text-secondary flex items-center gap-1.5">
                                                        <img src={getWorldIcon(kill.world)} alt={kill.world} className="w-3 h-3" />
                                                        {kill.world}
                                                    </div>
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
                        ) : (
                            // ── Server View ──
                            <div className="p-4 space-y-2">
                                {worldKillSummary.length > 0 ? (
                                    worldKillSummary.map(ws => {
                                        const worldKills = allKillsByDate.filter(k => k.world === ws.world);
                                        return (
                                            <div key={ws.world} className="border border-border/30 rounded-lg overflow-hidden bg-surface-hover/10">
                                                <button
                                                    onClick={() => toggleWorld(ws.world)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-surface-hover/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {expandedWorlds[ws.world] ? <ChevronDown size={16} className="text-secondary" /> : <ChevronRight size={16} className="text-secondary" />}
                                                        <img src={getWorldIcon(ws.world)} alt={ws.world} className="w-4 h-4" />
                                                        <span className="font-medium text-white">{ws.world}</span>
                                                    </div>
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-medium">
                                                        {formatNumber(ws.totalKills)} mortes
                                                    </span>
                                                </button>

                                                {expandedWorlds[ws.world] && (
                                                    <div className="p-3 pt-0 border-t border-border/30 space-y-1.5 bg-black/20">
                                                        {worldKills.length > 0 ? (
                                                            worldKills.map((kill, i) => (
                                                                <div key={i} className="text-sm text-secondary/80 flex items-center justify-between pl-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1 h-1 rounded-full bg-secondary/50"></div>
                                                                        {kill.date}
                                                                    </div>
                                                                    {kill.count > 1 && <span className="text-emerald-400 text-xs font-bold">{kill.count}x</span>}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs text-secondary/50 pl-6 py-1 italic">Datas detalhadas não disponíveis</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-secondary py-8">Sem histórico disponível</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
