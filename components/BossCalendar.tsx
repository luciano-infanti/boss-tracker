'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { getBossImage } from '@/utils/bossImages';
import { getAdjustedKillCount } from '@/utils/soulpitUtils';
import { BossCategory, BOSS_CATEGORY_ICONS, getBossCategory } from '@/utils/bossCategories';
import FilterPill from './FilterPill';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    kills: Array<{
        bossName: string;
        world: string;
        timestamp: string;
    }>;
}

export default function BossCalendar({ worldName }: { worldName?: string }) {
    const { data } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categories: BossCategory[] = ['Archdemons', 'Rookgaard', 'Pits of Inferno', 'Creatures'];

    // Helper to get days in month
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: CalendarDay[] = [];

        // Add padding days from previous month
        const startPadding = firstDay.getDay();
        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false, kills: [] });
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true, kills: [] });
        }

        // Add padding days for next month
        const endPadding = 42 - days.length; // Ensure 6 rows
        for (let i = 1; i <= endPadding; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, kills: [] });
        }

        // Populate kills
        if (data.killDates) {
            data.killDates.forEach(bossHistory => {
                // Filter by category
                if (selectedCategories.length > 0) {
                    const category = getBossCategory(bossHistory.bossName);
                    if (!selectedCategories.includes(category)) return;
                }

                bossHistory.chronologicalHistory.forEach(kill => {
                    // Filter by world if worldName is provided
                    if (worldName && kill.world !== worldName) return;

                    // Apply Soulpit filtering
                    const adjustedCount = getAdjustedKillCount(bossHistory.bossName, kill.count);
                    if (adjustedCount === 0) return;

                    // kill.date is "DD/MM/YYYY"
                    const [dayStr, monthStr, yearStr] = kill.date.split('/');
                    const dayNum = parseInt(dayStr, 10);
                    const monthNum = parseInt(monthStr, 10) - 1;
                    const yearNum = parseInt(yearStr, 10);

                    const day = days.find(d =>
                        d.date.getDate() === dayNum &&
                        d.date.getMonth() === monthNum &&
                        d.date.getFullYear() === yearNum
                    );

                    if (day) {
                        for (let i = 0; i < adjustedCount; i++) {
                            day.kills.push({
                                bossName: bossHistory.bossName,
                                world: kill.world,
                                timestamp: kill.date
                            });
                        }
                    }
                });
            });
        } else if (data.worlds) {
            // Fallback
            Object.entries(data.worlds).forEach(([wName, bosses]) => {
                // Filter by world if worldName is provided
                if (worldName && wName !== worldName) return;

                bosses.forEach(boss => {
                    // Filter by category
                    if (selectedCategories.length > 0) {
                        const category = getBossCategory(boss.name);
                        if (!selectedCategories.includes(category)) return;
                    }

                    if (!boss.history || boss.history === 'None') return;
                    const historyEntries = boss.history.split(',').map(s => s.trim());
                    historyEntries.forEach(entry => {
                        const match = entry.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*\((\d+)x\)$/);
                        if (match) {
                            const [_, dayStr, monthStr, yearStr, countStr] = match;
                            const dayNum = parseInt(dayStr, 10);
                            const monthNum = parseInt(monthStr, 10) - 1;
                            const yearNum = parseInt(yearStr, 10);
                            const count = parseInt(countStr, 10);

                            // Apply Soulpit filtering
                            const adjustedCount = getAdjustedKillCount(boss.name, count);
                            if (adjustedCount === 0) return;

                            const day = days.find(d =>
                                d.date.getDate() === dayNum &&
                                d.date.getMonth() === monthNum &&
                                d.date.getFullYear() === yearNum
                            );

                            if (day) {
                                for (let i = 0; i < adjustedCount; i++) {
                                    day.kills.push({
                                        bossName: boss.name,
                                        world: wName,
                                        timestamp: `${dayStr}/${monthStr}/${yearStr}`
                                    });
                                }
                            }
                        }
                    });
                });
            });
        }

        // Merge Daily Data (if available)
        if (data.daily) {
            // Parse daily date: "DD/MM/YYYY" or similar format from dailyParser
            // dailyParser returns date as string, let's assume it matches the format we need or we parse it
            // Actually dailyParser extracts it from "RUBINOT DAILY UPDATE - 02/12/2025, 10:00" -> "02/12/2025"
            const [dayStr, monthStr, yearStr] = data.daily.date.split('/');
            const dayNum = parseInt(dayStr, 10);
            const monthNum = parseInt(monthStr, 10) - 1;
            const yearNum = parseInt(yearStr, 10);

            const day = days.find(d =>
                d.date.getDate() === dayNum &&
                d.date.getMonth() === monthNum &&
                d.date.getFullYear() === yearNum
            );

            if (day) {
                data.daily.kills.forEach(kill => {
                    // Filter by category
                    if (selectedCategories.length > 0) {
                        const category = getBossCategory(kill.bossName);
                        if (!selectedCategories.includes(category)) return;
                    }

                    kill.worlds.forEach(w => {
                        // Filter by world if worldName is provided
                        if (worldName && w.world !== worldName) return;

                        // Apply Soulpit filtering
                        const adjustedCount = getAdjustedKillCount(kill.bossName, w.count);
                        if (adjustedCount === 0) return;

                        // Check how many we already have for this boss/world in this day
                        const existingCount = day.kills.filter(k =>
                            k.bossName === kill.bossName &&
                            k.world === w.world
                        ).length;

                        // Add the difference if daily has more
                        if (adjustedCount > existingCount) {
                            const diff = adjustedCount - existingCount;
                            for (let i = 0; i < diff; i++) {
                                day.kills.push({
                                    bossName: kill.bossName,
                                    world: w.world,
                                    timestamp: data.daily!.date
                                });
                            }
                        }
                    });
                });
            }
        }

        return days;
    }, [currentDate, data, worldName, selectedCategories]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleCategoryClick = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-white">Boss Kill Calendar {worldName ? `(${worldName})` : ''}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-surface-hover rounded-md text-secondary hover:text-white transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-white min-w-[120px] text-center">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-surface-hover rounded-md text-secondary hover:text-white transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <FilterPill
                            key={cat}
                            label={cat}
                            active={selectedCategories.includes(cat)}
                            onClick={() => handleCategoryClick(cat)}
                            variant="secondary"
                            // @ts-ignore
                            icon={BOSS_CATEGORY_ICONS[cat]}
                        />
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border min-w-[600px]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-surface p-3 text-center text-[10px] font-medium text-secondary uppercase tracking-wider">
                            {day}
                        </div>
                    ))}

                    {calendarDays.map((day, idx) => {
                        const isToday = new Date().toDateString() === day.date.toDateString();

                        return (
                            <div
                                key={idx}
                                className={`bg-surface min-h-[100px] p-2 transition-colors hover:bg-surface-hover/50 
                                ${!day.isCurrentMonth ? 'opacity-30 bg-surface/50' : ''}
                                ${isToday ? 'bg-white/5 ring-1 ring-white/10' : ''}
                            `}
                            >
                                <div className={`text-right text-xs mb-2 font-medium ${isToday ? 'text-primary' : 'text-secondary'}`}>
                                    {day.date.getDate()}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {/* Group kills by boss name */}
                                    {(() => {
                                        const groupedKills: { [key: string]: { count: number, world: string, timestamp: string } } = {};
                                        day.kills.forEach(kill => {
                                            if (!groupedKills[kill.bossName]) {
                                                groupedKills[kill.bossName] = { count: 0, world: kill.world, timestamp: kill.timestamp };
                                            }
                                            groupedKills[kill.bossName].count++;
                                        });

                                        return Object.entries(groupedKills).map(([bossName, info]) => {
                                            const bossImg = getBossImage(bossName);
                                            return (
                                                <div
                                                    key={bossName}
                                                    className="relative group cursor-help"
                                                >
                                                    {bossImg ? (
                                                        <img
                                                            src={bossImg}
                                                            alt={bossName}
                                                            className="w-10 h-10 object-contain rounded bg-surface-hover p-0.5 border border-border/50 transition-transform hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-surface-hover rounded flex items-center justify-center text-[8px] text-secondary border border-border/50">
                                                            {bossName.slice(0, 2)}
                                                        </div>
                                                    )}

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max max-w-[200px]">
                                                        <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
                                                            <div className="font-medium text-white">
                                                                {bossName} {info.count > 1 ? `(${info.count} kills)` : ''}
                                                            </div>
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-hover"></div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
