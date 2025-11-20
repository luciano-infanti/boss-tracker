'use client';

import { useData } from '@/context/DataContext';
import { Calendar, Trophy, Server } from 'lucide-react';
import { getBossImage } from '@/utils/bossImages';

export default function TodayPage() {
  const { data } = useData();
  const daily = data.daily;

  if (!daily) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4">
          <Calendar size={24} className="text-secondary" />
        </div>
        <h2 className="text-lg font-medium text-white mb-1">No Daily Data</h2>
        <p className="text-sm text-secondary max-w-xs">Upload today's kill report using the 'Upload Data' button above to see stats.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-medium text-white mb-1">Today's Kills</h2>
        <p className="text-sm text-secondary">{daily.date} at {daily.timestamp}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-400/80" size={18} />
            <p className="text-secondary text-xs font-medium uppercase tracking-wide">Total Kills</p>
          </div>
          <p className="text-3xl font-semibold text-white">{daily.totalKills}</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Server className="text-emerald-400" size={18} />
            <p className="text-secondary text-xs font-medium uppercase tracking-wide">Unique Bosses</p>
          </div>
          <p className="text-3xl font-semibold text-white">{daily.uniqueBosses}</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-primary" size={18} />
            <p className="text-secondary text-xs font-medium uppercase tracking-wide">Most Active</p>
          </div>
          <p className="text-xl font-medium text-white truncate">
            {daily.kills.sort((a, b) => b.totalKills - a.totalKills)[0]?.bossName || 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daily.kills.map((kill) => {
          const bossImage = getBossImage(kill.bossName);

          return (
            <div key={kill.bossName} className="group bg-surface border border-border rounded-md overflow-hidden hover:border-border/80 hover:shadow-lg transition-all duration-200">
              <div className="flex p-4 gap-4">
                {bossImage && (
                  <div className="w-12 h-12 shrink-0 bg-surface-hover rounded-md flex items-center justify-center border border-border/50">
                    <img
                      src={bossImage}
                      alt={kill.bossName}
                      className="w-10 h-10 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white text-sm truncate pr-2">{kill.bossName}</h3>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                      <Trophy size={12} className="text-secondary/70" />
                      <span><span className="text-white font-medium">{kill.totalKills}</span> kill{kill.totalKills > 1 ? 's' : ''} today</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {kill.worlds.map((world, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-secondary">
                          <div className="flex items-center gap-1.5">
                            <Server size={10} className="text-emerald-400/70" />
                            <span>{world.world}</span>
                          </div>
                          {world.count > 1 && <span className="text-[10px] bg-surface-hover px-1.5 rounded text-gray-300">{world.count}x</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
