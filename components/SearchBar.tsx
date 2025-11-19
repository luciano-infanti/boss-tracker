'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showKilledTodayFilter?: boolean;
}

export default function SearchBar({ value, onChange, sortBy, onSortChange, showKilledTodayFilter = false }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search bosses..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="Most Kills"
          active={sortBy === 'kills'}
          onClick={() => onSortChange('kills')}
        />
        <FilterPill
          label="Alphabetical"
          active={sortBy === 'name'}
          onClick={() => onSortChange('name')}
        />
        {showKilledTodayFilter && (
          <>
            <FilterPill
              label="Next Spawn"
              active={sortBy === 'nextSpawn'}
              onClick={() => onSortChange('nextSpawn')}
            />
            <FilterPill
              label="Killed Today"
              active={sortBy === 'killedToday'}
              onClick={() => onSortChange('killedToday')}
            />
          </>
        )}
        <FilterPill
          label="Never Killed"
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
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
        }`}
    >
      {label}
    </button>
  );
}
