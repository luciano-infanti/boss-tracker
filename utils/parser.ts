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
        const val = parseInt(line.split(':')[1].trim().replace(/,/g, ''));
        boss.totalDaysSpawned = isNaN(val) ? 0 : val;
      } else if (line.startsWith('Total Kills:')) {
        const val = parseInt(line.split(':')[1].trim().replace(/,/g, ''));
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
      } else if (trimmedLine.includes('Total Spawn Days (All Worlds Combined):')) {
        // Split on the LAST colon to handle the text properly
        const parts = trimmedLine.split('Total Spawn Days (All Worlds Combined):');
        if (parts[1]) {
          const val = parseInt(parts[1].trim().replace(/,/g, ''));
          boss.totalSpawnDays = isNaN(val) ? 0 : val;
          console.log(`  📈 ${boss.name}: totalSpawnDays = ${boss.totalSpawnDays}`);
        }
      } else if (trimmedLine.includes('Total Kills (All Worlds Combined):')) {
        // Split on the LAST colon to handle the text properly
        const parts = trimmedLine.split('Total Kills (All Worlds Combined):');
        if (parts[1]) {
          const val = parseInt(parts[1].trim().replace(/,/g, ''));
          boss.totalKills = isNaN(val) ? 0 : val;
          console.log(`  🎯 ${boss.name}: totalKills = ${boss.totalKills}`);
        }
      } else if (trimmedLine.includes('Appears in')) {
        const match = trimmedLine.match(/([\d,]+) world/);
        boss.appearsInWorlds = match ? parseInt(match[1].replace(/,/g, '')) : 0;
      } else if (trimmedLine.includes('Typical Spawn Frequency')) {
        const parts = trimmedLine.split('Typical Spawn Frequency (averaged across worlds):');
        if (parts[1]) {
          boss.typicalSpawnFrequency = parts[1].trim();
        }
      } else if (trimmedLine.includes('Per-World Statistics:')) {
        inPerWorldSection = true;
      } else if (inPerWorldSection && trimmedLine.startsWith('•')) {
        const worldMatch = trimmedLine.match(/• ([^:]+): ([\d,]+) spawns, ([\d,]+) kills(?:, spawns (.+))?/);
        if (worldMatch) {
          boss.perWorldStats!.push({
            world: worldMatch[1].trim(),
            spawns: parseInt(worldMatch[2].replace(/,/g, '')),
            kills: parseInt(worldMatch[3].replace(/,/g, '')),
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

export function detectFileType(filename: string): 'world' | 'combined' | null {
  if (filename.includes('ALL_WORLDS_COMBINED')) return 'combined';
  if (filename.includes('RubinOT_Kills_')) return 'world';
  return null;
}

export function extractWorldName(filename: string): string | null {
  const match = filename.match(/RubinOT_Kills_([^.]+)\.txt/);
  return match ? match[1] : null;
}
