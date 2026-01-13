'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import {
  Clock,
  Calendar,
  Trophy,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
// ... existing imports

// ... inside BossCard ...

// Helper to get confidence badge
const getConfidenceBadge = () => {
  // @ts-ignore - accessing dynamic property from prediction
  const label = boss.confidenceLabel;
  if (!label) return null;

  if (label === 'High') {
    return (
      <div className="group relative ml-2 inline-flex items-center">
        <CheckCircle size={14} className="text-emerald-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] z-50">
          <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
            Verificado por 10+ mortes em todos os servidores.
          </div>
        </div>
      </div>
    );
  }

  if (label === 'Medium') {
    return (
      <div className="group relative ml-2 inline-flex items-center">
        <HelpCircle size={14} className="text-yellow-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] z-50">
          <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
            Provavelmente preciso, mas dados limitados.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative ml-2 inline-flex items-center">
      <AlertTriangle size={14} className="text-red-500" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] z-50">
        <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
          Very few data points. Estimate may be wrong.
        </div>
      </div>
    </div>
  );
};

// ... inside render ...


import { calculateAdjustedTotalKills, getAdjustedKillCount } from '@/utils/soulpitUtils';
import { getBossExtraInfo } from '@/utils/bossExtraData';
import { useData } from '@/context/DataContext';
import BossDetailsDrawer from './BossDetailsDrawer';

import { DailyKill } from '@/types';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
  isKilledToday?: boolean;
  isNew?: boolean;
  dailyKill?: DailyKill;
  worldName?: string;
  onClick?: (boss: Boss | CombinedBoss) => void;
  children?: React.ReactNode;
  hideConfidence?: boolean;
  status?: 'COOLDOWN' | 'WINDOW_OPEN' | 'OVERDUE' | 'UNKNOWN';
}

