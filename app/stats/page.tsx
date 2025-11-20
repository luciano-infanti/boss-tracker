'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import GlobalStats from '@/components/GlobalStats';

export default function GlobalPage() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('kills');

  // Debug logs
  console.log('📊 Global Page - data.combined:', data.combined);
  console.log('📊 Number of bosses:', data.combined?.length);
  if (data.combined?.length > 0) {
    console.log('📊 First boss:', data.combined[0]);
    console.log('📊 First boss totalKills:', data.combined[0]?.totalKills);
  }

  const counts = useMemo(() => {
    if (!data.combined) return {};
    return {
      neverKilled: data.combined.filter(b => (b.totalKills || 0) === 0).length
    };
  }, [data.combined]);

  const filtered = useMemo(() => {
    let bosses = data.combined.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'kills') {
      bosses.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
    } else if (sortBy === 'neverKilled') {
      bosses = bosses.filter(b => (b.totalKills || 0) === 0);
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default fallback (e.g. if 'name' was previously selected)
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    }

    return bosses;
  }, [data.combined, search, sortBy]);

  if (!data.combined || data.combined.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <GlobalStats bosses={data.combined} />
      <SearchBar
        value={search}
        onChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((boss) => (
          <BossCard key={boss.name} boss={boss} type="combined" />
        ))}
      </div>
    </div>
  );
}
