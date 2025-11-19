import { Boss, CombinedBoss } from '@/types';

export function parseSingleWorldFile(content: string): Boss[] {
  const bosses: Boss[] = [];
  const records = content.split('---').filter(r => r.trim());

  for (const record of records) {
    const lines = record.trim().split('\n');
    const boss: Partial<Boss> = {
      totalDaysSpawned: 0,
      totalKills: 0,
      spawnFrequency: 'N/A',
      nextExpectedSpawn: 'N/A',
      lastKillDate: 'Never',
      history: 'None'
    };

    for (const line of lines) {
      if (line.startsWith('Boss:')) {
        boss.name = line.replace('Boss:', '').trim();
      } else if (line.startsWith('Total Days Spawned:')) {
        const val = parseInt(line.split(':')[1].trim());
        boss.totalDaysSpawned = isNaN(val) ? 0 : val;
      } else if (line.startsWith('Total Kills:')) {
        const val = parseInt(line.split(':')[1].trim());
        boss.totalKills = isNaN(val) ? 0 : val;
      } else if (line.startsWith('Spawn Frequency:')) {
        boss.spawnFrequency = line.split(':')[1].trim();
      } else if (line.startsWith('Next Expected Spawn:')) {
        boss.nextExpectedSpawn = line.split(':')[1].trim();
      } else if (line.startsWith('Last Kill Date:')) {
        boss.lastKillDate = line.split(':')[1].trim();
      } else if (line.startsWith('History:')) {
        boss.history = line.split(':')[1].trim();
      }
    }

    if (boss.name) {
      bosses.push(boss as Boss);
    }
  }

  return bosses;
}

export function parseCombinedFile(content: string): CombinedBoss[] {
  const bosses: CombinedBoss[] = [];
  const records = content.split('---').filter(r => r.trim() && !r.includes('SUMMARY STATISTICS'));

  for (const record of records) {
    const lines = record.trim().split('\n');
    const boss: Partial<CombinedBoss> = { 
      perWorldStats: [],
      totalSpawnDays: 0,
      totalKills: 0,
      appearsInWorlds: 0,
      typicalSpawnFrequency: 'N/A'
    };

    let inPerWorldSection = false;

    for (const line of lines) {
      if (line.startsWith('Boss:')) {
        boss.name = line.replace('Boss:', '').trim();
      } else if (line.includes('Total Spawn Days (All Worlds Combined):')) {
        const val = parseInt(line.split(':')[1].trim());
        boss.totalSpawnDays = isNaN(val) ? 0 : val;
      } else if (line.includes('Total Kills (All Worlds Combined):')) {
        const val = parseInt(line.split(':')[1].trim());
        boss.totalKills = isNaN(val) ? 0 : val;
      } else if (line.includes('Appears in')) {
        const match = line.match(/(\d+) world/);
        boss.appearsInWorlds = match ? parseInt(match[1]) : 0;
      } else if (line.includes('Typical Spawn Frequency')) {
        boss.typicalSpawnFrequency = line.split(':')[1].trim();
      } else if (line.includes('Per-World Statistics:')) {
        inPerWorldSection = true;
      } else if (inPerWorldSection && line.trim().startsWith('•')) {
        const worldMatch = line.match(/• ([^:]+): (\d+) spawns, (\d+) kills(?:, spawns (.+))?/);
        if (worldMatch) {
          boss.perWorldStats!.push({
            world: worldMatch[1].trim(),
            spawns: parseInt(worldMatch[2]),
            kills: parseInt(worldMatch[3]),
            frequency: worldMatch[4] || 'N/A'
          });
        }
      }
    }

    if (boss.name) {
      bosses.push(boss as CombinedBoss);
    }
  }

  return bosses;
}

export function detectFileType(filename: string): 'world' | 'combined' | null {
  if (filename.includes('ALL_WORLDS_COMBINED')) return 'combined';
  if (filename.includes('RubinOT_Kills_')) return 'world';
  return null;
}

export function extractWorldName(filename: string): string | null {
  const match = filename.match(/RubinOT_Kills_([^.]+)\.txt/);
  return match ? match[1] : null;
}
