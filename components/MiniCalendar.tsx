'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface KillEntry {
    date: string;
    world: string;
    count: number;
    timestamp: number;
}

interface MiniCalendarProps {
    allKillsByDate: KillEntry[];
    availableServers?: string[];
    worldName?: string;
    /** If true, shows a larger variant suitable for a full page */
    large?: boolean;
}

export default function MiniCalendar({
    allKillsByDate,
    availableServers = [],
    worldName,
    large = false
}: MiniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedServer, setSelectedServer] = useState<string>(worldName || 'all');

    useEffect(() => {
        if (worldName) setSelectedServer(worldName);
    }, [worldName]);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentYear, currentMonth + offset, 1));
    };

    // Map kills to days
    const killsOnDay: Record<number, { world: string; count: number }[]> = {};

    allKillsByDate.forEach(kill => {
        const [day, month, year] = kill.date.split('/').map(Number);
        if (month === currentMonth + 1 && year === currentYear) {
            if (selectedServer === 'all' || kill.world === selectedServer) {
                if (!killsOnDay[day]) killsOnDay[day] = [];
                killsOnDay[day].push({ world: kill.world, count: kill.count });
            }
        }
    });

    return (
        <div className={`bg-surface-hover/20 rounded-lg border border-border/50 ${large ? 'p-4' : 'p-3'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1 hover:bg-surface-hover rounded text-secondary hover:text-white transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <h4 className={`${large ? 'text-base' : 'text-sm'} font-medium text-white min-w-[100px] text-center`}>
                        {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1 hover:bg-surface-hover rounded text-secondary hover:text-white transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Server Filter */}
                {availableServers.length > 0 && !worldName && (
                    <select
                        value={selectedServer}
                        onChange={(e) => setSelectedServer(e.target.value)}
                        className="bg-surface border border-border rounded text-xs text-secondary px-2 py-1 focus:outline-none focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                        <option value="all">Todos os Servidores</option>
                        {availableServers.map(server => (
                            <option key={server} value={server}>{server}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className={`grid grid-cols-7 ${large ? 'gap-1.5' : 'gap-1'} text-center`}>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className={`${large ? 'text-xs' : 'text-[10px]'} text-secondary font-medium aspect-square flex items-center justify-center`}>{d}</div>
                ))}
                {padding.map(p => <div key={`pad-${p}`} className="aspect-square" />)}
                {days.map(day => {
                    const kills = killsOnDay[day];
                    const hasKill = kills && kills.length > 0;

                    return (
                        <div key={day} className="relative group">
                            <div className={`
                                aspect-square flex items-center justify-center rounded ${large ? 'text-sm' : 'text-xs'} transition-colors
                                ${hasKill
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-help'
                                    : 'text-secondary/50 hover:bg-surface-hover'
                                }
                            `}>
                                {hasKill ? <Check size={large ? 14 : 12} strokeWidth={3} /> : day}
                            </div>

                            {hasKill && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-max max-w-[200px]">
                                    <div className="bg-surface-hover text-xs text-white px-2 py-1.5 rounded shadow-xl border border-border">
                                        <div className="font-medium mb-1 border-b border-white/10 pb-1">
                                            {day}/{currentMonth + 1}/{currentYear}
                                        </div>
                                        <div className="space-y-0.5">
                                            {kills.map((k, i) => (
                                                <div key={i} className="flex items-center justify-between gap-3 text-[10px]">
                                                    <span className="text-secondary">{k.world}</span>
                                                    {k.count > 1 && <span className="text-emerald-400">x{k.count}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-hover"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
