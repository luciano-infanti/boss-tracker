'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useWorld } from '@/context/WorldContext';
import { useBossPredictions } from '@/hooks/useBossPredictions';
import { Prediction } from '@/utils/spawnLogic';
import UpcomingBossCalendar from '@/components/UpcomingBossCalendar';
import BossCard from '@/components/BossCard';
import PredictionBossDrawer from '@/components/PredictionBossDrawer';
import { Boss } from '@/types';
import { Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
import Loading from '@/components/Loading';

export default function UpcomingPage() {
    const { data, isLoading } = useData();
    const { selectedWorld, setSelectedWorld } = useWorld();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);

    const predictions = useBossPredictions(data.killDates, selectedWorld)
        .filter(pred => !['Mahatheb', 'Yakchal', 'Undead Cavebear', 'Crustacea Gigantica', 'Oodok', 'Arthem', 'Ghazbaran', "Gaz'haragoth"].includes(pred.bossName));

    // Calculate Priority Checks (High/Medium confidence + Window Open/Overdue)
    const priorityPredictions = useMemo(() => {
        return predictions.filter(pred =>
            (pred.status === 'WINDOW_OPEN' || pred.status === 'OVERDUE') &&
            (pred.confidenceLabel === 'High' || pred.confidenceLabel === 'Medium')
        );
    }, [predictions]);

    // Group predictions by time bucket
    const groupedPredictions = useMemo(() => {
        const groups = {
            'Open Window': [] as Prediction[],
            'Expected Today': [] as Prediction[],
            'Tomorrow': [] as Prediction[],
            'Next 3 Days': [] as Prediction[],
            'This Week': [] as Prediction[],
            'Later': [] as Prediction[]
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const threeDays = new Date(today);
        threeDays.setDate(today.getDate() + 3);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        predictions.forEach(pred => {
            const predDate = new Date(pred.nextMinSpawn.getFullYear(), pred.nextMinSpawn.getMonth(), pred.nextMinSpawn.getDate());

            // Check if this prediction is already in priority list
            const isPriority = (pred.status === 'WINDOW_OPEN' || pred.status === 'OVERDUE') &&
                (pred.confidenceLabel === 'High' || pred.confidenceLabel === 'Medium');

            if (pred.status === 'WINDOW_OPEN' || pred.status === 'OVERDUE') {
                // Only add to 'Open Window' if NOT a priority check (to avoid duplication)
                if (!isPriority) {
                    groups['Open Window'].push(pred);
                }
            } else if (predDate.getTime() === today.getTime()) {
                groups['Expected Today'].push(pred);
            } else if (predDate.getTime() === tomorrow.getTime()) {
                groups['Tomorrow'].push(pred);
            } else if (predDate <= threeDays) {
                groups['Next 3 Days'].push(pred);
            } else if (predDate <= nextWeek) {
                groups['This Week'].push(pred);
            } else {
                groups['Later'].push(pred);
            }
        });

        return groups;
    }, [predictions]);



    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Upcoming Bosses</h1>
                    <p className="text-secondary text-sm">
                        Advanced spawn predictions using IAT analysis.
                    </p>
                </div>


                <div className="flex items-center gap-4">
                    {/* World Filter */}
                    <select
                        value={selectedWorld}
                        onChange={(e) => setSelectedWorld(e.target.value)}
                        className="bg-surface border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                        {data.worlds && Object.keys(data.worlds).sort().map(world => (
                            <option key={world} value={world}>{world}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex items-center bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-secondary hover:text-white'
                                }`}
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-primary/20 text-primary' : 'text-secondary hover:text-white'
                                }`}
                        >
                            <CalendarIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Priority Checks Section */}
            {priorityPredictions.length > 0 && viewMode === 'list' && (
                <div className="bg-surface border border-emerald-500/30 rounded-lg overflow-hidden mb-8">
                    <div className="bg-emerald-500/10 px-6 py-4 border-b border-emerald-500/20 flex items-center gap-3">
                        <div className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Priority Checks</h2>
                            <p className="text-xs text-emerald-400">High confidence bosses currently in spawn window</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {priorityPredictions.map((pred, idx) => {
                            const nextSpawnDate = pred.nextMinSpawn;
                            const day = nextSpawnDate.getDate().toString().padStart(2, '0');
                            const month = (nextSpawnDate.getMonth() + 1).toString().padStart(2, '0');
                            const year = nextSpawnDate.getFullYear();
                            const nextSpawnStr = `${day}/${month}/${year}`;

                            const bossData: any = {
                                name: pred.bossName,
                                totalDaysSpawned: 0,
                                totalKills: 0,
                                spawnFrequency: `${pred.stats?.avgGap || '?'} days`,
                                nextExpectedSpawn: nextSpawnStr,
                                lastKillDate: 'See Details',
                                history: '',
                                confidence: pred.confidence,
                                confidenceLabel: pred.confidenceLabel
                            };

                            return (
                                <div key={`priority-${pred.bossName}-${pred.world}-${idx}`} className="relative">
                                    <BossCard
                                        boss={bossData}
                                        type="world"
                                        isKilledToday={false}
                                        isNew={false}
                                        showNextSpawn={false}
                                        hideStats={true}
                                        showLastKill={false}
                                        onClick={() => setSelectedPrediction(pred)}
                                    />
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <div className="flex justify-end items-center text-[10px] text-secondary mb-1">
                                            <span className="opacity-70">{Math.round(pred.windowProgress)}%</span>
                                        </div>
                                        <div className="h-1 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${pred.status === 'OVERDUE' ? 'bg-red-500' :
                                                    pred.windowProgress > 80 ? 'bg-orange-500' :
                                                        pred.windowProgress > 40 ? 'bg-yellow-500' :
                                                            'bg-blue-500'
                                                    }`}
                                                style={{ width: `${Math.min(pred.windowProgress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {predictions.length === 0 ? (
                <div className="text-center py-12 text-secondary bg-surface rounded-lg border border-border">
                    No prediction data available for {selectedWorld}. Need at least 2 kills to calculate intervals.
                </div>
            ) : (
                <>
                    {viewMode === 'calendar' ? (
                        <UpcomingBossCalendar predictions={predictions} worldName={selectedWorld} />
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedPredictions).map(([group, preds]) => {
                                if (preds.length === 0) return null;

                                return (
                                    <div key={group} className="space-y-4">
                                        <h2 className={`text-lg font-semibold flex items-center gap-2 ${group === 'Open Window' ? 'text-emerald-400' :
                                            group === 'Expected Today' ? 'text-blue-400' :
                                                'text-secondary'
                                            }`}>
                                            {group === 'Open Window' && <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>}
                                            {group}
                                            <span className="text-xs font-normal text-secondary bg-surface-hover px-2 py-0.5 rounded-full">
                                                {preds.length}
                                            </span>
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {preds.map((pred, idx) => {
                                                // Construct a temporary Boss object for the card
                                                const nextSpawnDate = pred.nextMinSpawn;
                                                const day = nextSpawnDate.getDate().toString().padStart(2, '0');
                                                const month = (nextSpawnDate.getMonth() + 1).toString().padStart(2, '0');
                                                const year = nextSpawnDate.getFullYear();
                                                const nextSpawnStr = `${day}/${month}/${year}`;

                                                const bossData: any = {
                                                    name: pred.bossName,
                                                    totalDaysSpawned: 0,
                                                    totalKills: 0,
                                                    spawnFrequency: `${pred.stats?.avgGap || '?'} days`,
                                                    nextExpectedSpawn: nextSpawnStr,
                                                    lastKillDate: 'See Details',
                                                    history: '',
                                                    confidence: pred.confidence, // Pass confidence score
                                                    confidenceLabel: pred.confidenceLabel
                                                };

                                                return (
                                                    <div key={`${pred.bossName}-${pred.world}-${idx}`} className="relative">
                                                        <BossCard
                                                            boss={bossData}
                                                            type="world"
                                                            isKilledToday={false}
                                                            isNew={false}
                                                            showNextSpawn={false}
                                                            hideStats={true}
                                                            showLastKill={false}
                                                            onClick={() => setSelectedPrediction(pred)}
                                                        />
                                                        {/* Progress Bar Overlay */}
                                                        <div className="absolute bottom-3 left-4 right-4">
                                                            <div className="flex justify-end items-center text-[10px] text-secondary mb-1">
                                                                <span className="opacity-70">{Math.round(pred.windowProgress)}%</span>
                                                            </div>
                                                            <div className="h-1 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${pred.status === 'OVERDUE' ? 'bg-red-500' :
                                                                        pred.windowProgress > 80 ? 'bg-orange-500' :
                                                                            pred.windowProgress > 40 ? 'bg-yellow-500' :
                                                                                'bg-blue-500'
                                                                        }`}
                                                                    style={{ width: `${Math.min(pred.windowProgress, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
