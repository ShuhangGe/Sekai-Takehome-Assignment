'use client';

import { useState, useEffect, useRef } from 'react';
import { FaDiceD20 } from 'react-icons/fa';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GameChatProps {
  scenarioId: string;
  scenarioTitle: string;
  onBack: () => void;
}

export default function GameChat({ scenarioId, scenarioTitle, onBack }: GameChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize the game
  useEffect(() => {
    const startGame = async () => {
      if (!gameStarted) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'start',
              scenarioId: scenarioId
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to start game');
          }

          const data = await response.json();
          setMessages([{
            role: 'assistant',
            content: data.message
          }]);
          setGameStarted(true);
        } catch (error) {
          console.error('Error starting game:', error);
          setMessages([{
            role: 'system',
            content: 'There was an error starting the game. Please try again later.'
          }]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    startGame();
  }, [scenarioId, gameStarted]);

  // Roll a D20 dice
  const rollDice = () => {
    const result = Math.floor(Math.random() * 20) + 1;
    
    // Add dice roll message
    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: `🎲 You rolled a ${result}${result === 20 ? ' (Critical Success!)' : result === 1 ? ' (Critical Failure!)' : ''}`
      }
    ]);

    return result;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage }
    ]);

    // Check for dice roll command
    if (userMessage.toLowerCase().includes('/roll') || userMessage.toLowerCase().includes('roll dice')) {
      rollDice();
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          scenarioId: scenarioId,
          message: userMessage,
          messageHistory: messages.filter(m => m.role !== 'system')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content: 'There was an error getting a response. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[80vh]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{scenarioTitle}</h2>
          <p className="text-sm text-blue-100">AI Dungeon Master</p>
        </div>
        <button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm"
        >
          Exit Game
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 && isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-2 text-gray-500">Loading adventure...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-auto'
                    : message.role === 'system'
                    ? 'bg-gray-200 mx-auto text-center'
                    : 'bg-white border border-gray-200 mr-auto'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <button
            onClick={rollDice}
            className="bg-purple-600 text-white p-2 rounded-full mr-2 hover:bg-purple-500"
            title="Roll D20 Dice"
            aria-label="Roll dice"
          >
            <FaDiceD20 className="text-xl" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Enter your action..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-r-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Type /roll to roll a D20 dice
        </p>
      </div>
    </div>
  );
} 