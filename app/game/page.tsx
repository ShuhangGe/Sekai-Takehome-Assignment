'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/utils/store';
import GameChat from '@/components/GameChat';
import PlayerStats from '@/components/PlayerStats';
import ScenarioSelector from '@/components/ScenarioSelector';
import CharacterCustomization from '@/components/CharacterCustomization';
import SavedGames from '@/components/SavedGames';
import { generateGameIntroduction } from '@/utils/ai';
import { gameTemplates } from '@/types/game';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/app/actions';
import Link from 'next/link';

export default function GamePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stage, setStage] = useState<'scenario' | 'customize' | 'game' | 'saved-games'>('scenario');
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const currentGame = useGameStore((state) => state.currentGame);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const addAIMessage = useGameStore((state) => state.addAIMessage);
  const saveGame = useGameStore((state) => state.saveGame);

  // Check authentication state
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.push('/auth');
        return;
      }
      
      setUser(data.session.user);
      setIsLoading(false);
    };
    
    checkUser();
  }, [router]);

  // Generate game introduction when game starts
  useEffect(() => {
    const initializeGame = async () => {
      if (currentGame && currentGame.history.length === 1) {
        setStage('game');
        
        const scenario = gameTemplates[currentGame.scenarioName];
        if (scenario) {
          try {
            const intro = await generateGameIntroduction(scenario);
            addAIMessage(intro);
          } catch (error) {
            console.error('Error generating intro:', error);
          }
        }
      } else if (currentGame) {
        setStage('game');
      }
    };
    
    initializeGame();
  }, [currentGame, addAIMessage]);

  // Handle stage transitions
  const handleProceedToCustomize = () => {
    setStage('customize');
  };

  // Handle saving the game
  const handleSaveGame = async () => {
    if (!currentGame) return;
    
    setIsSaving(true);
    try {
      const success = await saveGame();
      if (success) {
        alert('Game saved successfully!');
      } else {
        alert('Failed to save game. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI D&D Adventure</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <span>{user.email}</span>
              <Link href="/profile" className="text-white hover:text-blue-200">
                Profile
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-md text-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Game navigation tabs */}
        {user && (
          <div className="mb-8 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px">
              <li className="mr-2">
                <button
                  onClick={() => setStage('scenario')}
                  className={`inline-block py-2 px-4 rounded-t-lg ${
                    stage === 'scenario'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  New Game
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setStage('saved-games')}
                  className={`inline-block py-2 px-4 rounded-t-lg ${
                    stage === 'saved-games'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Saved Games
                </button>
              </li>
              {currentGame && (
                <li className="ml-auto">
                  <button
                    onClick={handleSaveGame}
                    disabled={isSaving || currentGame.isEnded}
                    className={`inline-flex items-center py-2 px-4 text-sm font-medium rounded-lg ${
                      isSaving 
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Game'}
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {stage === 'scenario' && (
          <div className="space-y-8">
            <ScenarioSelector />
            <div className="flex justify-center">
              <button
                onClick={handleProceedToCustomize}
                className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {stage === 'customize' && (
          <CharacterCustomization />
        )}

        {stage === 'saved-games' && (
          <SavedGames />
        )}

        {stage === 'game' && currentGame && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PlayerStats />
            </div>
            <div className="lg:col-span-3 bg-white rounded-lg shadow-md h-[700px] flex flex-col">
              <GameChat />
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 