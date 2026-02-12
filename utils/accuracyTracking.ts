/**
 * Accuracy Tracking Utility
 * 
 * Track prediction accuracy over time to improve the algorithm
 * and show users how reliable the predictions are.
 */

import { differenceInDays, isWithinInterval, parseISO, format } from 'date-fns';

// --- Types ---

export interface PredictionRecord {
    id: string;
    bossName: string;
    world: string;
    predictedAt: string;  // ISO date
    predictedStatus: string;
    predictedWindow: {
        min: string;  // ISO date
        max: string;  // ISO date
    };
    actualKillDate?: string;  // ISO date, filled when kill is recorded
    wasCorrect?: boolean;
}

export interface AccuracyStats {
    overallAccuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    bossAccuracy: Record<string, {
        correct: number;
        total: number;
        accuracy: number;
    }>;
    recentAccuracy: number;  // Last 30 days
    accuracyByStatus: Record<string, {
        correct: number;
        total: number;
        accuracy: number;
    }>;
}

// --- Storage ---

const STORAGE_KEY = 'boss-tracker-accuracy';
const MAX_RECORDS = 500;  // Limit storage size

/**
 * Get all prediction records from localStorage.
 */
export function getPredictionRecords(): PredictionRecord[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        console.warn('Failed to load prediction records from localStorage');
        return [];
    }
}

/**
 * Save prediction records to localStorage.
 */
