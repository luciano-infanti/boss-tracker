'use client';

import { Search } from 'lucide-react';
import { BossCategory, BOSS_CATEGORY_ICONS } from '@/utils/bossCategories';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  showKilledTodayFilter?: boolean;
  counts?: {
    killedToday?: number;
    neverKilled?: number;
    nextSpawn?: number;
  };
}

export default function SearchBar({
  value,
  onChange,
  sortBy,
  onSortChange,
  selectedCategory = 'All',
  onCategoryChange,
  showKilledTodayFilter = false,
  showMostKills = true,
  showNeverKilled = true,
  counts
}: SearchBarProps & { showMostKills?: boolean; showNeverKilled?: boolean }) {

  const categories: (BossCategory | 'All')[] = ['All', 'Archdemons', 'Rookgaard', 'POI', 'Creature'];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-white transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search bosses..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-lg text-base text-white placeholder-secondary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Sort Filters */}
        {showMostKills && (
          <FilterPill
            label="Most Kills"
            active={sortBy === 'kills'}
            onClick={() => onSortChange('kills')}
          />
        )}
        {showKilledTodayFilter && (
          <FilterPill
            label={`Killed Today${counts?.killedToday !== undefined ? ` (${counts.killedToday})` : ''}`}
            active={sortBy === 'killedToday'}
            onClick={() => onSortChange('killedToday')}
          />
        )}
        {showNeverKilled && (
          <FilterPill
            label={`Never Killed${counts?.neverKilled !== undefined ? ` (${counts.neverKilled})` : ''}`}
            active={sortBy === 'neverKilled'}
            onClick={() => onSortChange('neverKilled')}
          />
        )}

        {/* Category Filters */}
        {onCategoryChange && (
          <>
            <div className="w-px h-6 bg-border mx-1 self-center hidden sm:block" />
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => onCategoryChange(cat)}
                variant="secondary"
                icon={cat !== 'All' ? BOSS_CATEGORY_ICONS[cat as keyof typeof BOSS_CATEGORY_ICONS] : undefined}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  variant = 'primary',
  icon
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${active
        ? 'bg-surface-hover text-white border-primary/50 shadow-sm'
        : 'bg-surface text-secondary border-border hover:border-border/80 hover:text-white'
        }`}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className="w-5 h-5 object-contain rounded-full"
        />
      )}
      {label}
    </button>
  );
}
