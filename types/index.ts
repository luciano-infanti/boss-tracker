export interface Boss {
  name: string;
  totalDaysSpawned: number;
  totalKills: number;
  spawnFrequency: string;
  nextExpectedSpawn: string;
  lastKillDate: string;
  history: string;
}

export interface CombinedBoss {
  name: string;
  totalSpawnDays: number;
  totalKills: number;
  appearsInWorlds: number;
  typicalSpawnFrequency: string;
  perWorldStats: Array<{
    world: string;
    spawns: number;
    kills: number;
    frequency: string;
  }>;
  lastKillDate?: string;
}

export interface WorldData {
  [worldName: string]: Boss[];
}

export interface DailyKill {
  bossName: string;
  worlds: Array<{
    world: string;
    count: number;
  }>;
  totalKills: number;
}

export interface DailyUpdate {
  date: string;
  timestamp: string;
  totalKills: number;
  uniqueBosses: number;
  kills: DailyKill[];
}

export interface KillDateEntry {
  date: string;
  world: string;
  count: number;
}

export interface BossKillHistory {
  bossName: string;
  totalSpawnDays: number;
  totalKills: number;
  killsByWorld: {
    [world: string]: KillDateEntry[];
  };
  chronologicalHistory: KillDateEntry[];
}

export interface ParsedData {
  worlds: WorldData;
  combined: CombinedBoss[];
  daily?: DailyUpdate;
  killDates?: BossKillHistory[];
  characters?: Character[];
  dailyUpdate?: DailyUpdate; // Alias for daily if needed, or just use daily
}

export interface CharacterStats {
  rank: number;
  value: number;
  display: string;
}

export interface CharacterSnapshot {
  date: string; // YYYY-MM-DD
  level: number;
  experience: number;
  daily_raw: number; // from stats.daily_raw.value
  stats: {
    magic_level?: number;
    fishing?: number;
    // Add other skills as needed
  };
}

export interface Character {
  name: string;
  world: string;
  vocation: string;
  level: number;
  link: string;
  last_updated: string;
  history: CharacterSnapshot[];
}
