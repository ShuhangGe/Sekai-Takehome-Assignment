'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { signOut } from '@/app/actions';
import GameChat from '@/components/GameChat';

// Game scenarios data
const gameScenarios = [
  {
    id: 'asian-parent',
    title: 'Raising Your Asian Child (Helicopter Parent Edition)',
    description: 'Navigate the challenges of being a helicopter parent trying to raise the perfect Asian child. Balance academic excellence, extracurricular activities, and cultural traditions.',
    image: '👨‍👩‍👧‍👦'
  },
  {
    id: 'trump-advisor',
    title: 'White House Chaos: Trump\'s Advisor',
    description: 'Survive as an advisor in the chaotic Trump White House. Manage crises, presidential tantrums, and navigate the complex political landscape of Washington.',
    image: '🏛️'
  }
];

export default function GamePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [gameStage, setGameStage] = useState<'select' | 'play'>('select');
  const router = useRouter();

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

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const handleStartGame = () => {
    if (selectedScenario) {
      setGameStage('play');
    }
  };

  const handleBackToSelection = () => {
    setGameStage('select');
  };

  const getScenarioTitle = (scenarioId: string) => {
    const scenario = gameScenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.title : 'Unknown Scenario';
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
        {gameStage === 'select' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Adventure</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {gameScenarios.map((scenario) => (
                <div 
                  key={scenario.id} 
                  className={`bg-white p-6 rounded-lg shadow-md cursor-pointer border-2 transition-all ${
                    selectedScenario === scenario.id 
                      ? 'border-blue-500 scale-105' 
                      : 'border-transparent hover:border-blue-300'
                  }`}
                  onClick={() => handleScenarioSelect(scenario.id)}
                >
                  <div className="text-4xl mb-4">{scenario.image}</div>
                  <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
                  <p className="text-gray-600">{scenario.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStartGame}
                disabled={!selectedScenario}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Adventure
              </button>
            </div>
          </div>
        )}

        {gameStage === 'play' && selectedScenario && (
          <div className="max-w-4xl mx-auto">
            <GameChat 
              scenarioId={selectedScenario}
              scenarioTitle={getScenarioTitle(selectedScenario)}
              onBack={handleBackToSelection}
            />
          </div>
        )}
      </main>
    </div>
  );
} 