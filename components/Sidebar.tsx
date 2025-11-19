'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Server, Calendar } from 'lucide-react';

const WORLDS = ['Auroria', 'Belaria', 'Bellum', 'Elysian', 'Lunarian', 'Mystian', 'Solarian', 'Spectrum', 'Tenebrium', 'Vesperia'];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-emerald-400 mb-2">RubinOT Tracker</h1>
        <p className="text-sm text-gray-400">Boss Kill Analytics</p>
      </div>

      <nav className="space-y-1">
        <Link
          href="/today"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/today' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <Calendar size={18} />
          Today's Kills
        </Link>

        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <Globe size={18} />
          Global Stats
        </Link>

        <div className="pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase px-3">Worlds</p>
        </div>

        {WORLDS.map((world) => (
          <Link
            key={world}
            href={`/world/${world}`}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === `/world/${world}` ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Server size={18} />
            {world}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
