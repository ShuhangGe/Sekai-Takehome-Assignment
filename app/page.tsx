'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-20">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            AI D&D Adventure
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Experience interactive storytelling powered by AI. Choose your scenario, customize your character, and embark on a unique adventure.
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-blue-800 bg-opacity-30 p-6 rounded-lg border border-blue-700">
              <h2 className="text-2xl font-semibold mb-4">Choose Your Adventure</h2>
              <p className="text-blue-200">
                Multiple scenarios to explore, from raising an Asian child as a helicopter parent to navigating the chaos of the White House as Trump's advisor. Each offers unique challenges and skills.
              </p>
            </div>
            
            <div className="bg-blue-800 bg-opacity-30 p-6 rounded-lg border border-blue-700">
              <h2 className="text-2xl font-semibold mb-4">Shape Your Character</h2>
              <p className="text-blue-200">
                Customize your character with different backgrounds, roles, and styles. Your choices influence your attributes and skills, affecting how the story unfolds.
              </p>
            </div>
            
            <div className="bg-blue-800 bg-opacity-30 p-6 rounded-lg border border-blue-700">
              <h2 className="text-2xl font-semibold mb-4">Dynamic Storytelling</h2>
              <p className="text-blue-200">
                Every decision matters. Our AI adapts the narrative based on your choices, dice rolls, and character abilities, creating a unique experience with each playthrough.
              </p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/auth" 
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-lg text-center transition-colors"
              >
                Sign In to Play
              </Link>
              <Link 
                href="/auth" 
                className="bg-transparent hover:bg-blue-700 text-blue-300 font-medium py-3 px-8 rounded-lg border border-blue-500 text-center transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block relative h-[500px] bg-blue-900 bg-opacity-30 rounded-lg overflow-hidden border border-blue-700">
            {/* Placeholder for game screenshot or illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-6 border-4 border-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎮</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Gameplay</h3>
                <p className="text-blue-300">
                  Engage in dialogue, make decisions, and watch the story transform based on your choices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 