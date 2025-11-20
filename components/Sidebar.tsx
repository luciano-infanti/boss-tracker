'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Server, Calendar, History, Menu, X, Calculator } from 'lucide-react';
import { useState } from 'react';

import { WORLDS } from '@/utils/constants';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">RubinOT Tracker</h1>
        </div>
        <button onClick={toggleMenu} className="text-secondary hover:text-white p-1">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-8 px-3 flex justify-between items-center">
            <div>
              <h1 className="text-sm font-medium text-white tracking-wide uppercase opacity-80 mb-1">RubinOT Tracker</h1>
              <p className="text-xs text-secondary">Boss Analytics</p>
            </div>
            {/* Close button for mobile only */}
            <button onClick={toggleMenu} className="md:hidden text-secondary hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-0.5">
            <Link
              href="/today"
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
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
            href="/about"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/about'
              ? 'bg-surface-hover text-white'
              : 'text-secondary hover:text-white hover:bg-surface-hover/50'
              }`}
          >
            <Calculator size={16} />
            Just About
          </Link>
          <Link
            href="/backups"
            onClick={() => setIsOpen(false)}
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

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
