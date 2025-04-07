'use client';

import { useGameStore } from '@/utils/store';

export default function PlayerStats() {
  const currentGame = useGameStore((state) => state.currentGame);
  
  if (!currentGame) {
    return null;
  }
  
  const { player } = currentGame;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">
        {player.username}
      </h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Character Type</h3>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(player.customizations).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Attributes</h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(player.attributes).map(([attribute, value]) => (
            <div key={attribute} className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(value / 10) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between min-w-[120px]">
                <span className="text-sm font-medium">{attribute}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2 text-gray-700">Skills</h3>
        <div className="grid grid-cols-1 gap-1 text-sm">
          {Object.entries(player.skills)
            .sort(([_, a], [__, b]) => b - a) // Sort by skill level, highest first
            .map(([skill, value]) => (
              <div key={skill} className="flex justify-between items-center py-1">
                <span className="text-gray-600">{skill}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  {value}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 