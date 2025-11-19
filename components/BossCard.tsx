'use client';

import { CheckCircle, Calendar, Clock, Trophy, Globe } from 'lucide-react';
import { useState } from 'react';
import { Boss, CombinedBoss } from '@/types';

interface BossCardProps {
  boss: Boss | CombinedBoss;
  type: 'world' | 'combined';
}

export default function BossCard({ boss, type }: BossCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isRecentKill = type === 'world' && (boss as Boss).lastKillDate !== 'Never';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-emerald-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{boss.name}</h3>
          {isRecentKill && <CheckCircle size={16} className="text-emerald-400" />}
        </div>
      </div>

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
  );
}
