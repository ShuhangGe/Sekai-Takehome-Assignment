import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { GameState, GameMessage, Player, GameScenario } from '../types/game';
import { gameTemplates } from '../types/game';
import { initializePlayerAttributes, initializePlayerSkills } from './ai';
import { saveGameState, loadSavedGames, deleteSavedGame } from './game-persistence';

interface GameStore {
  // Current game state
  currentGame: GameState | null;
  selectedScenario: string;
  
  // Saved games
  savedGames: GameState[];
  isSavingGame: boolean;
  isLoadingSavedGames: boolean;
  
  // Player customizations during setup
  setupCustomizations: Record<string, string>;
  
  // Setup functions
  setSelectedScenario: (scenarioId: string) => void;
  updateSetupCustomization: (key: string, value: string) => void;
  
  // Game functions
  startNewGame: (username: string) => void;
  sendPlayerMessage: (content: string) => void;
  addAIMessage: (content: string) => void;
  endGame: () => void;
  saveGame: () => Promise<boolean>;
  
  // Saved game functions
  loadSavedGames: () => Promise<void>;
  loadGame: (gameState: GameState) => void;
  deleteSavedGame: (gameId: string) => Promise<boolean>;
  
  // Session functions
  resetSetup: () => void;
}

// Create the store with persistence
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentGame: null,
      selectedScenario: 'asian-parent',
      setupCustomizations: {},
      savedGames: [],
      isSavingGame: false,
      isLoadingSavedGames: false,
      
      // Setup functions
      setSelectedScenario: (scenarioId: string) => set({ 
        selectedScenario: scenarioId,
        setupCustomizations: {}  // Reset customizations when changing scenario
      }),
      
      updateSetupCustomization: (key: string, value: string) => set((state) => ({
        setupCustomizations: {
          ...state.setupCustomizations,
          [key]: value
        }
      })),
      
      // Game functions
      startNewGame: (username: string) => {
        const { setupCustomizations, selectedScenario } = get();
        const scenario = gameTemplates[selectedScenario];
        
        if (!scenario) {
          console.error("Invalid scenario selected");
          return;
        }
        
        const attributes = initializePlayerAttributes(scenario, setupCustomizations);
        const skills = initializePlayerSkills(scenario, attributes);
        
        const player: Player = {
          id: uuidv4(),
          username,
          attributes,
          skills,
          customizations: setupCustomizations
        };
        
        const welcomeMessage: GameMessage = {
          id: uuidv4(),
          role: 'ai',
          content: `Welcome to ${scenario["Dnd-Scenario"]}. The game is starting...`,
          timestamp: Date.now()
        };
        
        const newGame: GameState = {
          id: uuidv4(),
          scenarioName: selectedScenario,
          player,
          history: [welcomeMessage],
          currentTurn: 1,
          isEnded: false
        };
        
        set({ 
          currentGame: newGame,
          setupCustomizations: {}  // Reset customizations after game starts
        });
      },
      
      sendPlayerMessage: (content: string) => set((state) => {
        if (!state.currentGame) return state;
        
        const playerMessage: GameMessage = {
          id: uuidv4(),
          role: 'player',
          content,
          timestamp: Date.now()
        };
        
        return {
          currentGame: {
            ...state.currentGame,
            history: [...state.currentGame.history, playerMessage],
            currentTurn: state.currentGame.currentTurn + 1
          }
        };
      }),
      
      addAIMessage: (content: string) => set((state) => {
        if (!state.currentGame) return state;
        
        const aiMessage: GameMessage = {
          id: uuidv4(),
          role: 'ai',
          content,
          timestamp: Date.now()
        };
        
        return {
          currentGame: {
            ...state.currentGame,
            history: [...state.currentGame.history, aiMessage]
          }
        };
      }),
      
      endGame: () => set((state) => {
        if (!state.currentGame) return state;
        
        const endedGame = {
          ...state.currentGame,
          isEnded: true
        };
        
        // Try to save the game state when ending the game
        saveGameState(endedGame).catch(console.error);
        
        return {
          currentGame: endedGame
        };
      }),
      
      saveGame: async () => {
        const { currentGame } = get();
        if (!currentGame) return false;
        
        set({ isSavingGame: true });
        
        try {
          const success = await saveGameState(currentGame);
          
          if (success) {
            // Refresh the saved games list
            get().loadSavedGames();
          }
          
          return success;
        } finally {
          set({ isSavingGame: false });
        }
      },
      
      // Saved game functions
      loadSavedGames: async () => {
        set({ isLoadingSavedGames: true });
        
        try {
          const savedGames = await loadSavedGames();
          set({ savedGames });
        } finally {
          set({ isLoadingSavedGames: false });
        }
      },
      
      loadGame: (gameState: GameState) => {
        set({ currentGame: gameState });
      },
      
      deleteSavedGame: async (gameId: string) => {
        try {
          const success = await deleteSavedGame(gameId);
          
          if (success) {
            // Update the saved games list
            set((state) => ({
              savedGames: state.savedGames.filter(game => game.id !== gameId)
            }));
            
            // If the deleted game is the current game, clear it
            const { currentGame } = get();
            if (currentGame && currentGame.id === gameId) {
              set({ currentGame: null });
            }
          }
          
          return success;
        } catch (error) {
          console.error('Error deleting saved game:', error);
          return false;
        }
      },
      
      // Session functions
      resetSetup: () => set({
        setupCustomizations: {}
      })
    }),
    {
      name: 'game-storage', // Name for localStorage
      partialize: (state) => ({ 
        currentGame: state.currentGame,
        selectedScenario: state.selectedScenario
      }) // Only persist these fields
    }
  )
); 