/**
 * Spawn Visualization Helpers
 * 
 * Provides chart-ready data structures for visualizing boss spawn patterns.
 */

import { differenceInDays, format } from 'date-fns';
import { KillRecord } from './spawnLogic';

// --- Types ---

export interface SpawnPatternData {
    bossName: string;
    world: string;
    killDates: Date[];
    intervals: number[];
    statistics: {
        mean: number;
        median: number;
        stdDev: number;
        min: number;
        max: number;
        count: number;
    };
    chartData: {
        labels: string[];      // Kill sequence numbers or dates
        values: number[];      // Days between kills
        meanLine: number;      // Average for reference line
        upperBand: number;     // Mean + stdDev
        lowerBand: number;     // Mean - stdDev
    };
    timelineData: {
        dates: string[];       // Formatted dates
        cumulativeDays: number[];  // Days since first kill
    };
}

export interface AccuracyChartData {
    labels: string[];        // Time periods
    accuracy: number[];      // Accuracy percentages
    sampleCounts: number[];  // Number of predictions per period
}

// --- Calculation Functions ---

/**
 * Calculate statistics for an array of numbers.
 */
function calculateStats(values: number[]): {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
} {
    if (values.length === 0) {
        return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    // Median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

    // Standard Deviation
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
        mean,
        median,
        stdDev,
        min: sorted[0],
        max: sorted[sorted.length - 1]
    };
}

/**
 * Parse a date string in DD/MM/YYYY or ISO format.
 */
function parseDate(dateStr: string): Date {
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
}

// --- Main Functions ---

/**
 * Get spawn pattern data for visualization.
 * 
 * @param bossName - Name of the boss
 * @param world - Optional world filter (null for all worlds)
 * @param killHistory - Array of kill records
 * @returns Chart-ready spawn pattern data
 */
export function getSpawnPatternData(
    bossName: string,
    world: string | null,
    killHistory: KillRecord[]
): SpawnPatternData {
    // Filter kills for this boss and optionally world
    let filteredKills = killHistory.filter(k => k.bossName === bossName);
    if (world) {
        filteredKills = filteredKills.filter(k => k.world === world);
    }

    // Sort by date
    const sortedKills = filteredKills
        .map(k => ({
            ...k,
            date: parseDate(k.killedAt)
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const killDates = sortedKills.map(k => k.date);

    // Calculate intervals between kills
    const intervals: number[] = [];
    for (let i = 1; i < killDates.length; i++) {
        const days = differenceInDays(killDates[i], killDates[i - 1]);
        if (days > 1) {  // Filter obvious double kills
            intervals.push(days);
        }
    }

    const stats = calculateStats(intervals);

    // Build chart data
    const chartData = {
        labels: intervals.map((_, i) => `#${i + 1}`),
        values: intervals,
        meanLine: stats.mean,
        upperBand: stats.mean + stats.stdDev,
        lowerBand: Math.max(1, stats.mean - stats.stdDev)
    };

    // Build timeline data
    const firstKill = killDates[0];
    const timelineData = {
        dates: killDates.map(d => format(d, 'dd/MM/yyyy')),
        cumulativeDays: killDates.map(d =>
            firstKill ? differenceInDays(d, firstKill) : 0
        )
    };

    return {
        bossName,
        world: world ?? 'All Worlds',
        killDates,
        intervals,
        statistics: {
            ...stats,
            count: intervals.length
        },
        chartData,
        timelineData
    };
}

/**
 * Get chart data comparing multiple bosses.
 */
export function getMultiBossChartData(
    bossNames: string[],
    killHistory: KillRecord[]
): Record<string, SpawnPatternData> {
    const result: Record<string, SpawnPatternData> = {};

    bossNames.forEach(bossName => {
        result[bossName] = getSpawnPatternData(bossName, null, killHistory);
    });

    return result;
}

/**
 * Get chart data for world comparison of a single boss.
 */
export function getWorldComparisonData(
    bossName: string,
    killHistory: KillRecord[]
): Record<string, SpawnPatternData> {
    // Get unique worlds for this boss
    const worlds = [...new Set(
        killHistory
            .filter(k => k.bossName === bossName)
            .map(k => k.world)
    )];

    const result: Record<string, SpawnPatternData> = {};

    worlds.forEach(world => {
        result[world] = getSpawnPatternData(bossName, world, killHistory);
    });

    return result;
}

/**
 * Get histogram data for interval distribution.
 */
export function getIntervalHistogram(
    intervals: number[],
    bucketSize: number = 1
): { label: string; count: number }[] {
    if (intervals.length === 0) return [];

    const maxInterval = Math.max(...intervals);
    const numBuckets = Math.ceil(maxInterval / bucketSize);
    const buckets: number[] = new Array(numBuckets).fill(0);

    intervals.forEach(interval => {
        const bucketIndex = Math.floor((interval - 1) / bucketSize);
        if (bucketIndex >= 0 && bucketIndex < numBuckets) {
            buckets[bucketIndex]++;
        }
    });

    return buckets.map((count, i) => ({
        label: bucketSize === 1
            ? `${i * bucketSize + 1}`
            : `${i * bucketSize + 1}-${(i + 1) * bucketSize}`,
        count
    }));
}
