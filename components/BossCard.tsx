'use client';

import { CheckCircle, Calendar, Clock, Trophy, Globe } from 'lucide-react';
import { useState } from 'react';
import { Boss, CombinedBoss } from '@/types';
import { getBossImage } from '@/utils/bossImages';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
}

function isKilledToday(lastKillDate: string): boolean {
  if (lastKillDate === 'Never' || lastKillDate === 'N/A') return false;
  const today = new Date();
  const killDate = new Date(lastKillDate.split('/').reverse().join('-'));
  return (
    killDate.getDate() === today.getDate() &&
    killDate.getMonth() === today.getMonth() &&
    killDate.getFullYear() === today.getFullYear()
  );
}

export default function BossCard({ boss, type }: BossCardProps) {
  const [expanded, setExpanded] = useState(false);
  const bossImage = getBossImage(boss.name);
  
  const killedToday = type === 'world' && isKilledToday((boss as Boss).lastKillDate);
  const isRecentKill = type === 'world' && (boss as Boss).lastKillDate !== 'Never';

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
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white">{boss.name}</h3>
            {isRecentKill && <CheckCircle size={16} className="text-emerald-400" />}
          </div>
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
              <span>Next: {(boss as Boss).nextExpectedSpawn}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={14} className="text-blue-400" />
              <span>{(boss as Boss).spawnFrequency}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy size={14} className="text-yellow-400" />
              <span>{(boss as Boss).totalKills} kills ({(boss as Boss).totalDaysSpawned} days)</span>
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
              <span>{(boss as CombinedBoss).appearsInWorlds} worlds</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={14} className="text-blue-400" />
              <span>{(boss as CombinedBoss).typicalSpawnFrequency}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy size={14} className="text-yellow-400" />
              <span>{(boss as CombinedBoss).totalKills} total kills</span>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-emerald-400 hover:text-emerald-300 text-xs mt-2"
            >
              {expanded ? 'Hide' : 'Show'} Per-World Stats
            </button>

            {expanded && (
              <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 space-y-1">
                {(boss as CombinedBoss).perWorldStats.map((stat) => (
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
