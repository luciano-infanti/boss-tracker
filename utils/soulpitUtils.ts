export const SOULPIT_BOSSES = [
    'Yeti',
    'Midnight Panther',
    'Crustacea Gigantica',
    'Draptor'
];

export const SOULPIT_BATCH_SIZE = 28;

export const isSoulpitBoss = (bossName: string): boolean => {
    return SOULPIT_BOSSES.some(b => b.toLowerCase() === bossName.toLowerCase());
};

export const getAdjustedKillCount = (bossName: string, rawCount: number): number => {
    if (!isSoulpitBoss(bossName)) {
        return rawCount;
    }
    // Remove multiples of 28 (Soulpit batch size)
    // Example: 28 -> 0, 29 -> 1, 56 -> 0, 57 -> 1
    return rawCount % SOULPIT_BATCH_SIZE;
};

import { Boss, CombinedBoss } from '@/types';

export const calculateAdjustedTotalKills = (boss: Boss | CombinedBoss): number => {
    if (!isSoulpitBoss(boss.name)) {
        return boss.totalKills || 0;
    }

    if ('history' in boss) {
        // World View (Boss type)
        if (!boss.history || boss.history === 'None') {
            // Fallback to totalKills if history is missing or None
            return getAdjustedKillCount(boss.name, boss.totalKills || 0);
        }
        // Parse history string to calculate adjusted kills
        const adjustedKills = boss.history.split(',').reduce((acc, entry) => {
            const match = entry.trim().match(/^(\d{2}\/\d{2}\/\d{4})(?:\s*\((\d+)x\))?$/);
            if (!match) return acc;
            const count = match[2] ? parseInt(match[2]) : 1;
            return acc + getAdjustedKillCount(boss.name, count);
        }, 0);
        return adjustedKills;
    } else {
        // Combined View (CombinedBoss type) - this else handles 'perWorldStats' in boss
        return boss.perWorldStats.reduce((acc, stat) => {
            return acc + getAdjustedKillCount(boss.name, stat.kills);
        }, 0);
    }
};
