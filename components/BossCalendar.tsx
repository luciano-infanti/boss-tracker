'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WorldData, Boss } from '@/types';
import { getBossImage } from '@/utils/bossImages';

interface BossCalendarProps {
    worlds: WorldData;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    kills: Array<{
        bossName: string;
        world: string;
        timestamp: string;
    }>;
}

export default function BossCalendar({ worlds }: BossCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

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
        // Iterate through all worlds and bosses to find kills matching these dates
        Object.entries(worlds).forEach(([worldName, bosses]) => {
            bosses.forEach(boss => {
                if (!boss.history || boss.history === 'None') return;

                // Assuming history format is comma separated dates/timestamps
                // Example: "2023-10-27 14:30, 2023-10-25 09:15" or similar
                // We need to be robust here.
                const historyEntries = boss.history.split(',').map(s => s.trim());

                historyEntries.forEach(entry => {
                    // Try to parse date. 
                    // If entry is just a date "2023-10-27", it works.
                    // If it has time "2023-10-27 14:30", it works.
                    const killDate = new Date(entry);
                    if (isNaN(killDate.getTime())) return;

                    // Find matching day in our calendar grid
                    const day = days.find(d =>
                        d.date.getDate() === killDate.getDate() &&
                        d.date.getMonth() === killDate.getMonth() &&
                        d.date.getFullYear() === killDate.getFullYear()
                    );

                    if (day) {
                        day.kills.push({
                            bossName: boss.name,
                            world: worldName,
                            timestamp: entry
                        });
                    }
                });
            });
        });

        return days;
    }, [currentDate, worlds]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Boss Kill Calendar</h2>
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-full text-gray-300">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-semibold text-emerald-400 min-w-[140px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-full text-gray-300">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-700 border border-gray-700 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-800 p-2 text-center text-sm font-medium text-gray-400">
                        {day}
                    </div>
                ))}

                {calendarDays.map((day, idx) => (
                    <div
                        key={idx}
                        className={`bg-gray-800 min-h-[100px] p-2 transition-colors hover:bg-gray-750 ${!day.isCurrentMonth ? 'opacity-50 bg-gray-800/50' : ''
                            }`}
                    >
                        <div className="text-right text-sm text-gray-500 mb-2">{day.date.getDate()}</div>
                        <div className="flex flex-wrap gap-1">
                            {day.kills.map((kill, kIdx) => {
                                const bossImg = getBossImage(kill.bossName);
                                return (
                                    <div
                                        key={`${kill.bossName}-${kIdx}`}
                                        className="relative group cursor-help"
                                    >
                                        {bossImg ? (
                                            <img
                                                src={bossImg}
                                                alt={kill.bossName}
                                                className="w-8 h-8 object-contain rounded bg-gray-900/50 p-0.5 border border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-[10px] text-white">
                                                {kill.bossName.slice(0, 2)}
                                            </div>
                                        )}

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max max-w-[200px]">
                                            <div className="bg-gray-900 text-xs text-white p-2 rounded shadow-xl border border-gray-700">
                                                <div className="font-bold text-emerald-400">{kill.bossName}</div>
                                                <div className="text-gray-300">World: {kill.world}</div>
                                                <div className="text-gray-400 text-[10px]">{kill.timestamp}</div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
