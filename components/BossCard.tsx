'use client';

import { Calendar, Clock, Trophy, Globe } from 'lucide-react';
import { useState } from 'react';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
}

function isKilledToday(lastKillDate: string | undefined): boolean {
  if (!lastKillDate || lastKillDate === 'Never' || lastKillDate === 'N/A') return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const parts = lastKillDate.split('/');
    if (parts.length !== 3) return false;
    
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    
    const killDate = new Date(year, month - 1, day);
    killDate.setHours(0, 0, 0, 0);
    
    return killDate.getTime() === today.getTime();
  } catch {
    return false;
  }
}

export default function BossCard({ boss, type }: BossCardProps) {
  const [expanded, setExpanded] = useState(false);
  const bossImage = getBossImage(boss.name);
  
  const killedToday = type === 'world' && isKilledToday((boss as Boss).lastKillDate);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-emerald-500 transition-colors">
      {bossImage && (
        <div className="h-32 bg-gray-900 relative">
          <img 
            src={bossImage} 
            alt={boss.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-white">{boss.name}</h3>
        </div>

        {killedToday && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white">
              Killed Today
            </span>
          </div>
        )}

        {type === 'world' ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar size={14} className="text-emerald-400" />
              <span>Next: {(boss as Boss).nextExpectedSpawn || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={14} className="text-blue-400" />
              <span>{(boss as Boss).spawnFrequency || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy size={14} className="text-yellow-400" />
              <span>{(boss as Boss).totalKills || 0} kills ({(boss as Boss).totalDaysSpawned || 0} days)</span>
            </div>

            {(boss as Boss).history && (boss as Boss).history !== 'None' && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-emerald-400 hover:text-emerald-300 text-xs mt-2"
              >
                {expanded ? 'Hide' : 'Show'} History
              </button>
            )}

            {expanded && (
              <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400">
                {(boss as Boss).history}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Globe size={14} className="text-emerald-400" />
              <span>{(boss as CombinedBoss).appearsInWorlds || 0} worlds</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={14} className="text-blue-400" />
              <span>{(boss as CombinedBoss).typicalSpawnFrequency || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy size={14} className="text-yellow-400" />
              <span>{(boss as CombinedBoss).totalKills || 0} total kills</span>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-emerald-400 hover:text-emerald-300 text-xs mt-2"
            >
              {expanded ? 'Hide' : 'Show'} Per-World Stats
            </button>

            {expanded && (
              <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 space-y-1">
                {(boss as CombinedBoss).perWorldStats?.map((stat) => (
                  <div key={stat.world}>
                    <strong>{stat.world}:</strong> {stat.spawns} spawns, {stat.kills} kills
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
