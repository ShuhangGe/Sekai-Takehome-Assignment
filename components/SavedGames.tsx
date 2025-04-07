'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/utils/store';
import { GameState, gameTemplates } from '@/types/game';

export default function SavedGames() {
  const [isLoading, setIsLoading] = useState(false);

  const savedGames = useGameStore((state) => state.savedGames);
  const loadSavedGames = useGameStore((state) => state.loadSavedGames);
  const loadGame = useGameStore((state) => state.loadGame);
  const deleteSavedGame = useGameStore((state) => state.deleteSavedGame);

  useEffect(() => {
    const fetchSavedGames = async () => {
      setIsLoading(true);
      await loadSavedGames();
      setIsLoading(false);
    };

    fetchSavedGames();
  }, [loadSavedGames]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading saved games...</p>
      </div>
    );
  }

  if (!savedGames.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No saved games found.</p>
        <p className="text-sm mt-2">Start a new game and your progress will be saved here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Saved Games</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {savedGames.map((game: GameState) => (
          <div 
            key={game.id} 
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {gameTemplates[game.scenarioName]?.["Dnd-Scenario"] || game.scenarioName}
                </h3>
                <p className="text-sm text-gray-600">
                  Player: {game.player.username} • Turn: {game.currentTurn}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(game.history[game.history.length - 1].timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadGame(game)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this saved game?')) {
                      deleteSavedGame(game.id);
                    }
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="mt-3 text-sm">
              <div className="line-clamp-2 text-gray-600 italic">
                Last message: {game.history[game.history.length - 1].content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 