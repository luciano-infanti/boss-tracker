'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBossImage } from '@/utils/bossImages';
import { BossCategory, BOSS_CATEGORY_ICONS, getBossCategory, ALL_FILTER_CATEGORIES, isHiddenByDefault } from '@/utils/bossCategories';
import FilterPill from './FilterPill';
import { Prediction } from '@/utils/spawnLogic';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    predictions: Prediction[];
}

interface UpcomingBossCalendarProps {
    predictions: Prediction[];
    worldName?: string;
}

export default function UpcomingBossCalendar({ predictions, worldName }: UpcomingBossCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categories = ALL_FILTER_CATEGORIES;

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
            days.push({ date, isCurrentMonth: false, predictions: [] });
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true, predictions: [] });
        }

        // Add padding days for next month
        const endPadding = 42 - days.length; // Ensure 6 rows
        for (let i = 1; i <= endPadding; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, predictions: [] });
        }

        // Populate predictions
        predictions.forEach(pred => {
            // Filter by category
            if (selectedCategories.length > 0) {
                const category = getBossCategory(pred.bossName);
                if (!selectedCategories.includes(category)) return;
            } else if (isHiddenByDefault(pred.bossName)) {
                return;
            }

            // Use nextMinSpawn as the primary date for the calendar
            const pDate = pred.nextMinSpawn;

            const day = days.find(d =>
                d.date.getDate() === pDate.getDate() &&
                d.date.getMonth() === pDate.getMonth() &&
                d.date.getFullYear() === pDate.getFullYear()
            );

            if (day) {
                day.predictions.push(pred);
            }
        });

        return days;
    }, [currentDate, predictions, selectedCategories]);

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
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-white">
                        Spawns Previstos {worldName ? `(${worldName})` : '(Todos os Servidores)'}
                    </h2>
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
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
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
                                    {day.predictions.map((pred, i) => {
                                        const bossImg = getBossImage(pred.bossName);
                                        // Create a unique key combining boss and world
                                        const key = `${pred.bossName}-${pred.world}-${i}`;
                                        const isOverdue = pred.status === 'OVERDUE';

                                        return (
                                            <div
                                                key={key}
                                                className="relative group cursor-help"
                                            >
                                                {bossImg ? (
                                                    <img
                                                        src={bossImg}
                                                        alt={pred.bossName}
                                                        className={`w-10 h-10 object-contain rounded p-0.5 border transition-transform hover:scale-110
                                                            ${isOverdue ? 'bg-red-500/20 border-red-500/30' : 'bg-surface-hover border-border/50'}
                                                        `}
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded flex items-center justify-center text-[8px] text-secondary border
                                                        ${isOverdue ? 'bg-red-500/20 border-red-500/30' : 'bg-surface-hover border-border/50'}
                                                    `}>
                                                        {pred.bossName.slice(0, 2)}
                                                    </div>
                                                )}

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max max-w-[200px]">
                                                    <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
                                                        <div className="font-medium text-white">
                                                            {pred.bossName}
                                                        </div>
                                                        <div className="text-[10px] text-secondary">
                                                            {pred.world}
                                                        </div>
                                                        <div className="text-[10px] text-secondary mt-1">
                                                            Intervalo Médio: {pred.stats?.avgGap ?? '?'} dias
                                                        </div>
                                                        <div className={`text-[10px] font-bold mt-1 ${pred.confidenceLabel === 'High' ? 'text-emerald-400' :
                                                            pred.confidenceLabel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>
                                                            Confiança: {pred.confidenceLabel}
                                                        </div>
                                                        {isOverdue && (
                                                            <div className="text-[10px] text-red-400 font-bold mt-1">
                                                                ATRASADO
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-hover"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
