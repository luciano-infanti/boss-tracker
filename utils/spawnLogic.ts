/**
 * Logic: Calculates spawn windows based on historical kill data using
 * Inter-Arrival Time (IAT) analysis with Cycle + Multiples logic.
 */
import { differenceInDays, addDays, isAfter, isBefore, subDays } from "date-fns";
import {
    getMinimumInterval,
    hasKnownPattern,
    getKnownPattern,
    LATE_BUFFER_DAYS,
    DATA_QUALITY_THRESHOLDS,
    WEIGHT_DECAY
} from "./bossSpawnConstants";

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

    // --- Enhanced Confidence Metrics ---
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
    sampleSize: number;
    isLateBuffer?: boolean;  // True if in POSSIBLE_LATE state (1-3 days past max)

    // --- Compatibility Fields for UI ---
    probabilityLabel: string;
    confidenceLabel: 'Low' | 'Medium' | 'High';
    lastKill: Date;
    daysSinceKill: number;
    relativeLabel: string;
    isLowConfidence: boolean;
    // --- IQR Tight Window (P25–P75) ---
    tightMinSpawn?: Date;
    tightMaxSpawn?: Date;

    stats?: {
        minGap: number;
        maxGap: number;
        avgGap: number;
        stdDev: number;
        sampleSize: number;
        confidence: number;
        rawGaps?: number[];
        filteredGaps?: number[];
        worldGaps?: Record<string, number[]>;
        tightMinGap?: number;
        tightMaxGap?: number;
        p25?: number;
        p75?: number;
    };
}

// --- The Analyzer ---
export class SpawnPredictor {
    // UPDATED: Store detailed stats in memory so we can return them for charts
    private globalStats: Map<string, {
        avgInterval: number;
        weightedAvgInterval: number;
        stdDev: number;
        sampleSize: number;
        rawGaps: number[];
        filteredGaps: number[];
        worldGaps: Record<string, number[]>;
        dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
        p25: number;
        p75: number;
    }>;

    constructor(allKills: KillRecord[]) {
        this.globalStats = this.calculateGlobalStats(allKills);
    }

    /**
     * 1. Aggregates ALL worlds data to find the "True Interval" for the boss.
     *    Now with sanitization, weighted averages, and world activity weighting.
     */
    private calculateGlobalStats(kills: KillRecord[]) {
        const stats = new Map<string, {
            avgInterval: number;
            weightedAvgInterval: number;
            stdDev: number;
            sampleSize: number;
            rawGaps: number[];
            filteredGaps: number[];
            worldGaps: Record<string, number[]>;
            dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
            p25: number;
            p75: number;
        }>();
        const killsByBoss = this.groupByBoss(kills);

        killsByBoss.forEach((bossKills, bossName) => {
            // Sort all kills purely by date, ignoring world (to find global rhythm)
            const allIntervals: number[] = [];
            const allKillsWithDates: { interval: number; date: Date }[] = [];
            const killsByWorld = this.groupByWorld(bossKills);
            const worldGaps: Record<string, number[]> = {};

            Object.entries(killsByWorld).forEach(([w, worldKills]) => {
                const sorted = worldKills.sort((a, b) => this.parseDate(a.killedAt).getTime() - this.parseDate(b.killedAt).getTime());
                const currentWorldGaps: number[] = [];
                for (let i = 1; i < sorted.length; i++) {
                    const days = differenceInDays(this.parseDate(sorted[i].killedAt), this.parseDate(sorted[i - 1].killedAt));
                    // Filter obvious outliers (e.g. 1 day double kills)
                    if (days > 1) {
                        allIntervals.push(days);
                        allKillsWithDates.push({ interval: days, date: this.parseDate(sorted[i].killedAt) });
                        currentWorldGaps.push(days);
                    }
                }
                if (currentWorldGaps.length > 0) {
                    worldGaps[w] = currentWorldGaps;
                }
            });

            if (allIntervals.length === 0) return;

            // --- STEP 1: Sanitize Intervals ---
            const filteredGaps = this.sanitizeIntervals(allIntervals, bossName);

            // --- STEP 2: Calculate Simple Mean (for fallback) ---
            const sum = filteredGaps.reduce((a, b) => a + b, 0);
            const mean = sum / filteredGaps.length;

            // --- STEP 3: Calculate Weighted Average (recent kills weigh more) ---
            const weightedAvg = this.calculateWeightedAverage(allKillsWithDates);

            // --- STEP 4: Calculate StdDev to determine "Stability" ---
            const variance = filteredGaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filteredGaps.length;
            const stdDev = Math.sqrt(variance);

            // --- STEP 5: Calculate Data Quality ---
            const dataQuality = this.calculateDataQuality(filteredGaps.length, stdDev);

            // --- STEP 6: Calculate IQR (P25–P75) ---
            const p25 = this.computePercentile(filteredGaps, 25);
            const p75 = this.computePercentile(filteredGaps, 75);

            stats.set(bossName, {
                avgInterval: mean,
                weightedAvgInterval: weightedAvg,
                stdDev,
                sampleSize: filteredGaps.length,
                rawGaps: allIntervals,
                filteredGaps,
                worldGaps,
                dataQuality,
                p25,
                p75
            });
        });

        return stats;
    }

