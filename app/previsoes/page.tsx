'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useWorld } from '@/context/WorldContext';
import { useBossPredictions } from '@/hooks/useBossPredictions';
import { Prediction } from '@/utils/spawnLogic';
import BossTimeline from '@/components/BossTimeline';
import BossCard from '@/components/BossCard';
import PredictionBossDrawer from '@/components/PredictionBossDrawer';
import { Boss } from '@/types';
import { List as ListIcon } from 'lucide-react';
import Loading from '@/components/Loading';

import { getWorldIcon } from '@/utils/worldIcons';

import { isSuppressed } from '@/utils/suppressedBosses';

export default function UpcomingPage() {
    const { data, isLoading } = useData();
    const { selectedWorld, worlds } = useWorld();
    const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
    const [localWorld, setLocalWorld] = useState<string>(selectedWorld || 'Auroria');

    // Sync local world with global world when it changes (but keep Auroria as fallback)
    useEffect(() => {
        setLocalWorld(selectedWorld || 'Auroria');
    }, [selectedWorld]);

    const { predictions: rawPredictions } = useBossPredictions(data.killDates, localWorld);

    const predictions = useMemo(() => {
        return rawPredictions.filter(p => !isSuppressed(p.bossName));
    }, [rawPredictions]);



    // Group predictions
    const groupedPredictions = useMemo(() => {
        const groups = {
            'Window Open': [] as Prediction[],  // Actively huntable NOW
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
                    groups['Window Open'].push(pred); // Opens today = effectively open
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
                                'Overdue': 'Atrasados',
                                'Tomorrow': 'Amanhã',
                                'Next 7 Days': 'Próximos 7 Dias',
                                'Later': 'Mais Tarde'
                            }[group] || group;

                            const isWindowOpen = group === 'Window Open';
                            const isOverdue = group === 'Overdue';

                            return (
                                <div key={group} className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isWindowOpen ? 'text-emerald-400' :
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
                                                <div key={`${pred.bossName}-${pred.world}-${idx}`} className="relative">
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
                                                        onClick={() => setSelectedPrediction(pred)}
                                                    >
                                                        <div className="w-full mt-2">
                                                            <BossTimeline
                                                                minGap={pred.stats?.minGap || 1}
                                                                maxGap={pred.stats?.maxGap || 1}
                                                                daysSince={pred.daysSinceKill}
                                                                status={pred.status}
                                                            />
                                                        </div>
                                                    </BossCard>
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

            <PredictionBossDrawer
                prediction={selectedPrediction}
                isOpen={!!selectedPrediction}
                onClose={() => setSelectedPrediction(null)}
            />
        </div>
    );
}
