'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import GlobalStats from '@/components/GlobalStats';
import Loading from '@/components/Loading';
import PageTransition from '@/components/PageTransition';

export default function GlobalPage() {
  const { data, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('kills');

  // Debug logs
  console.log('📊 Global Page - data.combined:', data.combined);
  console.log('📊 Number of bosses:', data.combined?.length);
  if (data.combined?.length > 0) {
    console.log('📊 First boss:', data.combined[0]);
    console.log('📊 First boss totalKills:', data.combined[0]?.totalKills);
  }

  // Calculate aggregated stats from all worlds
  const aggregatedStats = useMemo(() => {
    const stats = new Map<string, number>();
    const allBosses = new Set<string>();

    // Initialize with combined data to get all boss names
    data.combined.forEach(b => {
      allBosses.add(b.name);
      stats.set(b.name, 0);
    });

    // Sum kills from all worlds
    Object.values(data.worlds).forEach(worldBosses => {
      worldBosses.forEach(wb => {
        allBosses.add(wb.name);
        const current = stats.get(wb.name) || 0;
        stats.set(wb.name, current + (wb.totalKills || 0));
      });
    });

    return { stats, allBosses };
  }, [data.worlds, data.combined]);

  const counts = useMemo(() => {
    if (!data.combined) return {};

    let neverKilledCount = 0;
    aggregatedStats.allBosses.forEach(name => {
      if ((aggregatedStats.stats.get(name) || 0) === 0) {
        neverKilledCount++;
      }
    });

    return {
      neverKilled: neverKilledCount
    };
  }, [data.combined, aggregatedStats]);

  const filtered = useMemo(() => {
    let bosses = [...data.combined];

    // If searching, filter first
    if (search) {
      bosses = bosses.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'kills') {
      bosses.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
    } else if (sortBy === 'neverKilled') {
      // Filter using the aggregated stats
      bosses = bosses.filter(b => (aggregatedStats.stats.get(b.name) || 0) === 0);
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default fallback
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    }

    return bosses;
  }, [data.combined, search, sortBy, aggregatedStats]);

  if (isLoading) {
    return <Loading />;
  }

  if (!data.combined || data.combined.length === 0) {
    return <EmptyState />;
  }

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Global Stats</h1>
        <p className="text-secondary">Aggregated statistics across all worlds</p>
      </div>
      <GlobalStats bosses={data.combined} />
      <SearchBar
        value={search}
        onChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
        showMostKills={false}
        showNeverKilled={false}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((boss) => (
          <BossCard key={boss.name} boss={boss} type="combined" showNextSpawn={false} />
        ))}
      </div>
    </PageTransition>
  );
}