export default function BossCard({
  boss,
  type = 'world',
  isKilledToday,
  isNew,
  dailyKill,
  worldName,
  showNextSpawn = true,
  viewMode = 'grid',
  hideStats = false,
  showLastKill = true,
  onClick,
  children,
  hideConfidence = false,
  status
}: BossCardProps & { showNextSpawn?: boolean; viewMode?: 'grid' | 'list'; hideStats?: boolean; showLastKill?: boolean }) {
  const { data } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const bossImage = getBossImage(boss.name);
  const bossExtra = getBossExtraInfo(boss.name);
  const eventTag = bossExtra?.eventTag;



  // Determine if boss has 0 kills (grayscale)
  // For combined view with daily data, use the daily total (more accurate for today's context)
  const storedTotalKills = calculateAdjustedTotalKills(boss);
  const totalKills = (type === 'combined' && dailyKill)
    ? dailyKill.totalKills
    : storedTotalKills;



  // Calculate today's kills for display
  const todayKills = useMemo(() => {
    if (!dailyKill) return 0;
    let count = 0;
    if (type === 'world' && worldName) {
      count = dailyKill.worlds.find(w => w.world === worldName)?.count || 0;
    } else {
      count = dailyKill.totalKills;
    }
    return getAdjustedKillCount(boss.name, count);
  }, [dailyKill, type, worldName, boss.name]);

  const isZeroKills = totalKills === 0 && todayKills === 0;

  // Override isKilledToday based on filtered count
  const showKilledToday = isKilledToday && todayKills > 0;

  // Status-based image filter
  // COOLDOWN = grayscale, WINDOW_OPEN = normal, OVERDUE = red tint
  const getImageFilter = () => {
    if (status === 'COOLDOWN') return 'grayscale';
    if (status === 'OVERDUE') return 'sepia saturate-200 hue-rotate-[-50deg]'; // Red tint
    return ''; // WINDOW_OPEN or no status = normal
  };
  const imageFilter = getImageFilter();


  const handleCardClick = () => {
    if (onClick) {
      onClick(boss);
    } else {
      setIsDrawerOpen(true);
    }
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsCardHovered(true);

    // Show tooltip if confidence info is available
    if ((boss as any).confidence === undefined) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 500); // 0.5 seconds delay
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    setIsCardHovered(false);
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
      return 'Visto por último: Nunca';
    }

    const now = new Date();
    // Normalize to midnight for accurate day difference
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastSeen = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());

    const diffTime = Math.abs(today.getTime() - lastSeen.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `Visto pela última vez em ${dateStr} (${diffDays} dias atrás)`;
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
    // If 'status' prop is provided, use it. Otherwise fall back to date check.
    const isOverdue = status ? status === 'OVERDUE' : expectedDate < today;

    return {
      date: boss.nextExpectedSpawn,
      isOverdue
    };
  }, [boss, status]);

  // Build tags array for animated dots
  const tags = useMemo(() => {
    const result: Array<{
      label: string;
      dotColor: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
    }> = [];

    if (showKilledToday && type !== 'combined') {
      result.push({
        label: 'HOJE',
        dotColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30'
      });
    }

    if (isNew) {
      result.push({
        label: 'NOVO',
        dotColor: 'bg-yellow-500',
        bgColor: 'bg-yellow-500/20',
        textColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/30'
      });
    }

    if (eventTag) {
      result.push({
        label: eventTag.toUpperCase(),
        dotColor: 'bg-cyan-500',
        bgColor: 'bg-cyan-500/20',
        textColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30'
      });
    }

    return result;
  }, [showKilledToday, type, isNew, eventTag]);

  // Animated Tag Dots Component
  const AnimatedTagDots = ({ position = 'top-3 right-3' }: { position?: string }) => {
    if (tags.length === 0) return null;

    return (
      <div
        className={`absolute ${position} flex gap-1.5 pointer-events-none z-10`}
      >
        {tags.map((tag, i) => (
          <motion.div
            key={tag.label}
            initial={false}
            animate={isCardHovered ? "expanded" : "dot"}
            variants={{
              dot: {
                width: 4,
                height: 4,
                borderRadius: 2,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0
              },
              expanded: {
                width: "auto",
                height: "auto",
                borderRadius: 4,
                paddingLeft: 4,
                paddingRight: 4,
                paddingTop: 6,
                paddingBottom: 6
              }
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay: i * 0.03
            }}
            className={`${isCardHovered ? tag.bgColor : tag.dotColor} ${tag.borderColor} border overflow-hidden flex items-center justify-center`}
          >
            <AnimatePresence>
              {isCardHovered && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, delay: i * 0.03 + 0.05 }}
                  className={`${tag.textColor} text-[10px] font-bold whitespace-nowrap leading-none`}
                >
                  {tag.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          onClick={handleCardClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`
            relative rounded-lg p-4 border transition-colors cursor-pointer group hover:bg-surface-hover flex items-center gap-6
            ${showKilledToday ? 'bg-surface border-border' : 'bg-surface border-border'}
            ${isZeroKills ? 'opacity-80' : ''}
          `}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (boss as any).confidence !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
                transition={{ duration: 0.2 }}
                className="absolute -top-10 left-12 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 border border-white/10 shadow-xl pointer-events-none"
              >
                {(boss as any).confidence}% Confiança
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/10"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Tag Dots - Absolute positioned */}
          <AnimatedTagDots position="top-2 right-3" />

          {/* Image Container - Smaller for List View */}
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border relative z-0
            ${isNew
              ? 'bg-yellow-500/20 border-yellow-500/30'
              : showKilledToday
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : status === 'OVERDUE'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-surface-hover border-border/50'
            }
          `}>
            {bossImage ? (
              <img
                src={bossImage}
                alt={boss.name}
                className={`w-[120%] h-[120%] max-w-none object-contain absolute -top-[20%] drop-shadow-lg ${imageFilter}`}
              />
            ) : (
              <span className="text-[10px] font-bold text-secondary">{boss.name.slice(0, 2)}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center justify-between relative z-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white text-sm truncate group-hover:text-primary transition-colors flex items-center gap-2">
                  {boss.name}
                  {!hideConfidence && (boss as any).confidence !== undefined && (
                    <div className={`w-2 h-2 rounded-full ${(boss as any).confidenceLabel === 'High' ? 'bg-emerald-500' :
                      (boss as any).confidenceLabel === 'Medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                  )}
                </h3>
              </div>

              {children && <div className="mb-1">{children}</div>}

              <div className="flex items-center gap-4 text-xs text-secondary">
                {/* Next Spawn */}
                {showNextSpawn && nextSpawnInfo && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-secondary/70" />
                    <span>
                      Próx: <span className={`${nextSpawnInfo.isOverdue ? 'text-red-400' : 'text-secondary'}`}>
                        {nextSpawnInfo.date}
                      </span>
                    </span>
                  </div>
                )}

                {/* Last Kill */}
                {type === 'world' && showLastKill && (
                  (() => {
                    let dateStr = 'lastKillDate' in boss ? boss.lastKillDate : undefined;

                    if ('history' in boss && boss.history && boss.history !== 'None') {
                      let latestDate: Date | null = null;
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

                    if (!dateStr || dateStr === 'Never') return null;
                    return (
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-secondary/70" />
                        <span>{dateStr}</span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Right Side Stats */}
            {!hideStats && (
              <div className="flex items-center gap-4">
                {/* World Badges for Combined View */}
                {dailyKill && type !== 'world' && (
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {dailyKill.worlds.map((w) => {
                      const adjustedCount = getAdjustedKillCount(boss.name, w.count);
                      if (adjustedCount === 0) return null;
                      return (
                        <span
                          key={w.world}
                          className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-hover border border-border/50 text-[10px] text-secondary"
                        >
                          {w.world}
                          {adjustedCount >= 1 && <span className="ml-1 text-white opacity-70">x{adjustedCount}</span>}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-secondary min-w-[80px] justify-end">
                  <Trophy size={12} className="text-secondary/70" />
                  <span>
                    <span className="text-secondary font-medium">{totalKills} mortes</span>
                    {dailyKill && todayKills > 0 && (
                      <span className="text-emerald-400 ml-1">
                        ({todayKills})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <BossDetailsDrawer
          boss={boss}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          dailyKill={dailyKill}
          worldName={type === 'world' ? worldName : undefined}
        />
      </>
    );
  }



  // Helper to get confidence badge
  const getConfidenceBadge = () => {
    // @ts-ignore - accessing dynamic property from prediction
    const label = (boss as any).confidenceLabel;
    if (!label) return null;

    if (label === 'High') {
      return (
        <div className="group relative ml-2 inline-flex items-center">
          <CheckCircle size={14} className="text-emerald-500" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] z-50">
            <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
              Verificado por 10+ mortes em todos os servidores.
            </div>
          </div>
        </div>
      );
    }

    if (label === 'Medium') {
      return (
        <div className="group relative ml-2 inline-flex items-center">
          <HelpCircle size={14} className="text-yellow-500" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] z-50">
            <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
              Provavelmente preciso, mas dados limitados.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative ml-2 inline-flex items-center">
        <AlertTriangle size={14} className="text-red-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] z-50">
          <div className="bg-surface-hover text-xs text-white px-2 py-1 rounded shadow-xl border border-border">
            Poucos dados. Estimativa pode estar errada.
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative rounded-lg p-5 border transition-colors cursor-pointer group hover:bg-surface-hover h-full flex flex-col
          ${showKilledToday
            ? 'bg-surface border-border'
            : 'bg-surface border-border'
          }
          ${isZeroKills ? 'opacity-80' : ''}
        `}
      >
        {/* Tooltip */}
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (boss as any).confidence !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
              transition={{ duration: 0.2 }}
              className="absolute -top-10 left-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 border border-white/10 shadow-xl pointer-events-none"
            >
              {(boss as any).confidence}% Confiança
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/10"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Tag Dots - Absolute positioned */}
        <AnimatedTagDots position="top-3 right-3" />

        <div className="flex items-start gap-6 relative z-0">
          {/* Image Container with Pop-out effect */}
          <div className={`
            w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border relative
            ${isNew
              ? 'bg-yellow-500/20 border-yellow-500/30'
              : showKilledToday
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : status === 'OVERDUE'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-surface-hover border-border/50'
            }
          `}>
            {bossImage ? (
              <img
                src={bossImage}
                alt={boss.name}
                className={`w-[120%] h-[120%] max-w-none object-contain absolute -top-[20%] drop-shadow-lg ${imageFilter}`}
              />
            ) : (
              <span className="text-xs font-bold text-secondary">{boss.name.slice(0, 2)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-white text-sm truncate pr-2 group-hover:text-primary transition-colors flex items-center gap-2">
                {boss.name}
                {!hideConfidence && (boss as any).confidence !== undefined && (
                  <div className={`w-2 h-2 rounded-full ${(boss as any).confidenceLabel === 'High' ? 'bg-emerald-500' :
                    (boss as any).confidenceLabel === 'Medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                )}
              </h3>
            </div>

            {children && <div className="mb-2">{children}</div>}

            <div className="space-y-1">
              {/* Next Spawn - Conditional */}
              {showNextSpawn && nextSpawnInfo && (
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <Calendar size={12} className="text-secondary/70" />
                  <div className="flex items-center">
                    <span>
                      {nextSpawnInfo.isOverdue ? 'Esperado: ' : 'Próx: '}<span className={`${nextSpawnInfo.isOverdue ? 'text-red-400' : 'text-secondary'}`}>
                        {nextSpawnInfo.date}
                      </span>
                    </span>
                    {!hideConfidence && getConfidenceBadge()}
                  </div>
                </div>
              )}

              {/* Last Kill - Only show if not "Never" AND not combined view */}
              {type !== 'world' || !showLastKill ? null : (
                (() => {
                  // Reuse the logic from lastSeenText but just get the date string
                  let dateStr = 'lastKillDate' in boss ? boss.lastKillDate : undefined;

                  if ('history' in boss && boss.history && boss.history !== 'None') {
                    let latestDate: Date | null = null;
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

                  if (!dateStr || dateStr === 'Never') return null;

                  return (
                    <div className="flex items-center gap-1.5 text-xs text-secondary">
                      <Clock size={12} className="text-secondary/70" />
                      <span>{dateStr}</span>
                    </div>
                  );
                })()
              )}

              {/* Total Kills */}
              {!hideStats && (
                <div className="flex items-center gap-1.5 text-xs text-secondary whitespace-nowrap">
                  <Trophy size={12} className="text-secondary/70 shrink-0" />
                  <span>
                    <span className="text-secondary font-medium">{totalKills} mortes</span>
                    {dailyKill && todayKills > 0 && (
                      <span className="text-emerald-400 ml-1">
                        ({todayKills} hoje)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* World Badges - Full width, below boss info (only if dailyKill exists AND not on world page) */}
        {dailyKill && type !== 'world' && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {dailyKill.worlds.map((w) => {
              const adjustedCount = getAdjustedKillCount(boss.name, w.count);
              if (adjustedCount === 0) return null;
              return (
                <span
                  key={w.world}
                  className="inline-flex items-center px-2 py-1 rounded bg-surface-hover border border-border/50 text-[10px] text-secondary"
                >
                  {w.world}
                  {adjustedCount >= 1 && <span className="ml-1 text-white opacity-70">x{adjustedCount}</span>}
                </span>
              );
            })}
          </div>
        )}
      </motion.div>

      <BossDetailsDrawer
        boss={boss}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        dailyKill={dailyKill}
        worldName={type === 'world' ? worldName : undefined}
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
