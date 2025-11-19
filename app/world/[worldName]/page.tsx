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
  today.setHours(0, 0, 0, 0);
  
  const [day, month, year] = lastKillDate.split('/').map(Number);
  const killDate = new Date(year, month - 1, day);
  killDate.setHours(0, 0, 0, 0);
  
  return killDate.getTime() === today.getTime();
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

    // If "Killed Today" is selected, FILTER to only show those bosses
    if (sortBy === 'killedToday') {
      bosses = bosses.filter(b => isKilledToday(b.lastKillDate));
      // Then sort by total kills descending
      bosses.sort((a, b) => b.totalKills - a.totalKills);
    } else if (sortBy === 'name') {
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'kills') {
      bosses.sort((a, b) => b.totalKills - a.totalKills);
    } else if (sortBy === 'nextSpawn') {
      bosses.sort((a, b) => {
        if (a.nextExpectedSpawn === 'N/A') return 1;
        if (b.nextExpectedSpawn === 'N/A') return -1;
        return new Date(a.nextExpectedSpawn).getTime() - new Date(b.nextExpectedSpawn).getTime();
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
      
      {sortBy === 'killedToday' && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No bosses killed today</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((boss) => (
          <BossCard key={boss.name} boss={boss} type="world" />
        ))}
      </div>
    </div>
  );
}
