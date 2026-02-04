import { DailyUpdate, DailyKill } from '@/types';
import { normalizeBossName } from '@/utils/bossExtraData';

export function parseDailyUpdate(content: string): DailyUpdate | null {
  try {
    const lines = content.split('\n').filter(line => line.trim());

    // Extract date and timestamp
    const dateMatch = content.match(/RUBINOT DAILY UPDATE - (.+)/);
    if (!dateMatch) return null;

    const [date, time] = dateMatch[1].split(', ');

    // Extract stats
    const totalKillsMatch = content.match(/Total Kills Scanned: (\d+)/);
    const uniqueBossesMatch = content.match(/Unique Bosses: (\d+)/);

    const totalKills = totalKillsMatch ? parseInt(totalKillsMatch[1]) : 0;
    const uniqueBosses = uniqueBossesMatch ? parseInt(uniqueBossesMatch[1]) : 0;

    // Parse boss kills
    const kills: DailyKill[] = [];
    const bossSection = content.split('🎯 BOSSES KILLED TODAY:')[1]?.split('------------------------------------------------------------')[0];

    if (bossSection) {
      const bossLines = bossSection.split('\n').filter(line => line.trim().startsWith('•'));

      for (const line of bossLines) {
        const match = line.match(/• ([^:]+): (.+)/);
        if (match) {
          const bossName = normalizeBossName(match[1].trim());
          const worldsData = match[2].split(',').map(w => w.trim());

          const worlds: Array<{ world: string; count: number }> = [];
          let totalBossKills = 0;

          for (const worldStr of worldsData) {
            const countMatch = worldStr.match(/(.+?) \((\d+)x\)/);
            if (countMatch) {
              const world = countMatch[1].trim();
              const count = parseInt(countMatch[2]);
              worlds.push({ world, count });
              totalBossKills += count;
            } else {
              worlds.push({ world: worldStr, count: 1 });
              totalBossKills += 1;
            }
          }

          kills.push({
            bossName,
            worlds,
            totalKills: totalBossKills
          });
        }
      }
    }

    return {
      date,
      timestamp: time,
      totalKills,
      uniqueBosses,
      kills
    };
  } catch (error) {
    console.error('Error parsing daily update:', error);
    return null;
  }
}
