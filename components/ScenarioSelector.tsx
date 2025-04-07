'use client';

import { useGameStore } from '@/utils/store';
import { gameTemplates } from '@/types/game';

export default function ScenarioSelector() {
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const setSelectedScenario = useGameStore((state) => state.setSelectedScenario);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Adventure</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(gameTemplates).map(([id, scenario]) => (
          <div
            key={id}
            onClick={() => setSelectedScenario(id)}
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              selectedScenario === id
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <h3 className="text-xl font-bold mb-3">{scenario["Dnd-Scenario"]}</h3>
            <p className="text-gray-600 mb-4 text-sm">{scenario.startingPoint}</p>
            
            <div className="mt-3">
              <h4 className="font-semibold mb-2">Key Attributes:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {Object.keys(scenario.attributes).slice(0, 4).map(attr => (
                  <li key={attr} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {attr}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 