'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Calendar, Info, Home, Skull } from 'lucide-react';

import { WORLDS } from '@/utils/constants';
import { getWorldIcon } from '@/utils/worldIcons';
import { ProductSwitcher } from './ProductSwitcher';

export default function WorldSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Listen for toggle events from the Header hamburger
    useEffect(() => {
        const handler = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-sidebar', handler);
        return () => window.removeEventListener('toggle-sidebar', handler);
    }, []);

    // Close on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const isActive = (path: string) => pathname === path;
    const isWorldActive = (world: string) => pathname === `/world/${world}`;

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/stats', label: 'Estatísticas', icon: BarChart3 },
        { href: '/previsoes', label: 'Previsões', icon: TrendingUp },
        { href: '/most-wanted', label: 'Procurados', icon: Skull },
        { href: '/about', label: 'Sobre', icon: Info },
    ];

    return (
        <>
            {/* Desktop Sidebar — fixed full height */}
            <aside className={`
                hidden md:flex flex-col w-[260px]
                fixed top-0 bottom-0 left-0 z-30
                bg-surface/80 backdrop-blur-md border-r border-border
            `}>
                <div className="flex flex-col h-full">
                    {/* Product Switcher */}
                    <div className="px-3 py-3 border-b border-border/50">
                        <ProductSwitcher />
                    </div>

                    {/* Nav Links */}
                    <nav className="px-3 space-y-0.5 pt-3">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive(href)
                                    ? 'bg-purple-500/15 text-purple-400'
                                    : 'text-secondary hover:text-white hover:bg-surface-hover/60'
                                    }`}
                            >
                                <Icon size={15} className="flex-shrink-0" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Divider + Worlds */}
                    <div className="mt-5 px-3">
                        <div className="flex items-center gap-2 px-3 mb-2">
                            <span className="text-[10px] font-semibold text-secondary/70 uppercase tracking-widest">
                                Mundos
                            </span>
                            <span className="text-[10px] text-secondary/40 font-medium">
                                {WORLDS.length}
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide pb-4">
                        {WORLDS.map((world) => (
                            <Link
                                key={world}
                                href={`/world/${world}`}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${isWorldActive(world)
                                    ? 'bg-purple-500/15 text-purple-400'
                                    : 'text-secondary hover:text-white hover:bg-surface-hover/60'
                                    }`}
                            >
                                <img
                                    src={getWorldIcon(world)}
                                    alt={world}
                                    className="w-3.5 h-3.5 object-contain flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                                />
                                <span className="truncate">{world}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[260px]
                bg-surface border-r border-border
                flex flex-col md:hidden
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <img
                            src="/rubinot-logo.png"
                            alt="RubinOT"
                            className="h-7 w-auto rounded-full"
                        />
                        <span className="text-xs font-medium text-white/80">RubinOT Tracker</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-secondary hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Product Switcher */}
                    <div className="px-3 py-3 border-b border-border/50">
                        <ProductSwitcher />
                    </div>

                    {/* Nav Links */}
                    <nav className="px-3 space-y-0.5 pt-3">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive(href)
                                    ? 'bg-purple-500/15 text-purple-400'
                                    : 'text-secondary hover:text-white hover:bg-surface-hover/60'
                                    }`}
                            >
                                <Icon size={15} className="flex-shrink-0" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Divider + Worlds */}
                    <div className="mt-4 px-3">
                        <div className="flex items-center gap-2 px-3 mb-2">
                            <span className="text-[10px] font-semibold text-secondary/70 uppercase tracking-widest">
                                Mundos
                            </span>
                            <span className="text-[10px] text-secondary/40 font-medium">
                                {WORLDS.length}
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide pb-4">
                        {WORLDS.map((world) => (
                            <Link
                                key={world}
                                href={`/world/${world}`}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${isWorldActive(world)
                                    ? 'bg-purple-500/15 text-purple-400'
                                    : 'text-secondary hover:text-white hover:bg-surface-hover/60'
                                    }`}
                            >
                                <img
                                    src={getWorldIcon(world)}
                                    alt={world}
                                    className="w-3.5 h-3.5 object-contain flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                                />
                                <span className="truncate">{world}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
