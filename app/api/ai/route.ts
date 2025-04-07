import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { processPlayerAction } from '@/utils/ai';
import { GameState, gameTemplates } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameState, playerAction } = body;
    
    if (!gameState || !playerAction) {
      return NextResponse.json(
        { error: 'Missing required parameters' }, 
        { status: 400 }
      );
    }

    const scenario = gameTemplates[gameState.scenarioName];
    
    if (!scenario) {
      return NextResponse.json(
        { error: 'Invalid scenario' }, 
        { status: 400 }
      );
    }

    const aiResponse = await processPlayerAction(gameState, playerAction, scenario);
    
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in AI endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'API is working' }, 
    { status: 200 }
  );
} 