function savePredictionRecords(records: PredictionRecord[]): void {
    if (typeof window === 'undefined') return;

    try {
        // Keep only the most recent records
        const trimmed = records.slice(-MAX_RECORDS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        console.warn('Failed to save prediction records to localStorage');
    }
}

/**
 * Generate a unique ID for a prediction.
 */
function generatePredictionId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// --- Recording Functions ---

/**
 * Store a prediction for later accuracy tracking.
 * Call this when displaying a prediction to the user.
 */
export function storePrediction(
    bossName: string,
    world: string,
    predictedStatus: string,
    predictedWindow: { min: Date; max: Date }
): string {
    const id = generatePredictionId();
    const record: PredictionRecord = {
        id,
        bossName,
        world,
        predictedAt: new Date().toISOString(),
        predictedStatus,
        predictedWindow: {
            min: predictedWindow.min.toISOString(),
            max: predictedWindow.max.toISOString()
        }
    };

    const records = getPredictionRecords();
    records.push(record);
    savePredictionRecords(records);

    return id;
}

/**
 * Record when a boss is actually killed.
 * This updates the prediction record with the actual kill date.
 */
export function recordPredictionAccuracy(
    bossName: string,
    world: string,
    actualKillDate: Date,
    predictedStatus: string,
    predictedWindow: { min: Date; max: Date }
): void {
    const records = getPredictionRecords();

    // Find matching predictions for this boss/world that haven't been resolved
    const matchingRecords = records.filter(r =>
        r.bossName === bossName &&
        r.world === world &&
        !r.actualKillDate
    );

    if (matchingRecords.length === 0) {
        // No existing prediction, create a resolved record directly
        const record: PredictionRecord = {
            id: generatePredictionId(),
            bossName,
            world,
            predictedAt: new Date().toISOString(),
            predictedStatus,
            predictedWindow: {
                min: predictedWindow.min.toISOString(),
                max: predictedWindow.max.toISOString()
            },
            actualKillDate: actualKillDate.toISOString(),
            wasCorrect: isPredictionCorrect(actualKillDate, predictedWindow)
        };
        records.push(record);
    } else {
        // Update the most recent matching prediction
        const latestRecord = matchingRecords[matchingRecords.length - 1];
        latestRecord.actualKillDate = actualKillDate.toISOString();
        latestRecord.wasCorrect = isPredictionCorrect(
            actualKillDate,
            {
                min: parseISO(latestRecord.predictedWindow.min),
                max: parseISO(latestRecord.predictedWindow.max)
            }
        );
    }

    savePredictionRecords(records);
}

/**
 * Check if a prediction was correct.
 * A prediction is correct if the actual kill happened within the predicted window
 * or within a 1-day grace period.
 */
export function isPredictionCorrect(
    killDate: Date,
    predictedWindow: { min: Date; max: Date }
): boolean {
    // Add 1-day grace period on each side
    const graceDays = 1;
    const adjustedMin = new Date(predictedWindow.min);
    const adjustedMax = new Date(predictedWindow.max);
    adjustedMin.setDate(adjustedMin.getDate() - graceDays);
    adjustedMax.setDate(adjustedMax.getDate() + graceDays);

    return isWithinInterval(killDate, { start: adjustedMin, end: adjustedMax });
}

// --- Statistics Functions ---

/**
 * Get overall accuracy statistics.
 */
export function getAccuracyStats(): AccuracyStats {
    const records = getPredictionRecords();
    const resolvedRecords = records.filter(r => r.actualKillDate !== undefined);

    if (resolvedRecords.length === 0) {
        return {
            overallAccuracy: 0,
            totalPredictions: 0,
            correctPredictions: 0,
            bossAccuracy: {},
            recentAccuracy: 0,
            accuracyByStatus: {}
        };
    }

    const correctPredictions = resolvedRecords.filter(r => r.wasCorrect).length;
    const overallAccuracy = (correctPredictions / resolvedRecords.length) * 100;

    // Calculate per-boss accuracy
    const bossAccuracy: AccuracyStats['bossAccuracy'] = {};
    resolvedRecords.forEach(r => {
        if (!bossAccuracy[r.bossName]) {
            bossAccuracy[r.bossName] = { correct: 0, total: 0, accuracy: 0 };
        }
        bossAccuracy[r.bossName].total++;
        if (r.wasCorrect) bossAccuracy[r.bossName].correct++;
    });
    Object.values(bossAccuracy).forEach(stats => {
        stats.accuracy = (stats.correct / stats.total) * 100;
    });

    // Calculate accuracy by status
    const accuracyByStatus: AccuracyStats['accuracyByStatus'] = {};
    resolvedRecords.forEach(r => {
        if (!accuracyByStatus[r.predictedStatus]) {
            accuracyByStatus[r.predictedStatus] = { correct: 0, total: 0, accuracy: 0 };
        }
        accuracyByStatus[r.predictedStatus].total++;
        if (r.wasCorrect) accuracyByStatus[r.predictedStatus].correct++;
    });
    Object.values(accuracyByStatus).forEach(stats => {
        stats.accuracy = (stats.correct / stats.total) * 100;
    });

    // Calculate recent accuracy (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecords = resolvedRecords.filter(r =>
        parseISO(r.predictedAt) >= thirtyDaysAgo
    );
    const recentCorrect = recentRecords.filter(r => r.wasCorrect).length;
    const recentAccuracy = recentRecords.length > 0
        ? (recentCorrect / recentRecords.length) * 100
        : 0;

    return {
        overallAccuracy,
        totalPredictions: resolvedRecords.length,
        correctPredictions,
        bossAccuracy,
        recentAccuracy,
        accuracyByStatus
    };
}

/**
 * Get accuracy trend over time for charting.
 */
export function getAccuracyTrend(): { date: string; accuracy: number; count: number }[] {
    const records = getPredictionRecords();
    const resolvedRecords = records.filter(r => r.actualKillDate !== undefined);

    // Group by week
    const weeklyData: Record<string, { correct: number; total: number }> = {};

    resolvedRecords.forEach(r => {
        const date = parseISO(r.actualKillDate!);
        const weekStart = format(date, 'yyyy-ww');  // Year-Week format

        if (!weeklyData[weekStart]) {
            weeklyData[weekStart] = { correct: 0, total: 0 };
        }
        weeklyData[weekStart].total++;
        if (r.wasCorrect) weeklyData[weekStart].correct++;
    });

    return Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
            date,
            accuracy: (data.correct / data.total) * 100,
            count: data.total
        }));
}

/**
 * Clear all accuracy data (for debugging/reset).
 */
export function clearAccuracyData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
