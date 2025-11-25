'use client';

import { useData } from '@/context/DataContext';
import { getBossImage } from '@/utils/bossImages';
import { Trophy, Server, Calendar } from 'lucide-react';
import BossCard from '@/components/BossCard';
import Loading from '@/components/Loading';
import PageTransition from '@/components/PageTransition';

import { getAdjustedKillCount } from '@/utils/soulpitUtils';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { getBossCategory } from '@/utils/bossCategories';
import NoResults from '@/components/NoResults';

export default function TodayPage() {
  const { data, isLoading } = useData();
  const daily = data.daily;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // We don't really sort here (it's fixed logic), but SearchBar needs these props
  const [sortBy, setSortBy] = useState('kills');

  const sortedKills = [...(data.daily?.kills || [])]
    .filter((kill) => {
      // 1. Search Filter
      if (search && !kill.bossName.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'All') {
        if (getBossCategory(kill.bossName) !== selectedCategory) {
          return false;
        }
      }

      // 3. Soulpit Filter
      return getAdjustedKillCount(kill.bossName, kill.totalKills) > 0;
    })
    .sort((a, b) => {
      // Check for "New" (First kill ever globally)
      const getIsNew = (bossName: string, killsToday: number) => {
        const globalBoss = data.combined.find(b => b.name === bossName);
        if (!globalBoss) return false;
        // If global total kills == kills today, it's new
        return globalBoss.totalKills === killsToday;
      };

      const aNew = getIsNew(a.bossName, a.totalKills) ? 1 : 0;
      const bNew = getIsNew(b.bossName, b.totalKills) ? 1 : 0;

      if (aNew !== bNew) return bNew - aNew;

      return b.totalKills - a.totalKills;
    });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Today's Kills</h1>
        <p className="text-secondary">
          {daily?.date ? `Latest update: ${daily.timestamp}` : 'No data for today'}
        </p>
      </div>

      {!daily ? (
        <div className="bg-surface-hover rounded-lg p-12 text-center border border-border border-dashed">
          <p className="text-secondary">No daily data available. Upload a daily-stats.txt file.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <SearchBar
            value={search}
            onChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showMostKills={false}
            showNeverKilled={false}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="text-yellow-400/80" size={18} />
                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Total Kills</p>
              </div>
              <p className="text-3xl font-semibold text-white">{daily.totalKills}</p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Server className="text-emerald-400" size={18} />
                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Unique Bosses</p>
              </div>
              <p className="text-3xl font-semibold text-white">{daily.uniqueBosses}</p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-primary" size={18} />
                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Most Active</p>
              </div>
              <p className="text-xl font-medium text-white truncate">
                {sortedKills[0]?.bossName || '-'}
              </p>
            </div>
          </div>

          {sortedKills.length === 0 ? (
            <NoResults message={
              search ? `No bosses found matching "${search}"` :
                selectedCategory !== 'All' ? `No bosses found in ${selectedCategory}` :
                  "No bosses killed today matching your criteria"
            } />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedKills.map((kill) => {
                const boss = data.combined.find(b => b.name === kill.bossName) || {
                  name: kill.bossName,
                  totalKills: kill.totalKills,
                  totalSpawnDays: 0,
                  appearsInWorlds: 0,
                  typicalSpawnFrequency: 'N/A',
                  perWorldStats: []
                };

                const isNew = boss.totalKills === kill.totalKills;

                return (
                  <BossCard
                    key={kill.bossName}
                    boss={boss}
                    type="combined"
                    isKilledToday={true}
                    isNew={isNew}
                    dailyKill={kill}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
