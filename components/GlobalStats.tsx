'use client';

import { useState } from 'react';
import { Trophy, Calendar, Server } from 'lucide-react';
import { CombinedBoss } from '@/types';
import { getBossCategory } from '@/utils/bossCategories';
import { calculateAdjustedTotalKills } from '@/utils/soulpitUtils';
import CategoryDropdown from './CategoryDropdown';

import { getWorldIcon } from '@/utils/worldIcons';

interface GlobalStatsProps {
  bosses: CombinedBoss[];
  worlds: Record<string, any[]>;
}

export default function GlobalStats({ bosses, worlds }: GlobalStatsProps) {
  const [topBossesCategory, setTopBossesCategory] = useState<string>('All');
  const [serverStatsCategory, setServerStatsCategory] = useState<string>('All');

  const categories: string[] = ['Archdemons', 'POI', 'Creatures'];

  // Filter Top Bosses
  const filteredTopBosses = bosses.filter(boss => {
    if (topBossesCategory !== 'All') {
      return getBossCategory(boss.name) === topBossesCategory;
    }
    return true;
  });

  const topKilledBosses = [...filteredTopBosses]
    .map(boss => ({
      ...boss,
      // Use adjusted kill count logic (e.g. for Soulpit bosses)
      adjustedKills: calculateAdjustedTotalKills(boss)
    }))
    .sort((a, b) => b.adjustedKills - a.adjustedKills)
    .slice(0, 10);

  // Calculate Server Stats (Ranking)
  const serverStats = (() => {
    if (!worlds) return [];

    const stats: { name: string; kills: number }[] = [];

    Object.entries(worlds).forEach(([worldName, worldBosses]) => {
      let worldKills = 0;
      worldBosses.forEach((boss: any) => {
        // Filter by category
        if (serverStatsCategory !== 'All') {
          const category = getBossCategory(boss.name);
          if (category !== serverStatsCategory) return;
        }
        worldKills += boss.totalKills || 0;
      });
      stats.push({ name: worldName, kills: worldKills });
    });

    return stats.sort((a, b) => b.kills - a.kills);
  })();

  // Stats Overview - Should be GLOBAL (unfiltered by top lists)
  // We use the full 'bosses' array passed from parent (which is already aggregated)
  const totalBossesTracked = bosses.length;
  const totalGlobalKills = bosses.reduce((sum, boss) => sum + (boss.totalKills || 0), 0);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Bosses */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400/80" size={18} />
              <h2 className="text-sm font-medium text-white">Top 10 Most Killed</h2>
            </div>
            <CategoryDropdown
              value={topBossesCategory}
              onChange={setTopBossesCategory}
              categories={categories}
            />
          </div>
          <div className="space-y-1">
            {topKilledBosses.map((boss, index) => (
              <div key={boss.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group hover:bg-surface-hover/30 px-2 -mx-2 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-secondary font-medium w-4 text-xs text-right">{index + 1}</span>
                  <span className="text-gray-200 text-sm truncate max-w-[140px]">{boss.name}</span>
                </div>
                <span className="text-secondary text-xs font-medium group-hover:text-white transition-colors">{boss.adjustedKills} kills</span>
              </div>
            ))}
            {topKilledBosses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <img
                  src="https://www.tibiawiki.com.br/images/f/ff/Baby_Demon.gif"
                  alt="No results"
                  className="w-8 h-8 mb-2 object-contain opacity-60"
                />
                <p className="text-secondary text-xs">No bosses found</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Servers */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Server className="text-blue-400" size={18} />
              <h2 className="text-sm font-medium text-white">Top Active Servers</h2>
            </div>
            <CategoryDropdown
              value={serverStatsCategory}
              onChange={setServerStatsCategory}
              categories={categories}
            />
          </div>
          <div className="space-y-1">
            {serverStats.slice(0, 10).map((server, index) => (
              <div key={server.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group hover:bg-surface-hover/30 px-2 -mx-2 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-secondary font-medium w-4 text-xs text-right">{index + 1}</span>
                  <span className="text-gray-200 text-sm capitalize">{server.name}</span>
                </div>
                <span className="text-secondary text-xs font-medium group-hover:text-white transition-colors">{server.kills} kills</span>
              </div>
            ))}
            {serverStats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <img
                  src="https://www.tibiawiki.com.br/images/f/ff/Baby_Demon.gif"
                  alt="No results"
                  className="w-8 h-8 mb-2 object-contain opacity-60"
                />
                <p className="text-secondary text-xs">No server data</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary" size={18} />
            <h2 className="text-sm font-medium text-white">Stats Overview</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-4 bg-surface-hover/30 rounded-lg border border-border/50">
              <p className="text-secondary text-xs mb-1">Total Bosses Tracked</p>
              <p className="text-2xl font-semibold text-white">{totalBossesTracked}</p>
            </div>
            <div className="p-4 bg-surface-hover/30 rounded-lg border border-border/50">
              <p className="text-secondary text-xs mb-1">Total Kills (All Worlds)</p>
              <p className="text-2xl font-semibold text-emerald-400">{totalGlobalKills}</p>
            </div>
            {serverStats.length > 0 && (
              <div className="p-4 bg-surface-hover/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={getWorldIcon(serverStats[0].name)}
                    alt="World"
                    className="w-3 h-3 object-contain opacity-80"
                  />
                  <p className="text-secondary text-xs">Most Active World (All Time)</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-white capitalize">{serverStats[0].name}</p>
                  <span className="text-xs text-emerald-400">{serverStats[0].kills} kills</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
