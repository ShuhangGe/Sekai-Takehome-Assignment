'use client';

import { useState } from 'react';
import { CustomStory, CharacterTrait } from '@/types/custom-story';

interface CharacterTraitsSelectorProps {
  story: CustomStory;
  onComplete: (selectedTraits: Record<string, string>) => void;
  onBack: () => void;
}

export default function CharacterTraitsSelector({ 
  story, 
  onComplete, 
  onBack 
}: CharacterTraitsSelectorProps) {
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  
  // Get an array of trait keys
  const traitKeys = Object.keys(story.characterTraits);
  
  // Check if we've selected all traits
  const isComplete = traitKeys.length === 0 || 
    traitKeys.every(key => selectedTraits[key]);
  
  // Current trait we're customizing
  const currentTraitKey = traitKeys[currentStep];
  const currentTrait = currentTraitKey ? story.characterTraits[currentTraitKey] : null;
  
  // Handle trait option selection
  const handleSelectOption = (traitKey: string, optionName: string) => {
    setSelectedTraits(prev => ({
      ...prev,
      [traitKey]: optionName
    }));
  };
  
  // Go to next trait
  const handleNext = () => {
    if (currentStep < traitKeys.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // We're done, move to the game
      onComplete(selectedTraits);
    }
  };
  
  // Go to previous trait
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      // Go back to story selection
      onBack();
    }
  };
  
  // If there are no traits to customize, let the player start immediately
  if (traitKeys.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">{story.title}</h2>
        <p className="mb-8 text-gray-600">This story has no customizable character traits.</p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => onComplete({})}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Adventure
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-2">{story.title}</h2>
      <p className="mb-6 text-gray-600">Customize your character ({currentStep + 1}/{traitKeys.length})</p>
      
      {currentTrait && (
        <div>
          <h3 className="text-xl font-medium mb-3">{currentTrait.name}</h3>
          <p className="mb-6 text-gray-600">{currentTrait.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {currentTrait.options.map((option, index) => (
              <div 
                key={index}
                onClick={() => handleSelectOption(currentTraitKey, option.name)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTraits[currentTraitKey] === option.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium mb-2">{option.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <p className="text-xs text-blue-600 italic">{option.effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {currentStep === 0 ? 'Back to Selection' : 'Previous'}
        </button>
        
        <button
          onClick={handleNext}
          disabled={!selectedTraits[currentTraitKey]}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {currentStep === traitKeys.length - 1 ? 'Start Adventure' : 'Next'}
        </button>
      </div>
      
      {/* Progress indicators */}
      {traitKeys.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {traitKeys.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep 
                  ? 'bg-blue-600' 
                  : index < currentStep 
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
} 