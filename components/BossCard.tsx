'use client';

import { Calendar, Clock, Trophy, Globe } from 'lucide-react';
import { useState } from 'react';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';

import { isKilledToday } from '@/utils/dateUtils';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
  isKilledToday?: boolean;
}

export default function BossCard({ boss, type, isKilledToday: propIsKilledToday }: BossCardProps) {
  const [expanded, setExpanded] = useState(false);
  const bossImage = getBossImage(boss.name);

  const killedToday = propIsKilledToday ?? (type === 'world' && isKilledToday((boss as Boss).lastKillDate));

  return (
    <div className="group bg-surface border border-border rounded-md overflow-hidden hover:border-border/80 hover:shadow-lg transition-all duration-200">
      <div className="flex p-4 gap-4">
        {bossImage && (
          <div className="w-12 h-12 shrink-0 bg-surface-hover rounded-md flex items-center justify-center border border-border/50">
            <img
              src={bossImage}
              alt={boss.name}
              className="w-10 h-10 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-white text-sm truncate pr-2">{boss.name}</h3>
            {killedToday && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Today
              </span>
            )}
          </div>

          {type === 'world' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Calendar size={12} className="text-secondary/70" />
                <span>Next: <span className="text-gray-300">{(boss as Boss).nextExpectedSpawn || 'N/A'}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Clock size={12} className="text-secondary/70" />
                <span>{(boss as Boss).spawnFrequency || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Trophy size={12} className="text-secondary/70" />
                <span>{(boss as Boss).totalKills || 0} kills</span>
              </div>

              {(boss as Boss).history && (boss as Boss).history !== 'None' && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] font-medium text-primary hover:text-primary/80 mt-1 transition-colors"
                >
                  {expanded ? 'Hide' : 'View'} History
                </button>
              )}

              {expanded && (
                <div className="mt-2 p-2 bg-surface-hover/50 rounded text-[10px] text-secondary border border-border/50">
                  {(boss as Boss).history}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Globe size={12} className="text-secondary/70" />
                <span>{(boss as CombinedBoss).appearsInWorlds || 0} worlds</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Trophy size={12} className="text-secondary/70" />
                <span>{(boss as CombinedBoss).totalKills || 0} total kills</span>
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-medium text-primary hover:text-primary/80 mt-1 transition-colors"
              >
                {expanded ? 'Hide' : 'View'} Stats
              </button>

              {expanded && (
                <div className="mt-2 p-2 bg-surface-hover/50 rounded text-[10px] text-secondary border border-border/50 space-y-1">
                  {(boss as CombinedBoss).perWorldStats?.map((stat) => (
                    <div key={stat.world} className="flex justify-between">
                      <span className="text-gray-300">{stat.world}</span>
                      <span>{stat.spawns}s / {stat.kills}k</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
