'use client';

import { Search, X, LayoutGrid, List } from 'lucide-react';

import { BossCategory, BOSS_CATEGORY_ICONS } from '@/utils/bossCategories';
import FilterPill from './FilterPill';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
  showKilledTodayFilter?: boolean;
  counts?: {
    killedToday?: number;
    neverKilled?: number;
    nextSpawn?: number;
  };
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function SearchBar({
  value,
  onChange,
  sortBy,
  onSortChange,
  selectedCategories = [],
  onCategoryChange,
  showKilledTodayFilter = false,
  showMostKills = true,
  showNeverKilled = true,
  counts,
  viewMode = 'grid',
  onViewModeChange
}: SearchBarProps & { showMostKills?: boolean; showNeverKilled?: boolean }) {

  const categories: BossCategory[] = ['Archdemons', 'Rookgaard', 'Pits of Inferno', 'Creatures'];

  const handleSortClick = (sort: string) => {
    if (sortBy === sort) {
      onSortChange('kills');
    } else {
      onSortChange(sort);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (!onCategoryChange) return;

    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-white transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search bosses..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-lg text-base text-white placeholder-secondary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        {onViewModeChange && (
          <div className="flex bg-surface border border-border rounded-lg p-1 gap-1 shrink-0">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                  ? 'bg-surface-hover text-white shadow-sm'
                  : 'text-secondary hover:text-white hover:bg-surface-hover/50'
                }`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list'
                  ? 'bg-surface-hover text-white shadow-sm'
                  : 'text-secondary hover:text-white hover:bg-surface-hover/50'
                }`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Sort Filters */}
        {showMostKills && (
          <FilterPill
            label="All"
            active={sortBy === 'kills'}
            onClick={() => handleSortClick('kills')}
            removable={false}
          />
        )}
        {showKilledTodayFilter && (
          <FilterPill
            label={`Killed Today${counts?.killedToday !== undefined ? ` (${counts.killedToday})` : ''}`}
            active={sortBy === 'killedToday'}
            onClick={() => handleSortClick('killedToday')}
          />
        )}
        {showNeverKilled && (
          <FilterPill
            label={`Never Killed${counts?.neverKilled !== undefined ? ` (${counts.neverKilled})` : ''}`}
            active={sortBy === 'neverKilled'}
            onClick={() => handleSortClick('neverKilled')}
          />
        )}

        {/* Category Filters */}
        {onCategoryChange && (
          <>
            {(showMostKills || showKilledTodayFilter || showNeverKilled) && (
              <div className="w-px h-6 bg-border mx-1 self-center hidden sm:block" />
            )}
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={selectedCategories.includes(cat)}
                onClick={() => handleCategoryClick(cat)}
                variant="secondary"
                // @ts-ignore
                icon={BOSS_CATEGORY_ICONS[cat]}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}


