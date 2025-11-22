import { Boss, CombinedBoss, BossKillHistory } from '@/types';

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
  console.log('🔍 Starting to parse combined file');
  const bosses: CombinedBoss[] = [];
  const records = content.split('---').filter(r => r.trim() && !r.includes('SUMMARY STATISTICS'));

  console.log(`📊 Found ${records.length} boss records`);

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
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('Boss:')) {
        boss.name = trimmedLine.replace('Boss:', '').trim();
      } else if (trimmedLine.startsWith('Total Spawn Days:')) {
        const val = parseInt(trimmedLine.split(':')[1].trim());
        boss.totalSpawnDays = isNaN(val) ? 0 : val;
      } else if (trimmedLine.startsWith('Total Kills:')) {
        const val = parseInt(trimmedLine.split(':')[1].trim());
        boss.totalKills = isNaN(val) ? 0 : val;
        console.log(`  🎯 ${boss.name}: totalKills = ${boss.totalKills}`);
      } else if (trimmedLine.startsWith('Appears in')) {
        const match = trimmedLine.match(/(\d+) world/);
        boss.appearsInWorlds = match ? parseInt(match[1]) : 0;
      } else if (trimmedLine.startsWith('Typical Spawn Frequency:')) {
        boss.typicalSpawnFrequency = trimmedLine.split('Typical Spawn Frequency:')[1].trim();
      } else if (trimmedLine.includes('Per-World Statistics:')) {
        inPerWorldSection = true;
      } else if (inPerWorldSection && trimmedLine.startsWith('•')) {
        const worldMatch = trimmedLine.match(/• ([^:]+): (\d+) spawns, (\d+) kills(?:, spawns (.+))?/);
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
      console.log(`✅ Added boss: ${boss.name} with ${boss.totalKills} kills`);
      bosses.push(boss as CombinedBoss);
    }
  }

  console.log(`🎉 Parsed ${bosses.length} bosses total`);
  return bosses;
}

export function detectFileType(filename: string, content?: string): 'world' | 'combined' | 'daily' | null {
  if (filename.includes('ALL_WORLDS_COMBINED')) return 'combined';
  if (filename.includes('RubinOT_Kills_')) return 'world';
  if (content && content.includes('RUBINOT DAILY UPDATE')) return 'daily';
  return null;
}

export function extractWorldName(filename: string): string | null {
  const match = filename.match(/RubinOT_Kills_([^.]+)\.txt/);
  return match ? match[1] : null;
}

export function aggregateKillHistory(worlds: Record<string, Boss[]>): BossKillHistory[] {
  const historyMap = new Map<string, BossKillHistory>();

  Object.entries(worlds).forEach(([worldName, bosses]) => {
    bosses.forEach(boss => {
      if (!boss.history || boss.history === 'None') return;

      if (!historyMap.has(boss.name)) {
        historyMap.set(boss.name, {
          bossName: boss.name,
          totalSpawnDays: 0,
          totalKills: 0,
          killsByWorld: {},
          chronologicalHistory: []
        });
      }

      const entry = historyMap.get(boss.name)!;
      entry.totalSpawnDays += boss.totalDaysSpawned;
      entry.totalKills += boss.totalKills;

      // Parse history: "11/11/2025 (1x)"
      const historyEntries = boss.history.split(',').map(s => s.trim());
      const killDates: any[] = [];

      historyEntries.forEach(h => {
        const match = h.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*\((\d+)x\)$/);
        if (match) {
          const [_, day, month, year, countStr] = match;
          const count = parseInt(countStr);
          const dateStr = `${day}/${month}/${year}`;

          for (let i = 0; i < count; i++) {
            killDates.push({ date: dateStr, world: worldName, count: 1 });
            entry.chronologicalHistory.push({ date: dateStr, world: worldName, count: 1 });
          }
        }
      });

      entry.killsByWorld[worldName] = killDates;
    });
  });

  return Array.from(historyMap.values());
}
