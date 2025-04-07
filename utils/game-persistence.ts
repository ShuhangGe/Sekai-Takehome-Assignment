import { supabase } from '@/lib/supabase';
import { GameState } from '@/types/game';

export async function saveGameState(gameState: GameState): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('User not authenticated');
      return false;
    }

    const userId = userData.user.id;
    
    // Check if a saved game with this ID already exists
    const { data: existingGame } = await supabase
      .from('saved_games')
      .select('id')
      .eq('user_id', userId)
      .eq('id', gameState.id)
      .single();
    
    if (existingGame) {
      // Update the existing game
      const { error } = await supabase
        .from('saved_games')
        .update({
          game_state: gameState,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameState.id);
      
      if (error) {
        console.error('Error updating saved game:', error);
        return false;
      }
    } else {
      // Insert a new saved game
      const { error } = await supabase
        .from('saved_games')
        .insert({
          id: gameState.id,
          user_id: userId,
          game_state: gameState,
        });
      
      if (error) {
        console.error('Error saving game:', error);
        return false;
      }
      
      // Update user game stats
      await supabase
        .from('game_stats')
        .upsert({
          user_id: userId,
          scenario_name: gameState.scenarioName,
          turns_played: gameState.currentTurn,
          completed: gameState.isEnded,
        }, { onConflict: 'user_id, scenario_name' });
    }
    
    // Update games_played in user profile if this is a newly finished game
    if (gameState.isEnded) {
      await supabase
        .from('profiles')
        .update({ 
          games_played: supabase.sql`games_played + 1` 
        })
        .eq('id', userId);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
}

export async function loadSavedGames(): Promise<GameState[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('User not authenticated');
      return [];
    }

    const userId = userData.user.id;
    
    const { data, error } = await supabase
      .from('saved_games')
      .select('game_state')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error loading saved games:', error);
      return [];
    }
    
    return data.map(item => item.game_state as GameState);
  } catch (error) {
    console.error('Error loading saved games:', error);
    return [];
  }
}

export async function deleteSavedGame(gameId: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('User not authenticated');
      return false;
    }

    const userId = userData.user.id;
    
    const { error } = await supabase
      .from('saved_games')
      .delete()
      .eq('id', gameId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting saved game:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting saved game:', error);
    return false;
  }
} 