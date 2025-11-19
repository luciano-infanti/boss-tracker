'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Upload, Calendar, Trophy, Server } from 'lucide-react';
import { getBossImage } from '@/utils/bossImages';
import { useRef } from 'react';

export default function TodayPage() {
  const { data, uploadDailyFile, isLoading } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const daily = data.daily;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadDailyFile(file);
  };

  if (!daily) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Calendar size={48} className="text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-300 mb-2">No Daily Data</h2>
        <p className="text-gray-400 mb-6">Upload today's kill report to see statistics</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Upload size={18} />
          {isLoading ? 'Uploading...' : 'Upload Daily Report'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Today's Kills</h2>
          <p className="text-gray-400">{daily.date} at {daily.timestamp}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Upload size={18} />
          Update
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-400" size={20} />
            <p className="text-gray-400 text-sm">Total Kills</p>
          </div>
          <p className="text-3xl font-bold text-white">{daily.totalKills}</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Server className="text-emerald-400" size={20} />
            <p className="text-gray-400 text-sm">Unique Bosses</p>
          </div>
          <p className="text-3xl font-bold text-white">{daily.uniqueBosses}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-400" size={20} />
            <p className="text-gray-400 text-sm">Most Active</p>
          </div>
          <p className="text-xl font-bold text-white">
            {daily.kills.sort((a, b) => b.totalKills - a.totalKills)[0]?.bossName || 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daily.kills.map((kill) => {
          const bossImage = getBossImage(kill.bossName);
          
          return (
            <div key={kill.bossName} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-emerald-500 transition-colors">
              {bossImage && (
                <div className="h-32 bg-gray-900 relative">
                  <img 
                    src={bossImage} 
                    alt={kill.bossName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-3">{kill.bossName}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Trophy size={14} className="text-yellow-400" />
                    <span>{kill.totalKills} kill{kill.totalKills > 1 ? 's' : ''} today</span>
                  </div>
                  
                  <div className="space-y-1">
                    {kill.worlds.map((world, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-300 ml-5">
                        <Server size={12} className="text-emerald-400" />
                        <span className="text-xs">
                          {world.world} {world.count > 1 ? `(${world.count}x)` : ''}
                        </span>
                      </div>
                    ))}
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
