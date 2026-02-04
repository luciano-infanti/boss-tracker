/**
 * Logic: Calculates spawn windows based on historical kill data using
 * Inter-Arrival Time (IAT) analysis with Cycle + Multiples logic.
 */
import { differenceInDays, addDays, isAfter, isBefore, subDays } from "date-fns";

// --- Types ---

export type KillRecord = {
    bossName: string;
    world: string;
    killedAt: string; // ISO string or 'DD/MM/YYYY'
};

export interface Prediction {
    bossName: string;
    world: string;
    status: 'WINDOW_OPEN' | 'COOLDOWN' | 'OVERDUE' | 'UNKNOWN';
    nextMinSpawn: Date;
    nextMaxSpawn: Date;
    avgSpawnDate: Date;
    confidence: number; // 0-100
    windowProgress: number; // 0-100%
    daysUntilMin: number;
    cycleInfo?: {
        cycleDuration: number; // The global average (e.g., 14 days)
        cyclesSkipped: number; // How many "ghost" windows we skipped
        margin: number; // The +/- days calculated
    };

    // --- Compatibility Fields for UI ---
    probabilityLabel: string;
    confidenceLabel: 'Low' | 'Medium' | 'High';
    lastKill: Date;
    daysSinceKill: number;
    relativeLabel: string;
    isLowConfidence: boolean;
    stats?: {
        minGap: number;
        maxGap: number;
        avgGap: number;
        stdDev: number;
        sampleSize: number;
        confidence: number;
    };
}

// --- The Analyzer ---
export class SpawnPredictor {
    private globalStats: Map<string, { avgInterval: number; stdDev: number; sampleSize: number }>;

    constructor(allKills: KillRecord[]) {
        this.globalStats = this.calculateGlobalStats(allKills);
    }

    /**
     * 1. Aggregates ALL worlds data to find the "True Interval" for the boss.
     */
    private calculateGlobalStats(kills: KillRecord[]) {
        const stats = new Map<string, { avgInterval: number; stdDev: number; sampleSize: number }>();
        const killsByBoss = this.groupByBoss(kills);

        killsByBoss.forEach((bossKills, bossName) => {
            // Sort all kills purely by date, ignoring world (to find global rhythm)
            const allIntervals: number[] = [];
            const killsByWorld = this.groupByWorld(bossKills);

            Object.values(killsByWorld).forEach(worldKills => {
                const sorted = worldKills.sort((a, b) => this.parseDate(a.killedAt).getTime() - this.parseDate(b.killedAt).getTime());
                for (let i = 1; i < sorted.length; i++) {
                    const days = differenceInDays(this.parseDate(sorted[i].killedAt), this.parseDate(sorted[i - 1].killedAt));
                    // Filter obvious outliers (e.g. 1 day double kills)
                    if (days > 1) allIntervals.push(days);
                }
            });

            if (allIntervals.length === 0) return;

            // Calculate Mean (Global Average)
            const sum = allIntervals.reduce((a, b) => a + b, 0);
            const mean = sum / allIntervals.length;

            // Calculate StdDev to determine "Stability"
            const variance = allIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allIntervals.length;
            const stdDev = Math.sqrt(variance);

            stats.set(bossName, { avgInterval: mean, stdDev, sampleSize: allIntervals.length });
        });

        return stats;
    }

