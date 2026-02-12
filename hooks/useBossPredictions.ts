import { useMemo, useCallback } from 'react';
import { SpawnPredictor, KillRecord, Prediction } from '@/utils/spawnLogic';
import { BossKillHistory } from '@/types';
import {
    recordPredictionAccuracy as recordAccuracy,
    getAccuracyStats,
    AccuracyStats
} from '@/utils/accuracyTracking';
import {
    getSpawnPatternData,
    SpawnPatternData
} from '@/utils/spawnVisualization';

export interface UseBossPredictionsResult {
    predictions: Prediction[];
    accuracyStats: AccuracyStats;
    getSpawnPatternData: (bossName: string, world: string | null) => SpawnPatternData;
    recordPredictionAccuracy: (
        bossName: string,
        world: string,
        actualKillDate: Date,
        predictedStatus: string,
        predictedWindow: { min: Date; max: Date }
    ) => void;
}

export function useBossPredictions(
    killDates: BossKillHistory[] | undefined,
    selectedWorld: string
): UseBossPredictionsResult {
    // Bosses to exclude from predictions
    const PREDICTION_BLACKLIST = [
        'Frostbell', 'Frostreaper',
        'Ferumbras Mortal Shell', 'Bakragore', 'The Percht Queen', 'The World Devourer',
        'Mahatheb', 'Yakchal', 'Undead Cavebear', 'Crustacea Gigantica', 'Oodok', 'Arthem',
        'Ghazbaran', "Gaz'haragoth",
        'Midnight Panther', 'Feroxa', 'Dreadful Disruptor'
    ];

    // Build predictor and all kills array
    const { predictor, allKills } = useMemo(() => {
        if (!killDates) return { predictor: null, allKills: [] };

        // Transform BossKillHistory to KillRecord[]
        const kills: KillRecord[] = [];
        killDates.forEach(boss => {
            if (PREDICTION_BLACKLIST.includes(boss.bossName)) return;

            Object.entries(boss.killsByWorld).forEach(([world, entries]) => {
                entries.forEach(entry => {
                    kills.push({
                        bossName: boss.bossName,
                        world: world,
                        killedAt: entry.date
                    });
                });
            });
        });

        return { predictor: new SpawnPredictor(kills), allKills: kills };
    }, [killDates]);

    const predictions = useMemo(() => {
        if (!predictor || !killDates) return [];

        const results: Prediction[] = [];

        killDates.forEach(boss => {
            if (PREDICTION_BLACKLIST.includes(boss.bossName)) return;

            // Determine which worlds to check
            const worldsToCheck = selectedWorld
                ? [selectedWorld]
                : Object.keys(boss.killsByWorld);

            worldsToCheck.forEach(world => {
                const worldHistory = boss.killsByWorld[world];
                if (!worldHistory || worldHistory.length === 0) return;

                // Sort by date descending to get latest kill date
                const sortedHistory = [...worldHistory].sort((a, b) => {
                    const [d1, m1, y1] = a.date.split('/').map(Number);
                    const [d2, m2, y2] = b.date.split('/').map(Number);
                    return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
                });

                const lastKill = sortedHistory[0];
                const prediction = predictor.predict(boss.bossName, world, lastKill.date);

                // Only add if we have valid stats (not UNKNOWN)
                if (prediction.status !== 'UNKNOWN') {
                    results.push(prediction);
                }
            });
        });

        // --- ENHANCED SORTING ---
        // Priority order:
        // 1. WINDOW_OPEN (actively huntable)
        // 2. OVERDUE with isLateBuffer: true (POSSIBLE_LATE - keep checking!)
        // 3. COOLDOWN (opening soon)
        // 4. OVERDUE without isLateBuffer (long overdue)

        return results.sort((a, b) => {
            const getPriority = (pred: Prediction) => {
                if (pred.status === 'WINDOW_OPEN') return 4;
                if (pred.status === 'OVERDUE' && pred.isLateBuffer) return 3;
                if (pred.status === 'COOLDOWN') return 2;
                if (pred.status === 'OVERDUE') return 1;
                return 0;
            };

            const pA = getPriority(a);
            const pB = getPriority(b);

            if (pA !== pB) return pB - pA;

            // Within same priority, use secondary sorting
            if (a.status === 'WINDOW_OPEN') {
                // Higher window progress first (closer to closing)
                return b.windowProgress - a.windowProgress;
            }
            if (a.status === 'OVERDUE' && a.isLateBuffer) {
                // Sort by confidence * urgency (higher confidence first)
                const scoreA = a.confidence * (1 / (a.daysSinceKill + 1));
                const scoreB = b.confidence * (1 / (b.daysSinceKill + 1));
                return scoreB - scoreA;
            }
            if (a.status === 'COOLDOWN') {
                // Opening sooner first
                return a.nextMinSpawn.getTime() - b.nextMinSpawn.getTime();
            }
            if (a.status === 'OVERDUE') {
                // Days since kill (more overdue first)
                return b.daysSinceKill - a.daysSinceKill;
            }
            return 0;
        });

    }, [predictor, killDates, selectedWorld]);

    // --- ACCURACY TRACKING ---
    const accuracyStats = useMemo(() => {
        return getAccuracyStats();
    }, []);

    const recordPredictionAccuracyCallback = useCallback((
        bossName: string,
        world: string,
        actualKillDate: Date,
        predictedStatus: string,
        predictedWindow: { min: Date; max: Date }
    ) => {
        recordAccuracy(bossName, world, actualKillDate, predictedStatus, predictedWindow);
    }, []);

    // --- VISUALIZATION HELPERS ---
    const getSpawnPatternDataCallback = useCallback((
        bossName: string,
        world: string | null
    ): SpawnPatternData => {
        return getSpawnPatternData(bossName, world, allKills);
    }, [allKills]);

    return {
        predictions,
        accuracyStats,
        getSpawnPatternData: getSpawnPatternDataCallback,
        recordPredictionAccuracy: recordPredictionAccuracyCallback
    };
}