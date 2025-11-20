'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import { Clock, Calendar, Trophy } from 'lucide-react';

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

export default function BossCard({ boss, type = 'world', isKilledToday, isNew, dailyKill, worldName }: BossCardProps) {
  const { data } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const bossImage = getBossImage(boss.name);

  // Determine if boss has 0 kills (grayscale)
  const totalKills = boss.totalKills || 0;
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

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        className={`
          relative rounded-lg p-5 border transition-all cursor-pointer group hover:bg-surface-hover
          ${isKilledToday
            ? 'bg-surface border-border'
            : 'bg-surface border-border'
          }
          ${isZeroKills ? 'opacity-80' : ''}
        `}
      >
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

        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 bg-surface-hover rounded-md flex items-center justify-center shrink-0 border border-border/50 overflow-hidden ${isZeroKills ? 'grayscale' : ''}`}>
            {bossImage ? (
              <img src={bossImage} alt={boss.name} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-xs font-bold text-secondary">{boss.name.slice(0, 2)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-white text-sm truncate pr-2 group-hover:text-primary transition-colors">{boss.name}</h3>
            </div>

            <div className="space-y-1">
              {/* Next Spawn */}
              <div className="flex items-center gap-1.5 text-xs text-secondary">
                <Calendar size={12} className="text-secondary/70" />
                <span>
                  Next: <span className="text-white/90">
                    {'nextExpectedSpawn' in boss ? boss.nextExpectedSpawn : 'N/A'}
                  </span>
                </span>
              </div>

              {/* Last Kill - Only show if not "Never" */}
              {'lastKillDate' in boss && boss.lastKillDate && boss.lastKillDate !== 'Never' && (
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
