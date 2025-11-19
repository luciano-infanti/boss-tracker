'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';

function isKilledToday(lastKillDate: string | undefined): boolean {
  if (!lastKillDate || lastKillDate === 'Never' || lastKillDate === 'N/A') return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const parts = lastKillDate.split('/');
    if (parts.length !== 3) return false;
    
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    
    const killDate = new Date(year, month - 1, day);
    killDate.setHours(0, 0, 0, 0);
    
    return killDate.getTime() === today.getTime();
  } catch {
    return false;
  }
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

    if (sortBy === 'killedToday') {
      bosses = bosses.filter(b => isKilledToday(b.lastKillDate));
      bosses.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
    } else if (sortBy === 'name') {
      bosses.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'kills') {
      bosses.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
    } else if (sortBy === 'nextSpawn') {
      bosses.sort((a, b) => {
        if (!a.nextExpectedSpawn || a.nextExpectedSpawn === 'N/A') return 1;
        if (!b.nextExpectedSpawn || b.nextExpectedSpawn === 'N/A') return -1;
        
        try {
          const dateA = new Date(a.nextExpectedSpawn.split('/').reverse().join('-'));
          const dateB = new Date(b.nextExpectedSpawn.split('/').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
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
