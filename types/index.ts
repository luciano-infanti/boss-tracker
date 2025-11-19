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
}

export interface WorldData {
  [worldName: string]: Boss[];
}

export interface ParsedData {
  worlds: WorldData;
  combined: CombinedBoss[];
}
