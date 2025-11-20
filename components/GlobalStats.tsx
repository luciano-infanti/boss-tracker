import { Trophy, Calendar } from 'lucide-react';
import { CombinedBoss } from '@/types';
import BossCalendar from './BossCalendar';
import ContributionGraph from './ContributionGraph';

interface GlobalStatsProps {
  bosses: CombinedBoss[];
}

export default function GlobalStats({ bosses }: GlobalStatsProps) {
  const topKilledBosses = [...bosses]
    .sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0))
    .slice(0, 10);

  const totalKills = bosses.reduce((sum, boss) => sum + (boss.totalKills || 0), 0);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-yellow-400/80" size={18} />
            <h2 className="text-sm font-medium text-white">Top 10 Most Killed Bosses</h2>
          </div>
          <div className="space-y-1">
            {topKilledBosses.map((boss, index) => (
              <div key={boss.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group hover:bg-surface-hover/30 px-2 -mx-2 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-secondary font-medium w-4 text-xs text-right">{index + 1}</span>
                  <span className="text-gray-200 text-sm">{boss.name}</span>
                </div>
                <span className="text-secondary text-xs font-medium group-hover:text-white transition-colors">{boss.totalKills || 0} kills</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary" size={18} />
            <h2 className="text-sm font-medium text-white">Stats Overview</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-4 bg-surface-hover/30 rounded-lg border border-border/50">
              <p className="text-secondary text-xs mb-1">Total Bosses Tracked</p>
              <p className="text-2xl font-semibold text-white">{bosses.length}</p>
            </div>
            <div className="p-4 bg-surface-hover/30 rounded-lg border border-border/50">
              <p className="text-secondary text-xs mb-1">Total Kills (All Worlds)</p>
              <p className="text-2xl font-semibold text-emerald-400">{totalKills}</p>
            </div>
            <div className="p-4 bg-surface-hover/30 rounded-lg border border-border/50">
              <p className="text-secondary text-xs mb-1">Most Active Boss</p>
              <p className="text-lg font-medium text-white">
                {topKilledBosses[0]?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContributionGraph />
      {/* <BossCalendar /> */}
    </div>
  );
}
