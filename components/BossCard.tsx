'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import { Clock, Calendar, Trophy } from 'lucide-react';
import { calculateAdjustedTotalKills } from '@/utils/soulpitUtils';

import { DailyKill } from '@/types';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
  isKilledToday?: boolean;
  isNew?: boolean;
  dailyKill?: DailyKill;
  worldName?: string;
}

import { useData } from '@/context/DataContext';


import BossDetailsDrawer from './BossDetailsDrawer';

export default function BossCard({ boss, type = 'world', isKilledToday, isNew, dailyKill, worldName, showNextSpawn = true }: BossCardProps & { showNextSpawn?: boolean }) {
  const { data } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const bossImage = getBossImage(boss.name);



  // Determine if boss has 0 kills (grayscale)
  const totalKills = calculateAdjustedTotalKills(boss);
  const isZeroKills = totalKills === 0;

  // Calculate today's kills for display
  const todayKills = useMemo(() => {
    if (!dailyKill) return 0;
    if (type === 'world' && worldName) {
      return dailyKill.worlds.find(w => w.world === worldName)?.count || 0;
    }
    return dailyKill.totalKills;
  }, [dailyKill, type, worldName]);

  const handleCardClick = () => {
    setIsDrawerOpen(true);
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Only show tooltip on World pages
    if (type !== 'world') return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 1000); // 1 seconds delay
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

  const lastSeenText = useMemo(() => {
    let latestDate: Date | null = null;
    let dateStr = 'lastKillDate' in boss ? boss.lastKillDate : undefined;

    // 1. Try to parse from history first (most accurate)
    if ('history' in boss && boss.history && boss.history !== 'None') {
      const entries = boss.history.split(',').map(s => s.trim());
      entries.forEach(entry => {
        const match = entry.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
          const [_, day, month, year] = match;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!latestDate || date > latestDate) {
            latestDate = date;
            dateStr = `${day}/${month}/${year}`;
          }
        }
      });
    }

    // 2. Fallback to lastKillDate if history parsing failed or yielded nothing
    if (!latestDate && dateStr && dateStr !== 'Never') {
      const [day, month, year] = dateStr.split('/').map(Number);
      latestDate = new Date(year, month - 1, day);
    }

    if (!latestDate || !dateStr || dateStr === 'Never') {
      return 'Last seen: Never';
    }

    if (!latestDate || !dateStr || dateStr === 'Never') {
      return 'Last seen: Never';
    }

    const now = new Date();
    // Normalize to midnight for accurate day difference
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastSeen = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());

    const diffTime = Math.abs(today.getTime() - lastSeen.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `Last time seen ${dateStr} (${diffDays} days ago)`;
  }, [boss]);

  // Check if next spawn is overdue
  const nextSpawnInfo = useMemo(() => {
    if (!('nextExpectedSpawn' in boss) || !boss.nextExpectedSpawn || boss.nextExpectedSpawn === 'N/A') {
      return null;
    }

    const [day, month, year] = boss.nextExpectedSpawn.split('/').map(Number);
    const expectedDate = new Date(year, month - 1, day);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if date is strictly before today
    const isOverdue = expectedDate < today;

    return {
      date: boss.nextExpectedSpawn,
      isOverdue
    };
  }, [boss]);

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative rounded-lg p-5 border transition-all cursor-pointer group hover:bg-surface-hover
          ${isKilledToday
            ? 'bg-surface border-border'
            : 'bg-surface border-border'
          }
          ${isZeroKills ? 'opacity-80' : ''}
        `}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && lastSeenText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
              transition={{ duration: 0.2 }}
              className="absolute -top-10 left-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 border border-white/10 shadow-xl pointer-events-none"
            >
              {lastSeenText}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/10"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ... (keep existing card content) ... */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          {/* Today Tag - Hide on Today's Kills page (combined view) */}
          {isKilledToday && type !== 'combined' && (
            <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              TODAY
            </div>
          )}

          {/* New Tag */}
          {isNew && (
            <div className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/30">
              NEW
            </div>
          )}
        </div>

        <div className="flex items-start gap-6">
          {/* Image Container with Pop-out effect */}
          <div className={`
            w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border relative
            ${isNew
              ? 'bg-yellow-500/20 border-yellow-500/30'
              : isKilledToday
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : 'bg-surface-hover border-border/50'
            }
            ${isZeroKills ? 'grayscale' : ''}
          `}>
            {bossImage ? (
              <img
                src={bossImage}
                alt={boss.name}
                className="w-[120%] h-[120%] max-w-none object-contain absolute -top-[20%] drop-shadow-lg transition-transform group-hover:scale-110"
              />
            ) : (
              <span className="text-xs font-bold text-secondary">{boss.name.slice(0, 2)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-white text-sm truncate pr-2 group-hover:text-primary transition-colors">{boss.name}</h3>
            </div>

            <div className="space-y-1">
              {/* Next Spawn - Conditional */}
              {showNextSpawn && nextSpawnInfo && (
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <Calendar size={12} className="text-secondary/70" />
                  <span>
                    Next: <span className={`${nextSpawnInfo.isOverdue ? 'text-white/90' : 'text-white/90'}`}>
                      {nextSpawnInfo.isOverdue ? '-' : nextSpawnInfo.date}
                    </span>
                  </span>
                </div>
              )}

              {/* Last Kill - Only show if not "Never" AND not combined view */}
              {'lastKillDate' in boss && boss.lastKillDate && boss.lastKillDate !== 'Never' && type !== 'combined' && (
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <Clock size={12} className="text-secondary/70" />
                  <span>{boss.lastKillDate}</span>
                </div>
              )}

              {/* Total Kills */}
              <div className="flex items-center gap-1.5 text-xs text-secondary">
                <Trophy size={12} className="text-secondary/70" />
                <span>
                  <span className="text-white font-medium">{totalKills} kills</span>
                  {dailyKill && type === 'combined' && (
                    <span className="text-emerald-400 ml-1">
                      ({todayKills} today)
                    </span>
                  )}
                </span>
              </div>

              {/* World Badges (only if dailyKill exists AND not on world page) */}
              {dailyKill && type !== 'world' && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {dailyKill.worlds.map((w) => (
                    <span
                      key={w.world}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-hover border border-border/50 text-[10px] text-secondary"
                    >
                      {w.world}
                      {w.count > 1 && <span className="ml-1 text-white opacity-70">x{w.count}</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <BossDetailsDrawer
        boss={boss}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

function HistoryIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
      <path d="M3 3v9h9" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
