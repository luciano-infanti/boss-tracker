'use client';

import { useMemo } from 'react';
import { useData } from '@/context/DataContext';

interface ContributionDay {
    date: Date;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export default function ContributionGraph() {
    const { data } = useData();

    const { weeks, totalKills, dateRange } = useMemo(() => {
        const today = new Date();
        const endDate = today;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364); // Last 365 days

        // Create a map of date string -> kill count
        const killMap = new Map<string, number>();
        let total = 0;

        if (data.killDates) {
            data.killDates.forEach(boss => {
                boss.chronologicalHistory.forEach(kill => {
                    // kill.date is DD/MM/YYYY
                    const [day, month, year] = kill.date.split('/');
                    // Normalize date key to YYYY-MM-DD for easier comparison
                    const dateKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    const current = killMap.get(dateKey) || 0;
                    killMap.set(dateKey, current + kill.count);
                    total += kill.count;
                });
            });
        } else if (data.worlds) {
            // Fallback for direct world parsing if needed, but killDates should be populated
            Object.values(data.worlds).forEach(bosses => {
                bosses.forEach(boss => {
                    if (!boss.history || boss.history === 'None') return;
                    boss.history.split(',').forEach(entry => {
                        const match = entry.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*\((\d+)x\)$/);
                        if (match) {
                            const [_, d, m, y, c] = match;
                            const dateKey = `${y}-${m}-${d}`;
                            const count = parseInt(c);
                            const current = killMap.get(dateKey) || 0;
                            killMap.set(dateKey, current + count);
                            total += count;
                        }
                    })
                })
            })
        }

        // Generate days
        const days: ContributionDay[] = [];
        let currentDate = new Date(startDate);

        // Align start date to the previous Sunday to ensure grid starts correctly
        const dayOfWeek = currentDate.getDay(); // 0 = Sun
        currentDate.setDate(currentDate.getDate() - dayOfWeek);

        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const count = killMap.get(dateKey) || 0;

            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count > 0) level = 1;
            if (count >= 5) level = 2;
            if (count >= 10) level = 3;
            if (count >= 20) level = 4;

            days.push({
                date: new Date(currentDate),
                count,
                level
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Chunk into weeks
        const weeks: ContributionDay[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return {
            weeks,
            totalKills: total,
            dateRange: `${startDate.getFullYear()}`
        };
    }, [data]);

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-surface-hover';
            case 1: return 'bg-emerald-900/40 border-emerald-900/60';
            case 2: return 'bg-emerald-700/50 border-emerald-700/70';
            case 3: return 'bg-emerald-500/60 border-emerald-500/80';
            case 4: return 'bg-emerald-400 border-emerald-400';
            default: return 'bg-surface-hover';
        }
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-white">Kill History</h2>
                <span className="text-xs text-secondary">{totalKills} kills in the last year</span>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max">
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 mr-2 pt-[18px]">
                        <span className="text-[10px] text-secondary h-[10px] leading-[10px]">Mon</span>
                        <span className="text-[10px] text-secondary h-[10px] leading-[10px] mt-[13px]">Wed</span>
                        <span className="text-[10px] text-secondary h-[10px] leading-[10px] mt-[13px]">Fri</span>
                    </div>

                    {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                            {week.map((day, dIdx) => (
                                <div
                                    key={dIdx}
                                    className={`w-[10px] h-[10px] rounded-[2px] border border-transparent ${getLevelColor(day.level)} relative group`}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-max">
                                        <div className="bg-surface-hover text-[10px] text-white px-2 py-1 rounded shadow-xl border border-border whitespace-nowrap">
                                            <span className="font-medium text-emerald-400">{day.count} kills</span> on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 justify-end mt-4 text-[10px] text-secondary">
                <span>Less</span>
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(0)}`}></div>
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(1)}`}></div>
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(2)}`}></div>
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(3)}`}></div>
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(4)}`}></div>
                <span>More</span>
            </div>
        </div>
    );
}
