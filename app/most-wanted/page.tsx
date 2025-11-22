'use client';

import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import { Skull, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function MostWantedPage() {
    const { data, isLoading } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const neverKilledBosses = useMemo(() => {
        if (!data.worlds || Object.keys(data.worlds).length === 0) return [];

        const bossKills = new Map<string, number>();
        const bossDetails = new Map<string, any>();

        // Iterate through all worlds to sum up kills
        Object.values(data.worlds).forEach(worldBosses => {
            worldBosses.forEach(boss => {
                const currentKills = bossKills.get(boss.name) || 0;
                bossKills.set(boss.name, currentKills + boss.totalKills);

                // Store boss details if not already stored (for display)
                if (!bossDetails.has(boss.name)) {
                    bossDetails.set(boss.name, boss);
                }
            });
        });

        // Filter for bosses with 0 total kills
        return Array.from(bossKills.entries())
            .filter(([_, totalKills]) => totalKills === 0)
            .map(([name, _]) => bossDetails.get(name))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [data.worlds]);

    const filteredBosses = useMemo(() => {
        return neverKilledBosses.filter(boss =>
            boss.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [neverKilledBosses, searchTerm]);

    if (isLoading) {
        return <div className="p-8 text-center text-secondary">Loading data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-red-900/20 p-6 rounded-lg border border-red-900/50">
                <div>
                    <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3">
                        <Skull size={32} />
                        MOST WANTED
                    </h1>
                    <p className="text-red-200/70 mt-1">
                        These bosses have <span className="font-bold text-red-400">NEVER</span> been killed on any server.
                        Be the first to claim the bounty!
                    </p>
                </div>
                <div className="bg-red-950/50 px-4 py-2 rounded-lg border border-red-900/30">
                    <span className="text-2xl font-mono font-bold text-red-500">{neverKilledBosses.length}</span>
                    <span className="text-xs text-red-400 uppercase ml-2 tracking-wider">Targets Remaining</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input
                    type="text"
                    placeholder="Search targets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white placeholder-secondary focus:outline-none focus:border-red-500/50 transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBosses.map((boss) => (
                    <div key={boss.name} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900 to-red-600 rounded-lg opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <BossCard
                            boss={boss}
                            type="combined"
                            isKilledToday={false}
                            isNew={false}
                        />
                        {/* Wanted Stamp */}
                        <div className="absolute top-4 right-4 rotate-12 border-4 border-red-500/30 text-red-500/30 font-black text-xl px-2 py-1 rounded opacity-50 pointer-events-none select-none">
                            WANTED
                        </div>
                    </div>
                ))}
            </div>

            {filteredBosses.length === 0 && (
                <div className="text-center py-12 text-secondary">
                    <p>No targets found matching your search.</p>
                </div>
            )}
        </div>
    );
}
