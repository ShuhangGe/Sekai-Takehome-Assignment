'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/utils/store';
import { gameTemplates, GameScenario } from '@/types/game';

export default function CharacterCustomization() {
  const [username, setUsername] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const setupCustomizations = useGameStore((state) => state.setupCustomizations);
  const updateSetupCustomization = useGameStore((state) => state.updateSetupCustomization);
  const startNewGame = useGameStore((state) => state.startNewGame);

  const scenario = gameTemplates[selectedScenario];
  
  // Check if all customizations are complete
  useEffect(() => {
    if (!scenario) return;
    
    const requiredCustomizations = Object.keys(scenario.playerCustomizations);
    const completed = requiredCustomizations.every(
      (key) => setupCustomizations[key] && setupCustomizations[key].length > 0
    );
    
    setIsComplete(completed && username.trim().length > 0);
  }, [setupCustomizations, username, scenario]);

  if (!scenario) {
    return <div>Invalid scenario selected</div>;
  }

  const handleStartGame = () => {
    if (!isComplete) return;
    startNewGame(username);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Character Customization: {scenario["Dnd-Scenario"]}
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter your character name"
        />
      </div>
      
      {Object.entries(scenario.playerCustomizations).map(([key, customization]) => (
        <div key={key} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {key.charAt(0).toUpperCase() + key.slice(1)}: {customization.description}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(customization.content).map(([optionKey, option]) => (
              <div
                key={optionKey}
                onClick={() => updateSetupCustomization(key, optionKey)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  setupCustomizations[key] === optionKey
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium mb-2">{optionKey}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
                
                <div className="mt-3 text-xs">
                  <p className="font-semibold">Attribute Bonuses:</p>
                  <ul className="list-disc pl-4 mt-1">
                    {Object.entries(option.attributeBonus).map(([attr, bonus]) => (
                      <li key={attr}>
                        {attr}: +{bonus}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleStartGame}
          disabled={!isComplete}
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Adventure
        </button>
      </div>
    </div>
  );
} 