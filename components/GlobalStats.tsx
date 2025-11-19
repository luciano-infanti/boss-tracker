'use client';

import { Trophy, Calendar } from 'lucide-react';
import { CombinedBoss } from '@/types';

interface GlobalStatsProps {
  bosses: CombinedBoss[];
}

export default function GlobalStats({ bosses }: GlobalStatsProps) {
  const topKilledBosses = [...bosses]
    .sort((a, b) => b.totalKills - a.totalKills)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-400" size={20} />
          <h2 className="text-xl font-bold text-white">Top 10 Most Killed Bosses</h2>
        </div>
        <div className="space-y-2">
          {topKilledBosses.map((boss, index) => (
            <div key={boss.name} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold w-6">{index + 1}.</span>
                <span className="text-gray-200">{boss.name}</span>
              </div>
              <span className="text-yellow-400 font-semibold">{boss.totalKills} kills</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-400" size={20} />
          <h2 className="text-xl font-bold text-white">Stats Overview</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Total Bosses Tracked</p>
            <p className="text-2xl font-bold text-white">{bosses.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Kills (All Worlds)</p>
            <p className="text-2xl font-bold text-emerald-400">
              {bosses.reduce((sum, boss) => sum + boss.totalKills, 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Most Active Boss</p>
            <p className="text-lg font-semibold text-white">
              {topKilledBosses[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
