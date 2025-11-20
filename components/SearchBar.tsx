'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showKilledTodayFilter?: boolean;
  counts?: {
    killedToday?: number;
    neverKilled?: number;
    nextSpawn?: number;
  };
}

export default function SearchBar({ value, onChange, sortBy, onSortChange, showKilledTodayFilter = false, counts }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-white transition-colors" size={16} />
        <input
          type="text"
          placeholder="Search bosses..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-md text-sm text-white placeholder-secondary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="Most Kills"
          active={sortBy === 'kills'}
          onClick={() => onSortChange('kills')}
        />
        {/* Alphabetical sort removed as requested */}
        {showKilledTodayFilter && (
          <FilterPill
            label={`Killed Today${counts?.killedToday !== undefined ? ` (${counts.killedToday})` : ''}`}
            active={sortBy === 'killedToday'}
            onClick={() => onSortChange('killedToday')}
          />
        )}
        <FilterPill
          label={`Never Killed${counts?.neverKilled !== undefined ? ` (${counts.neverKilled})` : ''}`}
          active={sortBy === 'neverKilled'}
          onClick={() => onSortChange('neverKilled')}
        />
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${active
        ? 'bg-surface-hover text-white border-primary/50 shadow-sm'
        : 'bg-surface text-secondary border-border hover:border-border/80 hover:text-white'
        }`}
    >
      {label}
    </button>
  );
}
