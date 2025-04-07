import openai from '../lib/openai';
import { GameState, GameScenario } from '../types/game';

// Function to generate a game introduction based on the scenario
export async function generateGameIntroduction(scenario: GameScenario): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Dungeon Master for a role-playing game based on the scenario: "${scenario["Dnd-Scenario"]}". 
            Create an engaging and immersive introduction to the game. Use a second-person narrative style to pull the player into the world.
            The starting point for the scenario is: "${scenario.startingPoint}".
            Make it fun, engaging, and set the stage for an interactive adventure.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Welcome to the game!";
  } catch (error) {
    console.error("Error generating game introduction:", error);
    return "Welcome to the game! (Error generating custom introduction)";
  }
}

// Function to get customization options description
export async function getCustomizationDescription(scenario: GameScenario): Promise<string> {
  try {
    const customizationKeys = Object.keys(scenario.playerCustomizations);
    const customizationDescriptions = customizationKeys.map(key => {
      const customization = scenario.playerCustomizations[key];
      const options = Object.keys(customization.content).map(option => {
        return `- ${option}: ${customization.content[option].description}`;
      }).join('\n');

      return `${key}: ${customization.description}\nOptions:\n${options}`;
    }).join('\n\n');

    return customizationDescriptions;
  } catch (error) {
    console.error("Error generating customization description:", error);
    return "Customization options not available.";
  }
}

// Function to process player action and generate AI response
export async function processPlayerAction(
  gameState: GameState,
  playerAction: string,
  scenario: GameScenario
): Promise<string> {
  try {
    // Create a context summary of the game state so far
    const contextMessages = gameState.history.slice(-5).map(msg => {
      return {
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content
      };
    });

    // Generate a D20 dice roll result (1-20)
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    
    // Prepare player attributes and skills context
    const playerAttributes = Object.entries(gameState.player.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    const playerSkills = Object.entries(gameState.player.skills)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    const playerCustomizations = Object.entries(gameState.player.customizations)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are the Dungeon Master for a role-playing game based on: "${scenario["Dnd-Scenario"]}".
            
            The player's attributes are: ${playerAttributes}
            The player's skills are: ${playerSkills}
            The player's customizations are: ${playerCustomizations}
            
            You should:
            1. Interpret the player's action
            2. Consider the player's attributes and skills that might be relevant
            3. Take into account the randomly generated D20 roll: ${diceRoll} (higher is better)
            4. Determine the outcome and narrate the result in an engaging way
            5. End with a prompt or question that encourages the player's next action
            
            Keep the tone consistent with the scenario. Be creative and immersive.
            Remember the game's history and maintain continuity. Good outcomes should generally
            correspond with higher dice rolls, especially if the player has relevant high attributes.`
        },
        ...contextMessages,
        {
          role: "user",
          content: playerAction
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Something happens...";
  } catch (error) {
    console.error("Error processing player action:", error);
    return "The system is experiencing some issues. Please try again.";
  }
}

// Function to initialize a player's attributes based on customizations
export function initializePlayerAttributes(
  scenario: GameScenario,
  customizations: Record<string, string>
): Record<string, number> {
  const attributes: Record<string, number> = {};
  
  // Set base attributes to 5
  Object.keys(scenario.attributes).forEach(attribute => {
    attributes[attribute] = 5;
  });
  
  // Apply bonuses from customizations
  Object.entries(customizations).forEach(([customizationType, selection]) => {
    const customization = scenario.playerCustomizations[customizationType];
    if (customization && customization.content[selection]) {
      const bonuses = customization.content[selection].attributeBonus;
      
      Object.entries(bonuses).forEach(([attribute, bonus]) => {
        if (attributes[attribute] !== undefined) {
          attributes[attribute] += bonus;
        }
      });
    }
  });
  
  return attributes;
}

// Function to initialize player skills based on attributes
export function initializePlayerSkills(
  scenario: GameScenario,
  attributes: Record<string, number>
): Record<string, number> {
  const skills: Record<string, number> = {};
  
  Object.entries(scenario.baseSkills).forEach(([skillName, skill]) => {
    const attributeValue = attributes[skill.attribute] || 0;
    skills[skillName] = attributeValue;
  });
  
  return skills;
} 