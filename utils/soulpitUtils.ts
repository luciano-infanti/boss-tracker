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
    // Soulpit logic disabled: always return raw count
    return rawCount;
};

import { Boss, CombinedBoss } from '@/types';

export const calculateAdjustedTotalKills = (boss: Boss | CombinedBoss): number => {
    // Soulpit logic disabled: always return raw total kills
    if ('history' in boss) {
        return boss.totalKills || 0;
    } else {
        return boss.totalKills || 0;
    }
};
