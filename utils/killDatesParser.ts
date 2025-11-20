export interface KillDateEntry {
  date: string; // DD/MM/YYYY
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

export function parseCompleteKillDates(content: string): BossKillHistory[] {
  const bosses: BossKillHistory[] = [];
  const bossBlocks = content.split('----------------------------------------').filter(b => b.trim());

  for (const block of bossBlocks) {
    const lines = block.trim().split('\n');
    const boss: Partial<BossKillHistory> = {
      killsByWorld: {},
      chronologicalHistory: []
    };

    let currentWorld = '';
    let inChronological = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('Boss:')) {
        boss.bossName = trimmed.replace('Boss:', '').trim();
      } else if (trimmed.startsWith('Total Spawn Days:')) {
        boss.totalSpawnDays = parseInt(trimmed.split(':')[1].trim());
      } else if (trimmed.startsWith('Total Kills:')) {
        boss.totalKills = parseInt(trimmed.split(':')[1].trim());
      } else if (trimmed.match(/^[A-Z][a-z]+ \(\d+ days, \d+ kills\):/)) {
        // World header: "Solarian (11 days, 12 kills):"
        const match = trimmed.match(/^([A-Z][a-z]+) \(/);
        if (match) {
          currentWorld = match[1];
          boss.killsByWorld![currentWorld] = [];
        }
      } else if (trimmed.includes('Chronological History (All Worlds Combined):')) {
        inChronological = true;
        currentWorld = '';
      } else if (trimmed.startsWith('•')) {
        // Kill date entry
        const dateMatch = trimmed.match(/• (\d{2}\/\d{2}\/\d{4})(?: \((\d+)x\))?/);
        if (dateMatch) {
          const date = dateMatch[1];
          const count = dateMatch[2] ? parseInt(dateMatch[2]) : 1;

          if (inChronological) {
            // Parse chronological: "• 05/11/2025 - Solarian (2x)"
            const worldMatch = trimmed.match(/- ([A-Z][a-z]+)(?: \((\d+)x\))?/);
            if (worldMatch) {
              const world = worldMatch[1];
              const worldCount = worldMatch[2] ? parseInt(worldMatch[2]) : 1;
              boss.chronologicalHistory!.push({ date, world, count: worldCount });
            }
          } else if (currentWorld) {
            // World-specific entry
            boss.killsByWorld![currentWorld].push({ date, world: currentWorld, count });
          }
        }
      }
    }

    if (boss.bossName) {
      bosses.push(boss as BossKillHistory);
    }
  }

  return bosses;
}
