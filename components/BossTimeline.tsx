'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossTimelineProps {
    minGap: number;
    maxGap: number;
    daysSince: number;
    status: 'COOLDOWN' | 'WINDOW_OPEN' | 'OVERDUE' | 'UNKNOWN';
}

/**
 * Minimal spawn timeline - VISUAL ONLY, no text.
 * Gray = cooldown, Green = window open, Red tick = overdue
 */
export default function BossTimeline({
    minGap,
    maxGap,
    daysSince,
    status
}: BossTimelineProps) {
    const [isHovered, setIsHovered] = useState(false);

    const visualMax = Math.max(maxGap * 1.3, daysSince + 1);

    const windowStart = (minGap / visualMax) * 100;
    const windowEnd = (maxGap / visualMax) * 100;
    const tickPos = Math.min(100, Math.max(0, (daysSince / visualMax) * 100));

    const tickColor = status === 'OVERDUE' ? 'bg-red-500' :
        status === 'WINDOW_OPEN' ? 'bg-emerald-500' : 'bg-white';

    // Calculate days until window closes (for tooltip)
    const daysUntilClose = maxGap - daysSince;
    const tooltipText = status === 'WINDOW_OPEN'
        ? `Fecha em ${daysUntilClose} dia${daysUntilClose !== 1 ? 's' : ''}`
        : status === 'OVERDUE'
            ? `Atrasado ${daysSince - maxGap} dia${(daysSince - maxGap) !== 1 ? 's' : ''}`
            : `Abre em ${minGap - daysSince} dia${(minGap - daysSince) !== 1 ? 's' : ''}`;

    return (
        <div
            className="relative h-1.5 w-full bg-surface-hover/50 rounded-full cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Window zone */}
            <div
                className={`absolute top-0 h-full rounded-full ${status === 'WINDOW_OPEN' ? 'bg-emerald-500/80' : 'bg-emerald-500/20'
                    }`}
                style={{ left: `${windowStart}%`, width: `${windowEnd - windowStart}%` }}
            />

            {/* Tick */}
            <motion.div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${tickColor} ring-1 ring-black/30`}
                initial={{ left: 0 }}
                animate={{ left: `${tickPos}%` }}
                transition={{ duration: 0.3 }}
            />

            {/* Hover Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 border border-white/10"
                    >
                        {tooltipText}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
