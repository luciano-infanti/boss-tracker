import { Boss, CombinedBoss, BossKillHistory } from '@/types';
import { normalizeBossName } from '@/utils/bossExtraData';

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
        boss.name = normalizeBossName(line.replace('Boss:', '').trim());
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

    // Fallback: If lastKillDate is 'Never' but history exists, extract it
    if (boss.lastKillDate === 'Never' && boss.history && boss.history !== 'None') {
      const firstDate = boss.history.split(',')[0].trim();
      // Extract date part: "22/11/2025 (1x)" -> "22/11/2025"
      const match = firstDate.match(/^(\d{2}\/\d{2}\/\d{4})/);
      if (match) {
        boss.lastKillDate = match[1];
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
        boss.name = normalizeBossName(trimmedLine.replace('Boss:', '').trim());
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
  // Fallback: Check content for world file signature if filename doesn't match
  if (content && content.includes('RubinOT Boss Kill Tracker -') && content.includes('Last Updated:')) return 'world';
  return null;
}

export function extractWorldName(filename: string, content?: string): string | null {
  // Try filename first
  const match = filename.match(/RubinOT_Kills_([^.]+)\.txt/);
  if (match) return match[1];

  // Try content header
  if (content) {
    const headerMatch = content.match(/RubinOT Boss Kill Tracker - (.+)/);
    if (headerMatch) return headerMatch[1].trim();
  }

  return null;
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

      // Parse history: "11/11/2025 (1x)" or "11/11/2025"
      const historyEntries = boss.history.split(',').map(s => s.trim());
      const killDates: any[] = [];

      historyEntries.forEach(h => {
        // Relaxed regex: Optional count, optional spaces
        const match = h.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*\((\d+)x\))?$/);
        if (match) {
          const [_, day, month, year, countStr] = match;
          const count = countStr ? parseInt(countStr) : 1;
          const dateStr = `${day}/${month}/${year}`;

          // Keep as single entry with actual count
          const killEntry = { date: dateStr, world: worldName, count };
          killDates.push(killEntry);
          entry.chronologicalHistory.push(killEntry);
        }
      });

      entry.killsByWorld[worldName] = killDates;
    });
  });

  return Array.from(historyMap.values());
}
