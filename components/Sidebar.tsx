'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Server, Calendar, History } from 'lucide-react';

import { WORLDS } from '@/utils/constants';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 overflow-y-auto flex-1">
        <div className="mb-8 px-3">
          <h1 className="text-sm font-medium text-white tracking-wide uppercase opacity-80 mb-1">RubinOT Tracker</h1>
          <p className="text-xs text-secondary">Boss Analytics</p>
        </div>

        <nav className="space-y-0.5">
          <Link
            href="/today"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/today'
              ? 'bg-surface-hover text-white'
              : 'text-secondary hover:text-white hover:bg-surface-hover/50'
              }`}
          >
            <Calendar size={16} />
            Today's Kills
          </Link>

          <Link
            href="/stats"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/stats'
              ? 'bg-surface-hover text-white'
              : 'text-secondary hover:text-white hover:bg-surface-hover/50'
              }`}
          >
            <Globe size={16} />
            Global Stats
          </Link>

          <div className="pt-6 pb-2">
            <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider px-3">Worlds</p>
          </div>

          {WORLDS.map((world) => (
            <Link
              key={world}
              href={`/world/${world}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === `/world/${world}`
                ? 'bg-surface-hover text-white'
                : 'text-secondary hover:text-white hover:bg-surface-hover/50'
                }`}
            >
              <Server size={16} />
              {world}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-border">
        <Link
          href="/backups"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/backups'
            ? 'bg-surface-hover text-white'
            : 'text-secondary hover:text-white hover:bg-surface-hover/50'
            }`}
        >
          <History size={16} />
          Backups
        </Link>
      </div>
    </aside>
  );
}
