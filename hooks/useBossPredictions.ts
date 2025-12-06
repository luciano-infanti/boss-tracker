import { useMemo } from 'react';
import { SpawnPredictor, KillRecord, Prediction } from '@/utils/spawnLogic';
import { BossKillHistory } from '@/types';

export function useBossPredictions(killDates: BossKillHistory[] | undefined, selectedWorld: string) {
    const predictor = useMemo(() => {
        if (!killDates) return null;

        // Transform BossKillHistory to KillRecord[]
        const allKills: KillRecord[] = [];
        killDates.forEach(boss => {
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
        if (!predictor || !killDates || !selectedWorld) return [];

        const results: Prediction[] = [];

        killDates.forEach(boss => {
            // Find the most recent kill for this boss on the selected world
            const worldHistory = boss.killsByWorld[selectedWorld];
            if (!worldHistory || worldHistory.length === 0) return;

            // Sort by date descending to get latest
            const sortedHistory = [...worldHistory].sort((a, b) => {
                const [d1, m1, y1] = a.date.split('/').map(Number);
                const [d2, m2, y2] = b.date.split('/').map(Number);
                return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
            });

            const lastKill = sortedHistory[0];
            const prediction = predictor.predict(boss.bossName, selectedWorld, lastKill.date);

            // Only add if we have valid stats (not UNKNOWN)
            if (prediction.status !== 'UNKNOWN') {
                results.push(prediction);
            }
        });

        // Sort results
        // 1. Active Windows (High Priority) - Sort by progress desc
        // 2. Upcoming (Cooldown) - Sort by time until open asc
        // 3. Overdue - Sort by progress desc

        return results.sort((a, b) => {
            // Priority: WINDOW_OPEN > OVERDUE > COOLDOWN
            const getPriority = (status: string) => {
                if (status === 'WINDOW_OPEN') return 3;
                if (status === 'OVERDUE') return 2;
                if (status === 'COOLDOWN') return 1;
                return 0;
            };

            const pA = getPriority(a.status);
            const pB = getPriority(b.status);

            if (pA !== pB) return pB - pA;

            if (a.status === 'WINDOW_OPEN') {
                return b.windowProgress - a.windowProgress; // Higher progress first
            }
            if (a.status === 'OVERDUE') {
                return b.windowProgress - a.windowProgress;
            }
            if (a.status === 'COOLDOWN') {
                return a.nextMinSpawn.getTime() - b.nextMinSpawn.getTime(); // Sooner first
            }
            return 0;
        });

    }, [predictor, killDates, selectedWorld]);

    return predictions;
}
