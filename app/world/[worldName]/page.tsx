'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import BossCalendar from '@/components/BossCalendar';
import { useParams } from 'next/navigation';
import { Boss } from '@/types';
import Loading from '@/components/Loading';
import PageTransition from '@/components/PageTransition';

export default function WorldPage() {
  const params = useParams();
  const worldName = params.worldName as string;
  const { data, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('kills');

  const worldData = data.worlds[worldName] || [];

  const counts = useMemo(() => {
    return {
      killedToday: worldData.filter(b =>
        data.daily?.kills.some(k =>
          k.bossName === b.name && k.worlds.some(w => w.world === worldName)
        )
      ).length,
      neverKilled: worldData.filter(b => (b.totalKills || 0) === 0).length
    };
  }, [worldData, data.daily, worldName]);

  const filtered = useMemo(() => {
    let bosses = worldData.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'killedToday') {
      // FILTER to only show killed today based on daily data
      bosses = bosses.filter(b =>
        data.daily?.kills.some(k =>
          k.bossName === b.name && k.worlds.some(w => w.world === worldName)
        )
      );
      bosses.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
    } else if (sortBy === 'kills') {
      // Sort by kills but show ALL bosses
      bosses.sort((a, b) => {
        const isKilled = (name: string) => data.daily?.kills.some(k =>
          k.bossName === name && k.worlds.some(w => w.world === worldName)
        );

        const aKilledToday = isKilled(a.name) ? 1 : 0;
        const bKilledToday = isKilled(b.name) ? 1 : 0;

        // Killed today first
        if (aKilledToday !== bKilledToday) {
          return bKilledToday - aKilledToday;
        }

        // Check for "New" (First kill ever)
        const getIsNew = (boss: Boss) => {
          if (!isKilled(boss.name)) return false;
          const dailyKill = data.daily?.kills.find(k => k.bossName === boss.name);
          const worldKill = dailyKill?.worlds.find(w => w.world === worldName);
          if (!worldKill) return false;
          // If total kills in this world == kills today in this world, it's new
          return boss.totalKills === worldKill.count;
        };

        const aNew = getIsNew(a) ? 1 : 0;
        const bNew = getIsNew(b) ? 1 : 0;

        if (aNew !== bNew) return bNew - aNew;

        // Then by total kills
        return (b.totalKills || 0) - (a.totalKills || 0);
      });
    } else if (sortBy === 'neverKilled') {
      bosses = bosses.filter(b => (b.totalKills || 0) === 0);
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default fallback
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    }

    return bosses;
  }, [worldData, search, sortBy, data.daily, worldName]);

  if (isLoading) {
    return <Loading />;
  }

  if (worldData.length === 0) {
    return <EmptyState worldName={worldName} />;
  }

  const totalKills = worldData.reduce((sum, boss) => sum + (boss.totalKills || 0), 0);
  const mostKilled = [...worldData].sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0))[0];

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{worldName}</h1>
        <p className="text-secondary">Server specific statistics and history</p>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-secondary text-xs mb-1 uppercase tracking-wide">Most Killed</p>
          <p className="text-lg font-medium text-white truncate">{mostKilled?.name || 'N/A'}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-secondary text-xs mb-1 uppercase tracking-wide">Killed Today</p>
          <p className="text-lg font-medium text-emerald-400">{counts.killedToday}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-secondary text-xs mb-1 uppercase tracking-wide">Never Killed</p>
          <p className="text-lg font-medium text-red-400">{counts.neverKilled}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-secondary text-xs mb-1 uppercase tracking-wide">Total Kills</p>
          <p className="text-lg font-medium text-white">{totalKills}</p>
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showKilledTodayFilter={true}
        counts={counts}
      />

      {sortBy === 'killedToday' && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No bosses killed today</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filtered.map((boss) => {
          const isKilledToday = data.daily?.kills.some(k =>
            k.bossName === boss.name && k.worlds.some(w => w.world === worldName)
          );

          const dailyKill = data.daily?.kills.find(k => k.bossName === boss.name);
          const worldKill = dailyKill?.worlds.find(w => w.world === worldName);
          const isNew = isKilledToday && worldKill ? boss.totalKills === worldKill.count : false;

          return (
            <BossCard
              key={boss.name}
              boss={boss}
              type="world"
              isKilledToday={isKilledToday}
              isNew={isNew}
              dailyKill={isKilledToday ? dailyKill : undefined}
              worldName={worldName}
            />
          );
        })}
      </div>

      <BossCalendar worldName={worldName} />
    </PageTransition>
  );
}
