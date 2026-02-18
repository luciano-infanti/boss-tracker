'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BossCard from '@/components/BossCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import GlobalStats from '@/components/GlobalStats';
import Loading from '@/components/Loading';
import PageTransition from '@/components/PageTransition';
import { getBossCategory, isHiddenByDefault } from '@/utils/bossCategories';
import NoResults from '@/components/NoResults';
import { motion } from 'framer-motion';

export default function GlobalPageClient() {
    const { data, isLoading } = useData();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('kills');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Calculate aggregated stats from all worlds
    const aggregatedStats = useMemo(() => {
        const stats = new Map<string, number>();
        const allBosses = new Set<string>();

        // Initialize with combined data to get all boss names
        data.combined.forEach(b => {
            allBosses.add(b.name);
            stats.set(b.name, 0);
        });

        // Sum kills from all worlds
        Object.values(data.worlds).forEach(worldBosses => {
            worldBosses.forEach(wb => {
                allBosses.add(wb.name);
                const current = stats.get(wb.name) || 0;
                stats.set(wb.name, current + (wb.totalKills || 0));
            });
        });

        return { stats, allBosses };
    }, [data.worlds, data.combined]);

    const counts = useMemo(() => {
        if (!data.combined) return {};

        let neverKilledCount = 0;
        aggregatedStats.allBosses.forEach(name => {
            if ((aggregatedStats.stats.get(name) || 0) === 0) {
                neverKilledCount++;
            }
        });

        return {
            neverKilled: neverKilledCount
        };
    }, [data.combined, aggregatedStats]);

    const filtered = useMemo(() => {
        let bosses = [...data.combined];

        // If searching, filter first
        if (search) {
            bosses = bosses.filter(b =>
                b.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by Category
        if (selectedCategories.length > 0) {
            bosses = bosses.filter(b => {
                const category = getBossCategory(b.name);
                return selectedCategories.includes(category);
            });
        } else {
            bosses = bosses.filter(b => !isHiddenByDefault(b.name));
        }

        if (sortBy === 'kills') {
            bosses.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
        } else if (sortBy === 'neverKilled') {
            // Filter using the aggregated stats
            bosses = bosses.filter(b => (aggregatedStats.stats.get(b.name) || 0) === 0);
            bosses.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Default fallback
            bosses.sort((a, b) => a.name.localeCompare(b.name));
        }

        return bosses;
    }, [data.combined, search, sortBy, selectedCategories, aggregatedStats]);

    if (isLoading) {
        return <Loading />;
    }

    if (!data.combined || data.combined.length === 0) {
        return <EmptyState />;
    }

    return (
        <PageTransition>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Estatísticas Globais</h1>
                <p className="text-secondary">Estatísticas agregadas de todos os mundos</p>
            </div>
            <GlobalStats
                bosses={data.combined.map(b => ({
                    ...b,
                    totalKills: aggregatedStats.stats.get(b.name) || 0
                }))}
                worlds={data.worlds}
            />
            <SearchBar
                value={search}
                onChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                counts={counts}
                showMostKills={false}
                showNeverKilled={false}
            />
            <div className="min-h-screen">
                {filtered.length === 0 ? (
                    <NoResults message={
                        search ? `Nenhum boss encontrado para "${search}"` :
                            selectedCategories.length > 0 ? `Nenhum boss encontrado nas categorias selecionadas` :
                                "Nenhum boss encontrado"
                    } />
                ) : (
                    <div className="space-y-8">
                        {/* Bosses Section */}
                        {filtered.filter(boss => getBossCategory(boss.name) !== 'Criaturas').length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered
                                    .filter(boss => getBossCategory(boss.name) !== 'Criaturas')
                                    .map((boss) => (
                                        <motion.div
                                            key={boss.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                        >
                                            <BossCard boss={boss} type="combined" showNextSpawn={false} viewMode="grid" />
                                        </motion.div>
                                    ))}
                            </div>
                        )}

                        {/* Divider */}
                        {filtered.some(boss => getBossCategory(boss.name) !== 'Criaturas') &&
                            filtered.some(boss => getBossCategory(boss.name) === 'Criaturas') && (
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-border border-dashed"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background px-3 text-sm font-medium text-secondary uppercase tracking-wider">Criaturas</span>
                                    </div>
                                </div>
                            )}

                        {/* Creatures Section */}
                        {filtered.filter(boss => getBossCategory(boss.name) === 'Criaturas').length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered
                                    .filter(boss => getBossCategory(boss.name) === 'Criaturas')
                                    .map((boss) => (
                                        <motion.div
                                            key={boss.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                        >
                                            <BossCard boss={boss} type="combined" showNextSpawn={false} viewMode="grid" />
                                        </motion.div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
