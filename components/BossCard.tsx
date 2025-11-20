'use client';

import { useState, useEffect } from 'react';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';
import { Clock, Crosshair, Calendar, X, Trophy } from 'lucide-react';

import { DailyKill } from '@/types';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
  isKilledToday?: boolean;
  isNew?: boolean;
  dailyKill?: DailyKill;
}

export default function BossCard({ boss, type, isKilledToday, isNew, dailyKill }: BossCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bossImage = getBossImage(boss.name);

  // Determine if boss has 0 kills (grayscale)
  const totalKills = boss.totalKills || 0;
  const isZeroKills = totalKills === 0;

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-surface border border-border rounded-lg p-4 hover:border-border/80 hover:shadow-lg transition-all cursor-pointer group relative ${isZeroKills ? 'opacity-80' : ''}`}
      >
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          {/* Today Tag */}
          {isKilledToday && (
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
          <div className={`w-12 h-12 bg-surface-hover rounded-md flex items-center justify-center shrink-0 border border-border/50 overflow-hidden ${isZeroKills ? 'grayscale' : ''}`}>
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
                  {dailyKill && (
                    <span className="text-emerald-400 ml-1">
                      ({dailyKill.totalKills} today)
                    </span>
                  )}
                </span>
              </div>

              {/* World Badges (only if dailyKill exists) */}
              {dailyKill && (
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-lg w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-hover/30">
              <h3 className="font-medium text-white">{boss.name} Details</h3>
              <button
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="text-secondary hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className={`w-24 h-24 bg-surface-hover rounded-lg flex items-center justify-center border border-border/50 ${isZeroKills ? 'grayscale' : ''}`}>
                  {bossImage ? (
                    <img src={bossImage} alt={boss.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-xl font-bold text-secondary">{boss.name.slice(0, 2)}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-hover/30 p-3 rounded border border-border/50">
                    <div className="text-xs text-secondary mb-1">Total Kills</div>
                    <div className="text-lg font-medium text-white">{totalKills}</div>
                  </div>
                  <div className="bg-surface-hover/30 p-3 rounded border border-border/50">
                    <div className="text-xs text-secondary mb-1">Spawn Frequency</div>
                    <div className="text-lg font-medium text-white">
                      {'spawnFrequency' in boss ? boss.spawnFrequency :
                        'typicalSpawnFrequency' in boss ? boss.typicalSpawnFrequency : 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <HistoryIcon size={14} />
                    Kill History
                  </h4>
                  <div className="bg-surface-hover/20 rounded border border-border/50 p-3 max-h-[200px] overflow-y-auto text-xs text-secondary font-mono leading-relaxed">
                    {'history' in boss ? (
                      boss.history && boss.history !== 'None' ? boss.history : 'No history available'
                    ) : (
                      'perWorldStats' in boss ? (
                        <div className="space-y-2">
                          {boss.perWorldStats.map(stat => (
                            <div key={stat.world} className="flex justify-between">
                              <span>{stat.world}</span>
                              <span className="text-white">{stat.kills} kills</span>
                            </div>
                          ))}
                        </div>
                      ) : 'No history'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
