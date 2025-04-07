'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/utils/store';
import { GameMessage } from '@/types/game';

export default function GameChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentGame = useGameStore((state) => state.currentGame);
  const sendPlayerMessage = useGameStore((state) => state.sendPlayerMessage);
  const addAIMessage = useGameStore((state) => state.addAIMessage);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentGame?.history]);

  if (!currentGame) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No active game. Please start a new game.</p>
      </div>
    );
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Send player message
    sendPlayerMessage(input);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call API to get AI response
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameState: currentGame,
          playerAction: input,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      addAIMessage(data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      addAIMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Game header */}
      <div className="bg-gray-800 p-4 text-white">
        <h2 className="text-xl font-bold">{currentGame.scenarioName}</h2>
        <p className="text-sm">Turn: {currentGame.currentTurn}</p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentGame.history.map((message: GameMessage) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'ai'
                ? 'bg-gray-700 text-white self-start'
                : 'bg-blue-600 text-white self-end ml-auto'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-300 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || currentGame.isEnded}
            placeholder={
              currentGame.isEnded
                ? "Game ended"
                : isLoading
                ? "AI is thinking..."
                : "What do you want to do?"
            }
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || currentGame.isEnded || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
} 