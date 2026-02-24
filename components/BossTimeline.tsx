'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossTimelineProps {
    minGap: number;
    maxGap: number;
    daysSince: number;
    status: 'COOLDOWN' | 'WINDOW_OPEN' | 'OVERDUE' | 'UNKNOWN';
    tightMinGap?: number;
    tightMaxGap?: number;
}

/**
 * Minimal spawn timeline - VISUAL ONLY, no text.
 * Dark green = outer window, Bright green = IQR inner window, White dot = current day
 */
export default function BossTimeline({
    minGap,
    maxGap,
    daysSince,
    status,
    tightMinGap,
    tightMaxGap
}: BossTimelineProps) {
    const [isHovered, setIsHovered] = useState(false);

    const visualMax = Math.max(maxGap * 1.3, daysSince + 1);

    const windowStart = (minGap / visualMax) * 100;
    const windowEnd = (maxGap / visualMax) * 100;
    const tickPos = Math.min(100, Math.max(0, (daysSince / visualMax) * 100));

    // IQR inner window positions
    const hasTightWindow = tightMinGap !== undefined && tightMaxGap !== undefined
        && tightMinGap !== tightMaxGap
        && (tightMinGap !== minGap || tightMaxGap !== maxGap);
    const tightStart = hasTightWindow ? (tightMinGap! / visualMax) * 100 : 0;
    const tightEnd = hasTightWindow ? (tightMaxGap! / visualMax) * 100 : 0;

    // Tooltip text
    const daysUntilClose = maxGap - daysSince;
    const tooltipText = status === 'WINDOW_OPEN'
        ? `Fecha em ${daysUntilClose} dia${daysUntilClose !== 1 ? 's' : ''}`
        : status === 'OVERDUE'
            ? `Atrasado ${daysSince - maxGap} dia${(daysSince - maxGap) !== 1 ? 's' : ''}`
            : `Abre em ${minGap - daysSince} dia${(minGap - daysSince) !== 1 ? 's' : ''}`;

    return (
        <div
            className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Outer window zone */}
            <div
                className={`absolute top-0 h-full rounded-full ${status === 'WINDOW_OPEN' ? 'bg-emerald-700/60' : 'bg-emerald-800/40'
                    }`}
                style={{ left: `${windowStart}%`, width: `${windowEnd - windowStart}%` }}
            />

            {/* IQR inner window zone (P25–P75) */}
            {hasTightWindow && (
                <div
                    className={`absolute top-0 h-full rounded-full ${status === 'WINDOW_OPEN'
                            ? 'bg-emerald-400/90'
                            : 'bg-emerald-400/50'
                        }`}
                    style={{ left: `${tightStart}%`, width: `${tightEnd - tightStart}%` }}
                />
            )}

            {/* Tick — always white */}
            <motion.div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white ring-1 ring-black/30"
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