    /**
     * 2. Predicts using the Cycle + Multiples logic
     */
    public predict(bossName: string, world: string, lastKillDateStr: string): Prediction {
        const stats = this.globalStats.get(bossName);
        const lastKillDate = this.parseDate(lastKillDateStr);
        const now = new Date(); // Use current date
        now.setHours(0, 0, 0, 0); // Normalize 'now' to midnight for comparison

        // --- FALLBACK: If no global stats, return UNKNOWN ---
        if (!stats || stats.sampleSize < 2) {
            return this.createUnknownPrediction(bossName, world);
        }

        const { avgInterval, stdDev } = stats;

        // --- STEP A: Calculate Dynamic Margin ---
        // If the boss is very regular (low StdDev), window is tight. 
        // We clamp it: Minimum +/- 1 day, Maximum +/- 3 days
        let margin = Math.ceil(stdDev);
        if (margin < 1) margin = 1;
        if (margin > 3) margin = 3;

        // --- STEP B: Calculate Cycles ---
        // How many days have passed since the last kill?
        const daysSinceLast = differenceInDays(now, lastKillDate);

        // How many "cycles" of the average interval fit into this time?
        let cycles = Math.round(daysSinceLast / avgInterval);

        // If we are currently "before" the first cycle (e.g. 5 days passed, avg 14), 
        // we assume we are aiming for the 1st cycle.
        if (cycles < 1) cycles = 1;

        // --- STEP C: Project the Date ---
        // Target Date = LastKill + (Cycles * Average)
        let targetDate = addDays(lastKillDate, Math.round(cycles * avgInterval));

        // CRITICAL FIX: If the target window + margin is ALREADY in the past, 
        // it means we missed this window too. Jump to the next cycle.
        // We use 'while' to ensure we skip ALL missed windows, not just the previous one.
        while (isBefore(addDays(targetDate, margin), now)) {
            cycles++;
            targetDate = addDays(lastKillDate, Math.round(cycles * avgInterval));
        }

        const minSpawn = subDays(targetDate, margin);
        const maxSpawn = addDays(targetDate, margin);

        // --- STEP D: Determine Status ---
        let status: Prediction['status'] = 'COOLDOWN';
        let probabilityLabel = '';
        let relativeLabel = '';

        if (isAfter(now, maxSpawn)) {
            status = 'OVERDUE';
            const overdueBy = differenceInDays(now, maxSpawn);
            probabilityLabel = 'Atrasado';
            relativeLabel = overdueBy === 1 ? 'Atrasado 1 dia' : `Atrasado ${overdueBy} dias`;
        } else if (isAfter(now, minSpawn) || this.isSameDay(now, minSpawn)) {
            status = 'WINDOW_OPEN';
            probabilityLabel = 'Janela Aberta';
            const daysUntilClose = differenceInDays(maxSpawn, now);
            relativeLabel = daysUntilClose === 0 ? 'Fecha hoje' :
                daysUntilClose === 1 ? 'Fecha amanhã' : `Fecha em ${daysUntilClose} dias`;
        } else {
            status = 'COOLDOWN';
            const daysLeft = differenceInDays(minSpawn, now);
            probabilityLabel = `Cooldown`;
            relativeLabel = daysLeft === 1 ? 'Abre amanhã' : `Abre em ${daysLeft} dias`;
        }

        // --- STEP E: Calculate Confidence ---
        let confidence = 0;
        if (stats.sampleSize > 5) confidence += 0.3;
        if (stats.sampleSize > 10) confidence += 0.2;
        if (stdDev < 2) confidence += 0.3; // Very stable boss
        else if (stdDev < 5) confidence += 0.1;

        // Penalty for high cycle count (prediction gets fuzzier the further out we guess)
        confidence -= (cycles - 1) * 0.1;
        if (confidence < 0.1) confidence = 0.1;
        if (confidence > 1) confidence = 1;

        const isLowConfidence = confidence < 0.4;
        const confidenceLabel = confidence > 0.75 ? 'High' : confidence > 0.4 ? 'Medium' : 'Low';
        const windowProgress = this.calculateProgress(lastKillDate, minSpawn, now);
        const daysUntilMin = differenceInDays(minSpawn, now);

        return {
            bossName,
            world,
            status,
            nextMinSpawn: minSpawn,
            nextMaxSpawn: maxSpawn,
            avgSpawnDate: targetDate,
            confidence: Math.round(confidence * 100), // Scaled
            windowProgress,
            daysUntilMin,
            cycleInfo: {
                cycleDuration: avgInterval,
                cyclesSkipped: cycles - 1,
                margin
            },
            // Compatibility
            probabilityLabel,
            confidenceLabel,
            lastKill: lastKillDate,
            daysSinceKill: daysSinceLast,
            relativeLabel,
            isLowConfidence,
            stats: {
                // FIXED: Return cumulative days from LastKill for timeline compatibility
                minGap: differenceInDays(minSpawn, lastKillDate),
                maxGap: differenceInDays(maxSpawn, lastKillDate),
                avgGap: Math.round(avgInterval),
                stdDev: stdDev,
                sampleSize: stats.sampleSize,
                confidence: Math.round(confidence * 100)
            }
        };
    }

    // --- Helpers ---

    private groupByBoss(kills: KillRecord[]) {
        const map = new Map<string, KillRecord[]>();
        kills.forEach(k => {
            if (!map.has(k.bossName)) map.set(k.bossName, []);
            map.get(k.bossName)?.push(k);
        });
        return map;
    }

    private groupByWorld(kills: KillRecord[]) {
        const map: Record<string, KillRecord[]> = {};
        kills.forEach(k => {
            if (!map[k.world]) map[k.world] = [];
            map[k.world].push(k);
        });
        return map;
    }

    private parseDate(dateStr: string): Date {
        // Assuming DD/MM/YYYY or ISO.
        if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date(dateStr);
    }

    private isSameDay(d1: Date, d2: Date) {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    }

    private calculateProgress(start: Date, target: Date, now: Date): number {
        const total = differenceInDays(target, start);
        const current = differenceInDays(now, start);
        if (total <= 0) return 100;
        const p = (current / total) * 100;
        return Math.min(Math.max(p, 0), 100);
    }

    private createUnknownPrediction(bossName: string, world: string): Prediction {
        return {
            bossName, world, status: 'UNKNOWN',
            nextMinSpawn: new Date(), nextMaxSpawn: new Date(), avgSpawnDate: new Date(),
            confidence: 0, windowProgress: 0, daysUntilMin: 0,
            probabilityLabel: 'Sem Dados',
            confidenceLabel: 'Low',
            lastKill: new Date(0),
            daysSinceKill: 0,
            relativeLabel: 'Dados insuficientes',
            isLowConfidence: true,
            stats: {
                minGap: 0, maxGap: 0, avgGap: 0, stdDev: 0, sampleSize: 0, confidence: 0
            }
        };
    }
}
