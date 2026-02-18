'use client';

import { useData } from '@/context/DataContext';
import { formatNumber } from '@/utils/formatNumber';
import { Trophy, Server, Calendar } from 'lucide-react';
import BossCard from '@/components/BossCard';
import Loading from '@/components/Loading';
import PageTransition from '@/components/PageTransition';

import { getAdjustedKillCount } from '@/utils/soulpitUtils';
import { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { getBossCategory, isHiddenByDefault } from '@/utils/bossCategories';
import NoResults from '@/components/NoResults';
import { motion } from 'framer-motion';

import { getWorldIcon } from '@/utils/worldIcons';

export default function HomePageClient() {
    const { data, isLoading } = useData();
    const daily = data.daily;
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    // We don't really sort here (it's fixed logic), but SearchBar needs these props
    const [sortBy, setSortBy] = useState('kills');

    // Calculate Most Active Boss (purely by kill count, ignoring "New" status)
    const mostActiveBoss = useMemo(() => {
        if (!data.daily?.kills || data.daily.kills.length === 0) return null;
        // Sort purely by totalKills descending
        return [...data.daily.kills].sort((a, b) => b.totalKills - a.totalKills)[0];
    }, [data.daily]);

    // Calculate Most Active Server
    const mostActiveServer = useMemo(() => {
        if (!data.daily?.kills) return null;

        const serverKills: Record<string, number> = {};

        data.daily.kills.forEach(kill => {
            kill.worlds.forEach(w => {
                serverKills[w.world] = (serverKills[w.world] || 0) + w.count;
            });
        });

        const sortedServers = Object.entries(serverKills)
            .sort(([, a], [, b]) => b - a);

        if (sortedServers.length === 0) return null;

        return {
            name: sortedServers[0][0],
            count: sortedServers[0][1]
        };
    }, [data.daily]);

    const sortedKills = [...(data.daily?.kills || [])]
        .filter((kill) => {
            // 1. Search Filter
            if (search && !kill.bossName.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }

            // 2. Category Filter
            if (selectedCategories.length > 0) {
                const category = getBossCategory(kill.bossName);
                if (!selectedCategories.includes(category)) {
                    return false;
                }
            } else if (isHiddenByDefault(kill.bossName)) {
                return false;
            }

            // 3. Soulpit Filter
            return getAdjustedKillCount(kill.bossName, kill.totalKills) > 0;
        })
        .sort((a, b) => {
            // Check for "New" (First kill ever globally)
            const getIsNew = (bossName: string, killsToday: number) => {
                const globalBoss = data.combined.find(b => b.name === bossName);
                if (!globalBoss) return false;
                // If global total kills == kills today, it's new
                return globalBoss.totalKills === killsToday;
            };

            const aNew = getIsNew(a.bossName, a.totalKills) ? 1 : 0;
            const bNew = getIsNew(b.bossName, b.totalKills) ? 1 : 0;

            if (aNew !== bNew) return bNew - aNew;

            return b.totalKills - a.totalKills;
        });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <PageTransition>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                    {daily ? `Mortes de ${daily.date}` : 'Mortes de Hoje'}
                </h1>
            </div>

            {!daily ? (
                <div className="bg-surface-hover rounded-lg p-12 text-center border border-border border-dashed">
                    <p className="text-secondary">Nenhum dado diário disponível. Envie um arquivo daily-stats.txt.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-surface border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="text-yellow-400/80" size={18} />
                                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Total de Mortes</p>
                            </div>
                            <p className="text-3xl font-semibold text-white">{formatNumber(daily.totalKills)}</p>
                        </div>

                        <div className="bg-surface border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="text-emerald-400" size={18} />
                                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Bosses Únicos</p>
                            </div>
                            <p className="text-3xl font-semibold text-white">{formatNumber(daily.uniqueBosses)}</p>
                        </div>

                        <div className="bg-surface border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="text-primary" size={18} />
                                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Boss Mais Ativo</p>
                            </div>
                            <p className="text-xl font-medium text-white truncate">
                                {mostActiveBoss?.bossName || '-'}
                            </p>
                        </div>

                        <div className="bg-surface border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                {mostActiveServer && (
                                    <img
                                        src={getWorldIcon(mostActiveServer.name)}
                                        alt="World"
                                        className="w-4 h-4 object-contain opacity-80"
                                    />
                                )}
                                <p className="text-secondary text-xs font-medium uppercase tracking-wide">Top Servidor</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-medium text-white truncate">
                                    {mostActiveServer?.name || '-'}
                                </p>
                                {mostActiveServer && (
                                    <span className="text-xs text-emerald-400">
                                        {formatNumber(mostActiveServer.count)} mortes
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        selectedCategories={selectedCategories}
                        onCategoryChange={setSelectedCategories}
                        showMostKills={false}
                        showNeverKilled={false}
                    />

                    <div className="min-h-screen">
                        {sortedKills.length === 0 ? (
                            <NoResults message={
                                search ? `Nenhum boss encontrado para "${search}"` :
                                    selectedCategories.length > 0 ? `Nenhum boss encontrado nas categorias selecionadas` :
                                        "Nenhum boss morto hoje com os filtros atuais"
                            } />
                        ) : (
                            <div className="space-y-8">
                                {/* Bosses Section */}
                                {sortedKills.filter(kill => getBossCategory(kill.bossName) !== 'Criaturas').length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {sortedKills
                                            .filter(kill => getBossCategory(kill.bossName) !== 'Criaturas')
                                            .map((kill) => {
                                                const boss = data.combined.find(b => b.name === kill.bossName) || {
                                                    name: kill.bossName,
                                                    totalKills: kill.totalKills,
                                                    totalSpawnDays: 0,
                                                    appearsInWorlds: 0,
                                                    typicalSpawnFrequency: 'N/A',
                                                    perWorldStats: []
                                                };

                                                const isNew = boss.totalKills === kill.totalKills;

                                                return (
                                                    <motion.div
                                                        key={kill.bossName}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                                    >
                                                        <BossCard
                                                            boss={boss}
                                                            type="combined"
                                                            isKilledToday={true}
                                                            isNew={isNew}
                                                            dailyKill={kill}
                                                            viewMode="grid"
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                    </div>
                                )}

                                {/* Divider if both exist */}
                                {sortedKills.some(kill => getBossCategory(kill.bossName) !== 'Criaturas') &&
                                    sortedKills.some(kill => getBossCategory(kill.bossName) === 'Criaturas') && (
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
                                {sortedKills.filter(kill => getBossCategory(kill.bossName) === 'Criaturas').length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {sortedKills
                                            .filter(kill => getBossCategory(kill.bossName) === 'Criaturas')
                                            .map((kill) => {
                                                const boss = data.combined.find(b => b.name === kill.bossName) || {
                                                    name: kill.bossName,
                                                    totalKills: kill.totalKills,
                                                    totalSpawnDays: 0,
                                                    appearsInWorlds: 0,
                                                    typicalSpawnFrequency: 'N/A',
                                                    perWorldStats: []
                                                };

                                                const isNew = boss.totalKills === kill.totalKills;

                                                return (
                                                    <motion.div
                                                        key={kill.bossName}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                                    >
                                                        <BossCard
                                                            boss={boss}
                                                            type="combined"
                                                            isKilledToday={true}
                                                            isNew={isNew}
                                                            dailyKill={kill}
                                                            viewMode="grid"
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageTransition>
    );
}
