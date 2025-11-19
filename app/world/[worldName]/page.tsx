'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';

function isKilledToday(lastKillDate: string): boolean {
  if (lastKillDate === 'Never' || lastKillDate === 'N/A') return false;
  const today = new Date();
  const killDate = new Date(lastKillDate.split('/').reverse().join('-'));
  return (
    killDate.getDate() === today.getDate() &&
    killDate.getMonth() === today.getMonth() &&
    killDate.getFullYear() === today.getFullYear()
  );
}

export default function WorldPage() {
  const params = useParams();
  const worldName = params.worldName as string;
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('killedToday');

  const worldData = data.worlds[worldName] || [];

  const filtered = useMemo(() => {
    let bosses = worldData.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'name') {
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'kills') {
      bosses.sort((a, b) => b.totalKills - a.totalKills);
    } else if (sortBy === 'nextSpawn') {
      bosses.sort((a, b) => {
        if (a.nextExpectedSpawn === 'N/A') return 1;
        if (b.nextExpectedSpawn === 'N/A') return -1;
        return new Date(a.nextExpectedSpawn).getTime() - new Date(b.nextExpectedSpawn).getTime();
      });
    } else if (sortBy === 'killedToday') {
      bosses.sort((a, b) => {
        const aKilledToday = isKilledToday(a.lastKillDate);
        const bKilledToday = isKilledToday(b.lastKillDate);
        
        if (aKilledToday && !bKilledToday) return -1;
        if (!aKilledToday && bKilledToday) return 1;
        
        return b.totalKills - a.totalKills;
      });
    }

    return bosses;
  }, [worldData, search, sortBy]);

  if (worldData.length === 0) {
    return <EmptyState worldName={worldName} />;
  }

  return (
    <div>
      <SearchBar 
        value={search} 
        onChange={setSearch} 
        sortBy={sortBy} 
        onSortChange={setSortBy}
        showKilledTodayFilter={true}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((boss) => (
          <BossCard key={boss.name} boss={boss} type="world" />
        ))}
      </div>
    </div>
  );
}
