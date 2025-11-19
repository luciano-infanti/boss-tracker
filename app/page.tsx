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

  const filtered = useMemo(() => {
    let bosses = data.combined.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'name') {
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'kills') {
      bosses.sort((a, b) => b.totalKills - a.totalKills);
    }

    return bosses;
  }, [data.combined, search, sortBy]);

  if (data.combined.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <GlobalStats bosses={data.combined} />
      <SearchBar value={search} onChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((boss) => (
          <BossCard
            key={boss.name}
            boss={boss}
            type="combined"
            isKilledToday={data.daily?.kills.some(k => k.bossName === boss.name)}
          />
        ))}
      </div>
    </div>
  );
}
