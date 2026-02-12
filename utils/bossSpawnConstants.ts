/**
 * Boss Spawn Knowledge Base
 * 
 * Contains known minimum spawn intervals and patterns for Tibia bosses.
 * This data helps sanitize predictions and filter impossible intervals.
 */

/**
 * Minimum spawn intervals (in days) based on known game mechanics.
 * These are the MINIMUM days between spawns - actual intervals may be longer.
 * 
 * Sources: TibiaWiki, community data
 */
export const BOSS_MINIMUM_INTERVALS: Record<string, number> = {
    // Archdemons & Major Bosses
    'Orshabaal': 14,
    'Morgaroth': 21,
    'Ghazbaran': 21,
    'Ferumbras': 28,
    'Omrafir': 14,

    // Vampire Lords
    'Arachir the Ancient One': 5,
    'Sir Valorcrest': 5,
    'Diblis the Fair': 5,
    'Zevelon Duskbringer': 5,
    'The Pale Count': 7,

    // Dragons
    'Dracola': 7,
    'Dharalion': 7,
    'Tyrn': 7,
    'Demodras': 14,

    // World Bosses
    'Shlorg': 7,
    'The Welter': 7,
    'Ocyakao': 7,
    'The Big Bad One': 5,
    'Groam': 7,

    // Cave Bosses
    'Hirintror': 7,
    'Yeti': 7,
    'Zomba': 7,
    'Dreadmaw': 7,

    // Rare Spawns
    'Midnight Panther': 3,
    'White Pale': 7,

    // Default for unknown bosses - conservative estimate
    'DEFAULT': 3
};

/**
 * Known fixed-pattern bosses with exact spawn windows.
 * These bosses have predictable spawn patterns based on events or mechanics.
 */
export const BOSS_KNOWN_PATTERNS: Record<string, {
    min: number;
    max: number;
    type: 'FIXED' | 'EVENT' | 'RAID';
}> = {
    // Yearly event bosses
    'The Percht Queen': { min: 365, max: 365, type: 'EVENT' },
    'Frostbell': { min: 365, max: 365, type: 'EVENT' },
    'Frostreaper': { min: 365, max: 365, type: 'EVENT' },

    // Fixed interval bosses
    'Ferumbras Mortal Shell': { min: 28, max: 28, type: 'FIXED' },

    // Raid bosses with known patterns
    'The Welter': { min: 7, max: 14, type: 'RAID' },
};

/**
 * Late buffer configuration: How many days past max spawn to wait before
 * jumping to the next cycle. This prevents premature cycle skipping.
 */
export const LATE_BUFFER_DAYS = 3;

/**
 * Minimum data quality thresholds
 */
export const DATA_QUALITY_THRESHOLDS = {
    HIGH: {
        minSamples: 10,
        maxStdDev: 2
    },
    MEDIUM: {
        minSamples: 5,
        maxStdDev: 5
    },
    // LOW is anything below MEDIUM thresholds
};

/**
 * Weight decay configuration for weighted averages.
 * Uses formula: weight = 2^(-daysAgo / halfLifeDays)
 */
export const WEIGHT_DECAY = {
    halfLifeDays: 90,  // Weight halves every 90 days
    minWeight: 0.1     // Minimum weight to prevent old data from being ignored completely
};

/**
 * Get minimum interval for a boss, with fallback to default.
 */
export function getMinimumInterval(bossName: string): number {
    return BOSS_MINIMUM_INTERVALS[bossName] ?? BOSS_MINIMUM_INTERVALS['DEFAULT'];
}

/**
 * Check if a boss has a known fixed pattern.
 */
export function hasKnownPattern(bossName: string): boolean {
    return bossName in BOSS_KNOWN_PATTERNS;
}

/**
 * Get the known pattern for a boss, or null if not known.
 */
export function getKnownPattern(bossName: string): { min: number; max: number; type: string } | null {
    return BOSS_KNOWN_PATTERNS[bossName] ?? null;
}
