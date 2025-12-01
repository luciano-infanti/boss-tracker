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
import { getAdjustedKillCount, calculateAdjustedTotalKills } from '@/utils/soulpitUtils';
import { getBossCategory } from '@/utils/bossCategories';
import NoResults from '@/components/NoResults';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorldPage() {
  const params = useParams();
  const worldName = params.worldName as string;
  const { data, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('kills');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const worldData = useMemo(() => {
    const currentWorldData = data.worlds[worldName] || [];
    if (!data.combined || data.combined.length === 0) return currentWorldData;

    const existingNames = new Set(currentWorldData.map(b => b.name));
    const missingBosses = data.combined
      .filter(cb => !existingNames.has(cb.name))
      .map(cb => ({
        name: cb.name,
        totalDaysSpawned: 0,
        totalKills: 0,
        spawnFrequency: 'N/A',
        nextExpectedSpawn: 'N/A',
        lastKillDate: 'Never',
        history: 'None'
      } as Boss));

    return [...currentWorldData, ...missingBosses];
  }, [data.worlds, data.combined, worldName]);

  const counts = useMemo(() => {
    return {
      killedToday: worldData.filter(b =>
        data.daily?.kills.some(k => {
          if (k.bossName !== b.name) return false;
          const worldKill = k.worlds.find(w => w.world === worldName);
          if (!worldKill) return false;
          return getAdjustedKillCount(b.name, worldKill.count) > 0;
        })
      ).length,
      neverKilled: worldData.filter(b => (b.totalKills || 0) === 0).length
    };
  }, [worldData, data.daily, worldName]);

  const filtered = useMemo(() => {
    let result = worldData.filter(boss => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!boss.name.toLowerCase().includes(searchLower)) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const category = getBossCategory(boss.name);
        if (!selectedCategories.includes(category)) return false;
      }

      return true;
    });

    // Sort logic...
    if (sortBy === 'kills') {
      result.sort((a, b) => {
        const isKilled = (name: string) => data.daily?.kills.some(k => {
          if (k.bossName !== name) return false;
          const worldKill = k.worlds.find(w => w.world === worldName);
          if (!worldKill) return false;
          return getAdjustedKillCount(name, worldKill.count) > 0;
        });

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

        // Then by total kills (adjusted for Soulpit bosses)
        const aTotalKills = calculateAdjustedTotalKills(a);
        const bTotalKills = calculateAdjustedTotalKills(b);
        return bTotalKills - aTotalKills;
      });
    } else if (sortBy === 'killedToday') {
      result = result.filter(boss => {
        const isKilledToday = data.daily?.kills.some(k => {
          if (k.bossName !== boss.name) return false;
          const worldKill = k.worlds.find(w => w.world === worldName);
          if (!worldKill) return false;
          return getAdjustedKillCount(boss.name, worldKill.count) > 0;
        });
        return isKilledToday;
      });
      result.sort((a, b) => {
        const aTotalKills = calculateAdjustedTotalKills(a);
        const bTotalKills = calculateAdjustedTotalKills(b);
        return bTotalKills - aTotalKills;
      });
    } else if (sortBy === 'neverKilled') {
      result = result.filter(boss => (boss.totalKills || 0) === 0);
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default fallback
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [worldData, worldName, search, sortBy, selectedCategories, data.daily]);

  if (isLoading) {
    return <Loading />;
  }

  if (worldData.length === 0) {
    return <EmptyState worldName={worldName} />;
  }

  const totalKills = worldData.reduce((sum, boss) => sum + (boss.totalKills || 0), 0);

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{worldName}</h1>
        <p className="text-secondary">Server specific statistics and history</p>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Next Expected Boss Card */}
        {(() => {
          // Find the boss with the soonest next expected spawn
          const expectedBosses = worldData
            .filter(b => b.nextExpectedSpawn && b.nextExpectedSpawn !== 'N/A')
            .sort((a, b) => {
              // Parse dates (DD/MM/YYYY)
              const parseDate = (dateStr: string) => {
                const [day, month, year] = dateStr.split('/').map(Number);
                return new Date(year, month - 1, day).getTime();
              };
              return parseDate(a.nextExpectedSpawn) - parseDate(b.nextExpectedSpawn);
            });

          const nextBoss = expectedBosses[0];

          if (nextBoss) {
            const [day, month, year] = nextBoss.nextExpectedSpawn.split('/').map(Number);
            const expectedDate = new Date(year, month - 1, day);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const isOverdue = expectedDate < today;

            // Hide card if overdue
            if (isOverdue) {
              return null;
            }

            return (
              <div className="bg-surface border border-border rounded-lg p-4">
                <p className="text-secondary text-xs mb-1 uppercase tracking-wide">Next Expected</p>
                <p className="text-lg font-medium text-white truncate">{nextBoss.name}</p>
                <p className="text-xs text-emerald-400">
                  {nextBoss.nextExpectedSpawn}
                </p>
              </div>
            );
          }
          return null; // Hide if no expected bosses
        })()}

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
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        showKilledTodayFilter={true}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="min-h-screen flex flex-col gap-8">
        {filtered.length === 0 ? (
          <NoResults message={
            search ? `No bosses found matching "${search}"` :
              sortBy === 'killedToday' ? "No bosses killed today" :
                selectedCategories.length > 0 ? `No bosses found in selected categories` :
                  "No bosses found"
          } />
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
          }>
            {filtered.map((boss) => {
              const isKilledToday = data.daily?.kills.some(k => {
                if (k.bossName !== boss.name) return false;
                const worldKill = k.worlds.find(w => w.world === worldName);
                if (!worldKill) return false;
                return getAdjustedKillCount(boss.name, worldKill.count) > 0;
              });

              const dailyKill = data.daily?.kills.find(k => k.bossName === boss.name);
              const worldKill = dailyKill?.worlds.find(w => w.world === worldName);
              const isNew = isKilledToday && worldKill ? boss.totalKills === worldKill.count : false;

              return (
                <motion.div
                  key={boss.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <BossCard
                    boss={boss}
                    type="world"
                    isKilledToday={isKilledToday}
                    isNew={isNew}
                    dailyKill={isKilledToday ? dailyKill : undefined}
                    worldName={worldName}
                    viewMode={viewMode}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        <BossCalendar worldName={worldName} />
      </div>
    </PageTransition>
  );
}
