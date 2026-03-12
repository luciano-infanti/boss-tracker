'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useWorld } from '@/context/WorldContext';
import { useBossPredictions } from '@/hooks/useBossPredictions';
import { Prediction } from '@/utils/spawnLogic';
import BossTimeline from '@/components/BossTimeline';
import BossCard from '@/components/BossCard';

import { List as ListIcon } from 'lucide-react';
import Loading from '@/components/Loading';

import { getWorldIcon } from '@/utils/worldIcons';

import { isSuppressed } from '@/utils/suppressedBosses';
import { getBossCategory } from '@/utils/bossCategories';

const formatShort = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

export default function PredictionsPageClient() {
    const { data, isLoading } = useData();
    const { selectedWorld, worlds } = useWorld();
    const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
    const predRouter = useRouter();
    const [localWorld, setLocalWorld] = useState<string>(selectedWorld || 'Auroria');

    // Sync local world with global world when it changes (but keep Auroria as fallback)
    useEffect(() => {
        setLocalWorld(selectedWorld || 'Auroria');
    }, [selectedWorld]);

    const { predictions: rawPredictions } = useBossPredictions(data.killDates, localWorld);

    const predictions = useMemo(() => {
        return rawPredictions.filter(p => !isSuppressed(p.bossName) && getBossCategory(p.bossName) !== 'Criaturas');
    }, [rawPredictions]);

    // Group predictions
    const groupedPredictions = useMemo(() => {
        const groups = {
            'Window Open': [] as Prediction[],  // Actively huntable NOW
            'Opens Today': [] as Prediction[],  // Opens today but still in COOLDOWN
            'Overdue': [] as Prediction[],      // Likely ghosts/missed
            'Tomorrow': [] as Prediction[],
            'Next 7 Days': [] as Prediction[],
            'Later': [] as Prediction[]
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        predictions.forEach(pred => {
            if (pred.status === 'WINDOW_OPEN') {
                groups['Window Open'].push(pred);
            }
            else if (pred.status === 'OVERDUE') {
                groups['Overdue'].push(pred);
            }
            else {
                const predDate = new Date(pred.nextMinSpawn.getFullYear(), pred.nextMinSpawn.getMonth(), pred.nextMinSpawn.getDate());

                if (predDate.getTime() === today.getTime()) {
                    groups['Opens Today'].push(pred); // #7 FIX: Separate group instead of overriding engine status
                }
                else if (predDate.getTime() === tomorrow.getTime()) {
                    groups['Tomorrow'].push(pred);
                }
                else if (predDate <= nextWeek) {
                    groups['Next 7 Days'].push(pred);
                }
                else {
                    groups['Later'].push(pred);
                }
            }
        });

        // Sort 'Opens Today' by boss name
        groups['Opens Today'].sort((a, b) => a.bossName.localeCompare(b.bossName));

        // Sort 'Window Open': closest to closing first (highest progress)
        groups['Window Open'].sort((a, b) => b.windowProgress - a.windowProgress);

        // Sort 'Overdue': less overdue first
        groups['Overdue'].sort((a, b) => a.windowProgress - b.windowProgress);

        // Sort cooldown groups by opening time
        groups['Tomorrow'].sort((a, b) => a.nextMinSpawn.getTime() - b.nextMinSpawn.getTime());
        groups['Next 7 Days'].sort((a, b) => a.nextMinSpawn.getTime() - b.nextMinSpawn.getTime());

        return groups;
    }, [predictions]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-white">Previsões 🔮</h1>
                </div>

                {/* World Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {worlds.map((world) => {
                        return (
                            <button
                                key={world}
                                onClick={() => setLocalWorld(world)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${localWorld === world
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-surface text-secondary hover:text-white hover:bg-surface-hover border border-border/50'
                                    }`}
                            >
                                <img
                                    src={getWorldIcon(world)}
                                    alt={world}
                                    className="w-4 h-4"
                                />
                                <span>{world}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {predictions.length === 0 ? (
                <div className="text-center py-12 text-secondary bg-surface rounded-lg border border-border">
                    Dados de previsão não disponíveis ou insuficientes para {selectedWorld}.
                </div>
            ) : (
                <>
                    <div className="space-y-8">
                        {Object.entries(groupedPredictions).map(([group, preds]) => {
                            if (preds.length === 0) return null;

                            const groupTitle = {
                                'Window Open': 'Janela Aberta',
                                'Opens Today': 'Abre Hoje',
                                'Overdue': 'Atrasados',
                                'Tomorrow': 'Amanhã',
                                'Next 7 Days': 'Próximos 7 Dias',
                                'Later': 'Mais Tarde'
                            }[group] || group;

                            const isWindowOpen = group === 'Window Open';
                            const isOpensToday = group === 'Opens Today';
                            const isOverdue = group === 'Overdue';

                            return (
                                <div key={group} className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isWindowOpen ? 'text-emerald-400' :
                                            isOpensToday ? 'text-amber-400' :
                                            isOverdue ? 'text-red-400' : 'text-secondary'
                                            }`}>
                                            {isWindowOpen && <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>}
                                            {groupTitle}
                                            <span className="text-xs font-normal text-secondary bg-surface-hover px-2 py-0.5 rounded-full">
                                                {preds.length}
                                            </span>
                                        </h2>
                                        {isWindowOpen && (
                                            <p className="text-xs text-secondary/70">Janela de spawn aberta. Verificar agora!</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {preds.map((pred, idx) => {
                                            // Format window dates as DD/MM — DD/MM
                                            const openDate = pred.nextMinSpawn;
                                            const closeDate = pred.nextMaxSpawn;
                                            const openStr = `${openDate.getDate().toString().padStart(2, '0')}/${(openDate.getMonth() + 1).toString().padStart(2, '0')}`;
                                            const closeStr = `${closeDate.getDate().toString().padStart(2, '0')}/${(closeDate.getMonth() + 1).toString().padStart(2, '0')}`;
                                            const windowStr = `${openStr} — ${closeStr}`;

                                            const bossData: any = {
                                                name: pred.bossName,
                                                totalDaysSpawned: 0,
                                                totalKills: 0,
                                                spawnFrequency: `${pred.stats?.avgGap || '?'} dias`,
                                                nextExpectedSpawn: windowStr,
                                                lastKillDate: 'Ver Detalhes',
                                                history: '',
                                                confidence: pred.confidence,
                                                confidenceLabel: pred.confidenceLabel
                                            };

                                            return (
                                                <div key={`${pred.bossName}-${pred.world}-${idx}`} className="relative group/legend">
                                                    <BossCard
                                                        boss={bossData}
                                                        type="world"
                                                        status={pred.status}
                                                        isKilledToday={false}
                                                        isNew={false}
                                                        showNextSpawn={true}
                                                        hideStats={true}
                                                        showLastKill={false}
                                                        hideConfidence={true}
                                                        onClick={() => predRouter.push(`/boss/${encodeURIComponent(pred.bossName)}`)}
                                                    >
                                                        <div className="w-full mt-2">
                                                            <BossTimeline
                                                                minGap={pred.stats?.minGap || 1}
                                                                maxGap={pred.stats?.maxGap || 1}
                                                                daysSince={pred.daysSinceKill}
                                                                status={pred.status}
                                                                tightMinGap={pred.stats?.tightMinGap}
                                                                tightMaxGap={pred.stats?.tightMaxGap}
                                                            />
                                                        </div>
                                                    </BossCard>

                                                    {/* Hover legend */}
                                                    {(() => {
                                                        const now = new Date();
                                                        now.setHours(0, 0, 0, 0);
                                                        const daysUntilOpen = Math.ceil((pred.nextMinSpawn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                        const daysUntilClose = Math.ceil((pred.nextMaxSpawn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                        const hasTight = pred.tightMinSpawn && pred.tightMaxSpawn && pred.stats?.tightMinGap !== pred.stats?.tightMaxGap;

                                                        const outerStatusText = pred.status === 'WINDOW_OPEN'
                                                            ? `Fecha em ${daysUntilClose} dia${daysUntilClose !== 1 ? 's' : ''}`
                                                            : pred.status === 'OVERDUE'
                                                                ? `Atrasado ${Math.abs(daysUntilClose)} dia${Math.abs(daysUntilClose) !== 1 ? 's' : ''}`
                                                                : `Abre em ${daysUntilOpen} dia${daysUntilOpen !== 1 ? 's' : ''}`;

                                                        // Inner window status
                                                        let innerStatusText = '';
                                                        if (hasTight && pred.tightMaxSpawn) {
                                                            const daysUntilTightClose = Math.ceil((pred.tightMaxSpawn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                            const tightOpen = pred.tightMinSpawn && now >= pred.tightMinSpawn;
                                                            const tightClosed = now > pred.tightMaxSpawn;
                                                            if (tightOpen && !tightClosed) {
                                                                innerStatusText = `Fecha em ${daysUntilTightClose} dia${daysUntilTightClose !== 1 ? 's' : ''}`;
                                                            }
                                                        }

                                                        return (
                                                            <div className="absolute left-0 right-0 -bottom-1 translate-y-full opacity-0 group-hover/legend:opacity-100 transition-opacity duration-150 z-30 pointer-events-none">
                                                                <div className="bg-black/95 border border-white/10 rounded-lg px-3 py-2 text-[11px] space-y-2 shadow-xl">
                                                                    {/* Outer window */}
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800/60 border border-emerald-700/50 shrink-0"></span>
                                                                            <span className="text-secondary font-medium">Possível</span>
                                                                        </div>
                                                                        <div className="pl-4 flex items-center justify-between gap-3">
                                                                            <span className="text-white">{formatShort(pred.nextMinSpawn)} até {formatShort(pred.nextMaxSpawn)}</span>
                                                                            <span className={`text-[10px] ${pred.status === 'OVERDUE' ? 'text-red-400' : pred.status === 'WINDOW_OPEN' ? 'text-emerald-400' : 'text-secondary'}`}>
                                                                                {outerStatusText}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Inner window */}
                                                                    {hasTight && (
                                                                        <>
                                                                            <div className="border-t border-white/5"></div>
                                                                            <div>
                                                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                                                                                    <span className="text-emerald-300 font-medium">Provável</span>
                                                                                </div>
                                                                                <div className="pl-4 flex items-center justify-between gap-3">
                                                                                    <span className="text-white">{formatShort(pred.tightMinSpawn!)} até {formatShort(pred.tightMaxSpawn!)}</span>
                                                                                    {innerStatusText && (
                                                                                        <span className="text-[10px] text-emerald-400">{innerStatusText}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}


        </div>
    );
}
