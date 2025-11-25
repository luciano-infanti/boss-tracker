'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Server, Calendar, History, Menu, X, Calculator, Skull, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { WORLDS } from '@/utils/constants';
import UploadButton from './UploadButton';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getWorldIcon = (worldName: string) => {
    if (['Auroria', 'Belaria'].includes(worldName)) {
      return 'https://wiki.rubinot.com/icons/open-pvp.gif';
    }
    if (['Bellum', 'Tenebrium', 'Spectrum'].includes(worldName)) {
      return 'https://wiki.rubinot.com/icons/retro-open-pvp.gif';
    }
    return 'https://wiki.rubinot.com/icons/optional-pvp.gif';
  };

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
          <div className="mb-8 flex justify-between items-center">
            <div className="mb-8  flex items-center gap-3">
              <img
                src="/rubinot-logo.png"
                alt="RubinOT Boss Tracker"
                className="h-9 w-auto rounded-full"
              />
              <h1 className="text-xs font-medium text-white tracking-wide opacity-80">RubinOT Boss Tracker</h1>
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

            <Link
              href="/most-wanted"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/most-wanted'
                ? 'bg-surface-hover text-white'
                : 'text-secondary hover:text-white hover:bg-surface-hover/50'
                }`}
            >
              <Skull size={16} />
              Most Wanted
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
                <img
                  src={getWorldIcon(world)}
                  alt={`${world} PvP Type`}
                  className="w-3 h-3 object-contain"
                />
                {world}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border space-y-2">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/admin'
              ? 'bg-surface-hover text-white'
              : 'text-secondary hover:text-white hover:bg-surface-hover/50'
              }`}
          >
            <img
              src="https://www.tibiawiki.com.br/images/0/01/Chayenne%27s_Magical_Key.gif"
              alt="Admin"
              className="w-4 h-4 object-contain"
            />
            Admin
          </Link>

          <Link
            href="/feedback"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/feedback'
              ? 'bg-surface-hover text-white'
              : 'text-secondary hover:text-white hover:bg-surface-hover/50'
              }`}
          >
            <MessageSquare size={16} />
            Feedback
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${pathname === '/about'
              ? 'bg-surface-hover text-white'
              : 'text-secondary hover:text-white hover:bg-surface-hover/50'
              }`}
          >
            <Calculator size={16} />
            About
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
