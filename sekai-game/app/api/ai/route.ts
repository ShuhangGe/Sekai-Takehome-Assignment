import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CustomStory, TraitOption } from '@/types/custom-story';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define scenario type
interface Scenario {
  title: string;
  introduction: string;
  systemPrompt: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Game scenarios with their system prompts
const scenarios: Record<string, Scenario> = {
  'asian-parent': {
    title: 'Raising Your Asian Child (Helicopter Parent Edition)',
    introduction: 'Welcome to the challenging world of helicopter parenting an Asian child. Your goal is to balance academic excellence, extracurricular activities, and cultural traditions.',
    systemPrompt: `You are the Dungeon Master for a hilarious role-playing game called "Raising Your Asian Child (Helicopter Parent Edition)". The player takes on the role of an Asian helicopter parent trying to raise the perfect child.

The game should be humorous but not offensive, poking fun at the stereotype of the demanding Asian parent in a lighthearted way. 

As the DM, you should:
1. Present the player with realistic parenting scenarios and decisions
2. React to their choices with appropriate consequences
3. Track the child's statistics: Academic Performance, Mental Health, Social Skills, and Cultural Connection
4. Occasionally have the player make skill checks by rolling dice (interpret any mention of dice rolls as a D20 roll)
5. Keep the tone humorous but with thoughtful moments about the challenges of parenting

Use descriptions that bring the suburban Asian American family experience to life. Reference things like SAT prep, violin/piano lessons, math competitions, prestigious colleges, comparing to cousins/neighbors' children, etc.

When the player rolls dice, interpret the results:
- 1-5: Failure with consequences
- 6-10: Partial success with complications
- 11-15: Success with minor drawbacks
- 16-19: Complete success
- 20: Critical success with additional benefits

Begin the game with the player's child in elementary school, and guide them through various scenarios.`
  },
  'trump-advisor': {
    title: 'White House Chaos: Trump\'s Advisor',
    introduction: 'Welcome to the chaotic Trump White House. As a presidential advisor, you must navigate crises, presidential tantrums, and the complex political landscape of Washington.',
    systemPrompt: `You are the Dungeon Master for a satirical role-playing game called "White House Chaos: Trump's Advisor". The player takes on the role of an advisor in the chaotic Trump White House.

The game should be a satirical political comedy that exaggerates real-world politics for humorous effect. It should be politically balanced with humor directed at both sides of the aisle, though centered on surviving the unpredictable nature of the Trump administration.

As the DM, you should:
1. Present the player with political scenarios and crises requiring their advice
2. React to their choices with appropriate consequences
3. Track their standing with Trump, Public Approval, Staff Loyalty, and Media Relations
4. Occasionally have the player make skill checks by rolling dice (interpret any mention of dice rolls as a D20 roll)
5. Keep the tone satirical and humorous while offering a lighthearted take on political drama

Use descriptions that bring the chaotic White House environment to life. Reference things like tweets, media briefings, cabinet meetings, foreign leaders, political rivals, etc.

When the player rolls dice, interpret the results:
- 1-5: Catastrophic failure (Trump is furious)
- 6-10: Failure with media leaks
- 11-15: Moderate success with complications
- 16-19: Success that pleases Trump
- 20: Extraordinary success (promotion or public praise from Trump)

Begin the game with the player's first day as an advisor, and guide them through various political scenarios.`
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      scenarioId, 
      message, 
      messageHistory = [],
      customStory,
      characterTraits = {}
    } = body;

    // Check if we're using a custom story or a built-in scenario
    const isCustomStory = customStory && scenarioId.startsWith('custom-');
    
    // Get the appropriate scenario
    let scenario: Scenario;
    
    if (isCustomStory) {
      // For custom stories, create a scenario object from the custom story
      scenario = {
        title: customStory.title,
        introduction: customStory.introduction,
        systemPrompt: customStory.systemPrompt
      };
    } else {
      // Validate built-in scenario
      if (!scenarios[scenarioId as string]) {
        return NextResponse.json({ error: 'Invalid scenario ID' }, { status: 400 });
      }
      
      scenario = scenarios[scenarioId as string];
    }

    // Handle different actions
    if (action === 'start') {
      // Starting a new game
      let systemPrompt = scenario.systemPrompt;
      
      // If this is a custom story and has character traits selected,
      // append them to the system prompt
      if (isCustomStory && Object.keys(characterTraits).length > 0) {
        systemPrompt += '\n\nPlayer character details:\n';
        
        for (const [traitKey, selectedOption] of Object.entries(characterTraits)) {
          const trait = customStory.characterTraits[traitKey];
          if (trait) {
            const option = trait.options.find((opt: TraitOption) => opt.name === selectedOption);
            if (option) {
              systemPrompt += `\n${trait.name}: ${option.name} - ${option.effect}\n`;
            }
          }
        }
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: "I'd like to start playing this game. Please introduce the scenario and give me my first situation to respond to."
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return NextResponse.json({
        message: scenario.introduction + "\n\n" + response.choices[0].message.content,
      });
    } 
    else if (action === 'chat') {
      // Continue conversation
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      // Prepare message history for the API
      // We'll only keep the last 10 messages to prevent excessive token usage
      const recentMessages = messageHistory.slice(-10);
      
      // Create the system prompt, adding character traits if applicable
      let systemPrompt = scenario.systemPrompt;
      
      if (isCustomStory && Object.keys(characterTraits).length > 0) {
        systemPrompt += '\n\nPlayer character details:\n';
        
        for (const [traitKey, selectedOption] of Object.entries(characterTraits)) {
          const trait = customStory.characterTraits[traitKey];
          if (trait) {
            const option = trait.options.find((opt: TraitOption) => opt.name === selectedOption);
            if (option) {
              systemPrompt += `\n${trait.name}: ${option.name} - ${option.effect}\n`;
            }
          }
        }
      }
      
      const apiMessages = [
        {
          role: "system",
          content: systemPrompt
        },
        ...recentMessages.map((msg: Message) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return NextResponse.json({
        message: response.choices[0].message.content,
      });
    } 
    else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } 
  catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 