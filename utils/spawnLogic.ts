/**
 * REQ: npm install date-fns
 * Logic: Calculates spawn windows based on historical kill data using
 * Inter-Arrival Time (IAT) analysis with outlier filtering for "Ghost Spawns".
 */
import { differenceInDays, addDays } from "date-fns";

// --- Types ---
// --- Types ---
export type KillRecord = {
    bossName: string;
    world: string;
    killedAt: string; // ISO Date or "DD/MM/YYYY"
};

export type BossStats = {
    minGap: number;     // The "Safety Floor"
    maxGap: number;     // The "Likely Ceiling" (75th percentile)
    avgGap: number;     // Median gap (more stable than mean)
    stdDev: number;     // Standard Deviation for consistency
    sampleSize: number; // Number of intervals observed
    confidence: number; // 0 to 100
};

export type Prediction = {
    bossName: string;
    world: string;
    status: 'COOLDOWN' | 'WINDOW_OPEN' | 'OVERDUE' | 'UNKNOWN';
    windowProgress: number; // 0% to 100%+
    nextMinSpawn: Date;
    nextMaxSpawn: Date;
    probabilityLabel: string;
    stats?: BossStats; // Added to expose stats for UI
    confidence: number; // 0 to 100
    confidenceLabel: 'Low' | 'Medium' | 'High';
    lastKill: Date;
};

// --- Core Math Helper: Percentile ---
// We use the 75th percentile for "Max" to ignore long gaps caused by missed kills.
function getPercentile(data: number[], q: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
}

// --- The Analyzer ---
export class SpawnPredictor {
    private statsCache: Record<string, BossStats> = {};

    constructor(private killHistory: KillRecord[]) {
        this.trainModel();
    }

    // Helper to parse dates that might be DD/MM/YYYY
    private parseDate(dateStr: string): Date {
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(dateStr);
    }

    private trainModel() {
        // 1. Group data by Boss -> World -> Date[]
        const killsByBossAndWorld: Record<string, Record<string, Date[]>> = {};

        // Sort chronology
        const sortedHistory = [...this.killHistory].sort((a, b) => {
            const dateA = this.parseDate(a.killedAt);
            const dateB = this.parseDate(b.killedAt);
            return dateA.getTime() - dateB.getTime();
        });

        sortedHistory.forEach(kill => {
            if (!killsByBossAndWorld[kill.bossName]) killsByBossAndWorld[kill.bossName] = {};
            if (!killsByBossAndWorld[kill.bossName][kill.world]) killsByBossAndWorld[kill.bossName][kill.world] = [];
            killsByBossAndWorld[kill.bossName][kill.world].push(this.parseDate(kill.killedAt));
        });

        // 2. Process Stats
        Object.keys(killsByBossAndWorld).forEach(boss => {
            let allGaps: number[] = [];
            let serverCount = 0;

            // Collect ALL gaps from ALL servers (Intra-server calculation)
            Object.keys(killsByBossAndWorld[boss]).forEach(world => {
                const dates = killsByBossAndWorld[boss][world];
                if (dates.length > 1) {
                    serverCount++;
                    for (let i = 1; i < dates.length; i++) {
                        const gap = differenceInDays(dates[i], dates[i - 1]);
                        if (gap >= 1) allGaps.push(gap);
                    }
                }
            });

            if (allGaps.length === 0) {
                // Not enough data, fallback defaults
                this.statsCache[boss] = { minGap: 1, maxGap: 1, avgGap: 1, stdDev: 0, sampleSize: 0, confidence: 0 };
                return;
            }

            // -- CORE MATH --
            // Filter outliers (Ghost Spawns) using 80th percentile
            allGaps.sort((a, b) => a - b);
            const p80Index = Math.floor(allGaps.length * 0.80);
            const filteredGaps = allGaps.slice(0, p80Index + 1);

            const minGap = filteredGaps[0];
            const maxGap = filteredGaps[filteredGaps.length - 1]; // Use filtered max
            const avgGap = Math.floor(getPercentile(filteredGaps, 0.50));

            // Calculate StdDev
            const mean = filteredGaps.reduce((a, b) => a + b, 0) / filteredGaps.length;
            const variance = filteredGaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filteredGaps.length;
            const stdDev = Math.sqrt(variance);

            // -- CONFIDENCE CALCULATION --
            // Factor 1: Sample Size (Logarithmic scale: 10 samples = ~80% base score)
            let baseScore = Math.min(100, (Math.log(allGaps.length + 1) / Math.log(15)) * 100);

            // Factor 2: Consistency (Penalty for high variance)
            // If gaps range from 10 to 30, variance is high. If 10 to 12, variance is low.
            const range = maxGap - minGap;
            const consistencyFactor = range === 0 ? 1 : Math.max(0.5, 1 - (range / minGap));

            // Factor 3: Server Bonus (Cross-verification)
            const serverBonus = serverCount > 1 ? 1.2 : 1.0;

            let finalConfidence = baseScore * consistencyFactor * serverBonus;
            finalConfidence = Math.min(95, Math.floor(finalConfidence)); // Cap at 95% because nothing is certain

            this.statsCache[boss] = {
                minGap,
                maxGap,
                avgGap,
                stdDev,
                sampleSize: allGaps.length,
                confidence: finalConfidence
            };
        });
    }

    public predict(bossName: string, world: string, lastKillDateStr: string): Prediction {
        const stats = this.statsCache[bossName];
        if (!stats) return this.getUnknownState(bossName, world);

        const lastKill = this.parseDate(lastKillDateStr);
        const today = new Date();
        const minSpawn = addDays(lastKill, stats.minGap);
        const maxSpawn = addDays(lastKill, stats.maxGap);
        const daysSince = differenceInDays(today, lastKill);

        // Calc Status
        let status: Prediction['status'] = 'COOLDOWN';
        let label = 'Cooling Down';
        let progress = 0;

        if (daysSince < stats.minGap) {
            status = 'COOLDOWN';
            progress = (daysSince / stats.minGap) * 100; // Progress bar fills as cooldown ends
            label = `Cooldown (${stats.minGap - daysSince} days left)`;
        } else {
            const windowSize = stats.maxGap - stats.minGap || 1;
            const daysIn = daysSince - stats.minGap;
            progress = (daysIn / windowSize) * 100;

            if (daysSince > stats.maxGap + (windowSize * 0.5)) {
                status = 'OVERDUE'; // 50% past the max window
                label = 'Overdue (Missed?)';
            } else {
                status = 'WINDOW_OPEN';
                label = 'Spawn Window Open';
            }
        }

        return {
            bossName,
            world,
            status,
            windowProgress: Math.min(100, Math.max(0, progress)),
            nextMinSpawn: minSpawn,
            nextMaxSpawn: maxSpawn,
            probabilityLabel: label,
            confidence: stats.confidence,
            confidenceLabel: stats.confidence > 75 ? 'High' : stats.confidence > 40 ? 'Medium' : 'Low',
            stats,
            lastKill
        };
    }

    private getUnknownState(bossName: string, world: string): Prediction {
        // Return default empty state
        return {
            bossName, world, status: 'UNKNOWN', windowProgress: 0,
            nextMinSpawn: new Date(), nextMaxSpawn: new Date(),
            probabilityLabel: 'No Data', confidence: 0, confidenceLabel: 'Low',
            stats: { minGap: 0, maxGap: 0, avgGap: 0, stdDev: 0, sampleSize: 0, confidence: 0 },
            lastKill: new Date(0)
        } as Prediction;
    }
}
