import { useMemo } from 'react';
import { SpawnPredictor, KillRecord, Prediction } from '@/utils/spawnLogic';
import { BossKillHistory } from '@/types';

export function useBossPredictions(killDates: BossKillHistory[] | undefined, selectedWorld: string) {
    // Bosses to exclude from predictions
    const PREDICTION_BLACKLIST = [
        'Frostbell', 'Frostreaper',
        'Ferumbras Mortal Shell', 'Bakragore', 'The Percht Queen', 'The World Devourer',
        'Mahatheb', 'Yakchal', 'Undead Cavebear', 'Crustacea Gigantica', 'Oodok', 'Arthem',
        'Ghazbaran', "Gaz'haragoth",
        'Midnight Panther', 'Feroxa', 'Dreadful Disruptor'
    ];

    const predictor = useMemo(() => {
        if (!killDates) return null;

        // Transform BossKillHistory to KillRecord[]
        const allKills: KillRecord[] = [];
        killDates.forEach(boss => {
            if (PREDICTION_BLACKLIST.includes(boss.bossName)) return;

            Object.entries(boss.killsByWorld).forEach(([world, entries]) => {
                entries.forEach(entry => {
                    allKills.push({
                        bossName: boss.bossName,
                        world: world,
                        killedAt: entry.date
                    });
                });
            });
        });

        return new SpawnPredictor(allKills);
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

        // Sort results
        // 1. WINDOW_OPEN first (actively huntable)
        // 2. COOLDOWN by urgency (opening soon first)
        // 3. OVERDUE at bottom

        return results.sort((a, b) => {
            const getPriority = (status: string) => {
                if (status === 'WINDOW_OPEN') return 3;
                if (status === 'COOLDOWN') return 2;
                if (status === 'OVERDUE') return 1;
                return 0;
            };

            const pA = getPriority(a.status);
            const pB = getPriority(b.status);

            if (pA !== pB) return pB - pA;

            if (a.status === 'WINDOW_OPEN') {
                return b.windowProgress - a.windowProgress; // Higher progress first
            }
            if (a.status === 'COOLDOWN') {
                return a.nextMinSpawn.getTime() - b.nextMinSpawn.getTime(); // Opening sooner first
            }
            if (a.status === 'OVERDUE') {
                return a.daysSinceKill - b.daysSinceKill;
            }
            return 0;
        });

    }, [predictor, killDates, selectedWorld]);

    return predictions;
}