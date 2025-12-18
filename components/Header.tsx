'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { ProductSwitcher } from './ProductSwitcher';

const WORLDS = [
    'Auroria',
    'Belaria',
    'Bellum',
    'Elysian',
    'Lunarian',
    'Mystian',
    'Solarian',
    'Spectrum',
    'Tenebrium',
    'Vesperia'
];

export default function Header() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const isWorldActive = (world: string) => pathname === `/world/${world}`;

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
        <header className="bg-surface border-b border-border sticky top-0 z-50">
            {/* Main Navigation Row */}
            <div className="border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left: Product Switcher & Nav */}
                    <div className="flex items-center gap-6">
                        {/* Product Switcher */}
                        <ProductSwitcher />

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                href="/stats"
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isActive('/stats')
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                                    }`}
                            >
                                <BarChart3 size={14} />
                                Estatísticas
                            </Link>
                            <Link
                                href="/upcoming"
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isActive('/upcoming')
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                                    }`}
                            >
                                <TrendingUp size={14} />
                                Próximos
                            </Link>
                            <Link
                                href="/today"
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isActive('/today')
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                                    }`}
                            >
                                <Clock size={14} />
                                Hoje
                            </Link>
                            <Link
                                href="/most-wanted"
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isActive('/most-wanted')
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                                    }`}
                            >
                                <Calendar size={14} />
                                Procurados
                            </Link>
                            <Link
                                href="/about"
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isActive('/about')
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                                    }`}
                            >
                                <Info size={14} />
                                Sobre
                            </Link>
                        </nav>
                    </div>

                </div>
            </div>

            {/* World Navigation Row */}
            <div className="bg-surface-hover/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
                        {WORLDS.map((world) => (
                            <Link
                                key={world}
                                href={`/world/${world}`}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${isWorldActive(world)
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-secondary hover:text-white hover:bg-surface-hover border border-transparent'
                                    }`}
                            >
                                <img
                                    src={getWorldIcon(world)}
                                    alt={world}
                                    className="w-4 h-4"
                                />
                                <span>{world}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
