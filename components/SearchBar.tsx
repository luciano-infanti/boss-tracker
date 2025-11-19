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
    <div className="flex gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search bosses..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="name">Alphabetical</option>
        <option value="nextSpawn">Next Spawn</option>
        <option value="kills">Most Kills</option>
        {showKilledTodayFilter && <option value="killedToday">Killed Today</option>}
      </select>
    </div>
  );
}