    /**
     * Sanitize intervals to remove impossible/outlier data.
     * - Remove intervals < 2 days (impossible double kills)
     * - Remove intervals < known minimum * 0.5
     * - Filter outliers > 3 standard deviations
     */
    private sanitizeIntervals(intervals: number[], bossName: string): number[] {
        if (intervals.length === 0) return [];

        const minimumInterval = getMinimumInterval(bossName);
        const threshold = minimumInterval * 0.5;

        // First pass: Remove obvious invalid data
        let filtered = intervals.filter(interval => {
            // Remove impossibly short intervals
            if (interval < 2) return false;
            // Remove intervals shorter than half the known minimum
            if (interval < threshold) return false;
            return true;
        });

        if (filtered.length < 3) return filtered;

        // Second pass: Remove outliers > 3 standard deviations
        const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
        const variance = filtered.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filtered.length;
        const stdDev = Math.sqrt(variance);

        // Only filter outliers if we have enough data and significant variance
        if (stdDev > 1 && filtered.length > 5) {
            const upperBound = mean + (3 * stdDev);
            const lowerBound = Math.max(2, mean - (3 * stdDev));
            filtered = filtered.filter(interval => interval >= lowerBound && interval <= upperBound);
        }

        return filtered;
    }

    /**
     * Calculate weighted average with exponential decay.
     * Recent kills get more weight: weight = 2^(-daysAgo / halfLifeDays)
     */
    private calculateWeightedAverage(killsWithDates: { interval: number; date: Date }[]): number {
        if (killsWithDates.length === 0) return 0;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let totalWeight = 0;
        let weightedSum = 0;

        killsWithDates.forEach(({ interval, date }) => {
            const daysAgo = differenceInDays(now, date);
            // Exponential decay: weight halves every WEIGHT_DECAY.halfLifeDays days
            let weight = Math.pow(2, -daysAgo / WEIGHT_DECAY.halfLifeDays);
            // Apply minimum weight
            weight = Math.max(weight, WEIGHT_DECAY.minWeight);

            weightedSum += interval * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Calculate data quality based on sample size and variance.
     */
    private calculateDataQuality(sampleSize: number, stdDev: number): 'HIGH' | 'MEDIUM' | 'LOW' {
        if (sampleSize >= DATA_QUALITY_THRESHOLDS.HIGH.minSamples && stdDev <= DATA_QUALITY_THRESHOLDS.HIGH.maxStdDev) {
            return 'HIGH';
        }
        if (sampleSize >= DATA_QUALITY_THRESHOLDS.MEDIUM.minSamples && stdDev <= DATA_QUALITY_THRESHOLDS.MEDIUM.maxStdDev) {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    /**
     * 2. Predicts using the Cycle + Multiples logic
     *    Now with POSSIBLE_LATE buffer to prevent premature cycle skipping.
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

        // --- Check for known fixed patterns first ---
        if (hasKnownPattern(bossName)) {
            const pattern = getKnownPattern(bossName)!;
            const daysSinceLast = differenceInDays(now, lastKillDate);

            // #5 FIX: Advance cycles for fixed-pattern bosses when overdue
            const fpCycleDuration = pattern.max > pattern.min ? pattern.max : pattern.min;
            let fpCycles = 1;
            if (daysSinceLast > fpCycleDuration) {
                fpCycles = Math.ceil(daysSinceLast / fpCycleDuration);
            }

            const targetDate = addDays(lastKillDate, fpCycles * pattern.min);
            const maxDate = addDays(lastKillDate, fpCycles * pattern.max);

            let status: Prediction['status'] = 'COOLDOWN';
            if (isAfter(now, maxDate)) {
                status = 'OVERDUE';
            } else if (isAfter(now, targetDate) || this.isSameDay(now, targetDate)) {
                status = 'WINDOW_OPEN';
            }

            // #6 FIX: Status-aware windowProgress
            let fpProgress: number;
            if (status === 'COOLDOWN') {
                const totalCooldown = differenceInDays(targetDate, lastKillDate);
                fpProgress = totalCooldown > 0 ? (daysSinceLast / totalCooldown) * 100 : 0;
            } else if (status === 'WINDOW_OPEN') {
                const windowSize = differenceInDays(maxDate, targetDate);
                const intoWindow = differenceInDays(now, targetDate);
                fpProgress = windowSize > 0 ? (intoWindow / windowSize) * 100 : 100;
            } else {
                // OVERDUE — how far past the max
                const windowSize = differenceInDays(maxDate, targetDate);
                const intoWindow = differenceInDays(now, targetDate);
                fpProgress = windowSize > 0 ? (intoWindow / windowSize) * 100 : 150;
            }

            const daysUntilOpen = differenceInDays(targetDate, now);
            let fpRelativeLabel = '';
            if (status === 'COOLDOWN') {
                fpRelativeLabel = daysUntilOpen === 1 ? 'Abre amanhã' : `Abre em ${daysUntilOpen} dias`;
            } else if (status === 'WINDOW_OPEN') {
                fpRelativeLabel = 'Padrão Fixo';
            } else {
                const overdueBy = differenceInDays(now, maxDate);
                fpRelativeLabel = `Atrasado ${overdueBy} dias (ciclo ${fpCycles})`;
            }

            return {
                bossName,
                world,
                status,
                nextMinSpawn: targetDate,
                nextMaxSpawn: maxDate,
                avgSpawnDate: targetDate,
                confidence: 95,
                windowProgress: Math.min(Math.max(fpProgress, 0), 200),
                daysUntilMin: daysUntilOpen,
                cycleInfo: {
                    cycleDuration: fpCycleDuration,
                    cyclesSkipped: fpCycles - 1,
                    margin: pattern.max - pattern.min
                },
                dataQuality: 'HIGH',
                sampleSize: stats.sampleSize,
                probabilityLabel: status === 'WINDOW_OPEN' ? 'Janela Aberta' : status === 'OVERDUE' ? 'Atrasado' : 'Cooldown',
                confidenceLabel: 'High',
                lastKill: lastKillDate,
                daysSinceKill: daysSinceLast,
                relativeLabel: fpRelativeLabel,
                isLowConfidence: false,
                // Fixed-pattern bosses: tight window = outer window (no IQR needed)
                tightMinSpawn: targetDate,
                tightMaxSpawn: maxDate,
                stats: {
                    minGap: differenceInDays(targetDate, lastKillDate),
                    maxGap: differenceInDays(maxDate, lastKillDate),
                    avgGap: pattern.min,
                    stdDev: 0,
                    sampleSize: stats.sampleSize,
                    confidence: 95,
                    rawGaps: stats.rawGaps,
                    filteredGaps: stats.filteredGaps,
                    worldGaps: stats.worldGaps,
                    tightMinGap: differenceInDays(targetDate, lastKillDate),
                    tightMaxGap: differenceInDays(maxDate, lastKillDate),
                    p25: stats.p25,
                    p75: stats.p75
                }
            };
        }

        const { avgInterval, weightedAvgInterval, stdDev, dataQuality } = stats;

        // #2 FIX: Use weighted average (recent kills weigh more), fallback to simple
        let effectiveInterval = weightedAvgInterval > 0 ? weightedAvgInterval : avgInterval;
        let effectiveStdDev = stdDev;

        // #9 FIX: Prefer per-world stats when enough data is available
        const worldGapData = stats.worldGaps[world];
        if (worldGapData && worldGapData.length >= 3) {
            const worldAvg = worldGapData.reduce((a, b) => a + b, 0) / worldGapData.length;
            const worldVar = worldGapData.reduce((a, b) => a + Math.pow(b - worldAvg, 2), 0) / worldGapData.length;
            effectiveInterval = worldAvg;
            effectiveStdDev = Math.sqrt(worldVar);
        }

        // --- STEP A: Calculate Dynamic Margin ---
        // #4 FIX: Dynamic cap proportional to interval instead of hard cap at 3
        let margin = Math.ceil(effectiveStdDev);
        if (margin < 1) margin = 1;
        const maxMargin = Math.max(2, Math.ceil(effectiveInterval * 0.4));
        if (margin > maxMargin) margin = maxMargin;

        // --- STEP B: Calculate Cycles ---
        // How many days have passed since the last kill?
        const daysSinceLast = differenceInDays(now, lastKillDate);

        // How many "cycles" of the average interval fit into this time?
        // #3 FIX: Use Math.floor to prevent premature window promotion
        let cycles = Math.floor(daysSinceLast / effectiveInterval);

        // If we are currently "before" the first cycle (e.g. 5 days passed, avg 14), 
        // we assume we are aiming for the 1st cycle.
        if (cycles < 1) cycles = 1;

        // --- STEP C: Project the Date ---
        // Target Date = LastKill + (Cycles * Average)
        let targetDate = addDays(lastKillDate, Math.round(cycles * effectiveInterval));

        // --- LATE BUFFER LOGIC ---
        // Instead of immediately jumping to next cycle when past maxSpawn,
        // check if we're within the late buffer window (POSSIBLE_LATE).
        let isLateBuffer = false;
        const currentMaxSpawn = addDays(targetDate, margin);
        const lateBufferEnd = addDays(currentMaxSpawn, LATE_BUFFER_DAYS);

        if (isAfter(now, currentMaxSpawn) && isBefore(now, lateBufferEnd)) {
            // We're in the late buffer - DON'T advance cycle yet
            isLateBuffer = true;
        } else {
            // Standard logic: If the target window + margin is ALREADY past late buffer, 
            // jump to the next cycle.
            while (isAfter(now, addDays(addDays(targetDate, margin), LATE_BUFFER_DAYS))) {
                cycles++;
                targetDate = addDays(lastKillDate, Math.round(cycles * effectiveInterval));
            }
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
            if (isLateBuffer) {
                probabilityLabel = 'Possível Atraso';
                relativeLabel = overdueBy === 1 ? 'Atrasado 1 dia (continue checando!)' : `Atrasado ${overdueBy} dias (continue checando!)`;
            } else {
                probabilityLabel = 'Atrasado';
                relativeLabel = overdueBy === 1 ? 'Atrasado 1 dia' : `Atrasado ${overdueBy} dias`;
            }
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
        // #13 FIX: Use dataQuality and coefficient of variation
        let confidence = 0;
        // Base from data quality
        if (dataQuality === 'HIGH') confidence += 0.5;
        else if (dataQuality === 'MEDIUM') confidence += 0.3;
        else confidence += 0.1;
        // Sample size bonus (diminishing returns, capped at 0.3)
        confidence += Math.min(0.3, stats.sampleSize * 0.02);
        // Stability bonus from coefficient of variation
        const cv = effectiveStdDev / effectiveInterval;
        if (cv < 0.15) confidence += 0.2;
        else if (cv < 0.3) confidence += 0.1;
        // Penalty for high cycle count
        confidence -= (cycles - 1) * 0.1;
        confidence = Math.max(0.1, Math.min(1, confidence));

        const isLowConfidence = confidence < 0.4;
        const confidenceLabel = confidence > 0.75 ? 'High' : confidence > 0.4 ? 'Medium' : 'Low';

        // #6 FIX: Status-aware windowProgress
        let windowProgress: number;
        if (status === 'COOLDOWN') {
            const totalCooldown = differenceInDays(minSpawn, lastKillDate);
            windowProgress = totalCooldown > 0 ? (daysSinceLast / totalCooldown) * 100 : 0;
        } else if (status === 'WINDOW_OPEN') {
            const windowSize = differenceInDays(maxSpawn, minSpawn);
            const intoWindow = differenceInDays(now, minSpawn);
            windowProgress = windowSize > 0 ? (intoWindow / windowSize) * 100 : 100;
        } else {
            // OVERDUE — progress past the window
            const windowSize = differenceInDays(maxSpawn, minSpawn);
            const intoWindow = differenceInDays(now, minSpawn);
            windowProgress = windowSize > 0 ? (intoWindow / windowSize) * 100 : 150;
        }
        windowProgress = Math.max(0, windowProgress);

        const daysUntilMin = differenceInDays(minSpawn, now);

        // --- IQR Tight Window ---
        // Use per-world P25/P75 if available, otherwise global
        let tightP25 = stats.p25;
        let tightP75 = stats.p75;
        if (worldGapData && worldGapData.length >= 5) {
            tightP25 = this.computePercentile(worldGapData, 25);
            tightP75 = this.computePercentile(worldGapData, 75);
        }
        const outerMinGap = differenceInDays(minSpawn, lastKillDate);
        const outerMaxGap = differenceInDays(maxSpawn, lastKillDate);
        // Clamp tight window to never exceed the outer window
        const tightMinGapDays = Math.max(outerMinGap, Math.round(cycles * tightP25));
        const tightMaxGapDays = Math.min(outerMaxGap, Math.round(cycles * tightP75));
        const tightMinSpawn = addDays(lastKillDate, tightMinGapDays);
        const tightMaxSpawn = addDays(lastKillDate, tightMaxGapDays);

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
                cycleDuration: effectiveInterval,
                cyclesSkipped: cycles - 1,
                margin
            },
            // Enhanced fields
            dataQuality,
            sampleSize: stats.sampleSize,
            isLateBuffer,
            // Compatibility
            probabilityLabel,
            confidenceLabel,
            lastKill: lastKillDate,
            daysSinceKill: daysSinceLast,
            relativeLabel,
            isLowConfidence,
            // IQR tight window
            tightMinSpawn,
            tightMaxSpawn,
            stats: {
                // FIXED: Return cumulative days from LastKill for timeline compatibility
                minGap: differenceInDays(minSpawn, lastKillDate),
                maxGap: differenceInDays(maxSpawn, lastKillDate),
                avgGap: Math.round(avgInterval),
                stdDev: stdDev,
                sampleSize: stats.sampleSize,
                confidence: Math.round(confidence * 100),
                // Compatibility for Drawer charts
                rawGaps: stats.rawGaps,
                filteredGaps: stats.filteredGaps,
                worldGaps: stats.worldGaps,
                // IQR
                tightMinGap: tightMinGapDays,
                tightMaxGap: tightMaxGapDays,
                p25: tightP25,
                p75: tightP75
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

    /**
     * Compute the Pth percentile of a sorted array of numbers.
     * Uses linear interpolation between closest ranks.
     */
    private computePercentile(values: number[], p: number): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        if (sorted.length === 1) return sorted[0];
        const rank = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(rank);
        const upper = Math.ceil(rank);
        if (lower === upper) return sorted[lower];
        const fraction = rank - lower;
        return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
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
            dataQuality: 'LOW',
            sampleSize: 0,
            probabilityLabel: 'Sem Dados',
            confidenceLabel: 'Low',
            lastKill: new Date(0),
            daysSinceKill: 0,
            relativeLabel: 'Dados insuficientes',
            isLowConfidence: true,
            stats: {
                minGap: 0, maxGap: 0, avgGap: 0, stdDev: 0, sampleSize: 0, confidence: 0,
                rawGaps: [], filteredGaps: [], worldGaps: {},
                tightMinGap: 0, tightMaxGap: 0, p25: 0, p75: 0
            }
        };
    }
}
