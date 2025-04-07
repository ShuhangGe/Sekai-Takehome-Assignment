# AI D&D Adventure

An interactive, text-based, AI-powered Dungeons & Dragons (D&D)-style game built with Next.js and Supabase.

## Features

- User authentication with Supabase
- Interactive AI-powered gameplay using OpenAI
- Multiple game scenarios with unique attributes and skills
- Character customization that affects gameplay
- Dynamic storytelling that adapts to player choices
- Dice roll mechanics for skill checks and actions

## Game Scenarios

The application includes multiple scenarios:

1. **Raising Your Asian Child (Helicopter Parent Edition)**: Navigate the challenges of being a helicopter parent trying to raise the perfect Asian child.
2. **White House Chaos: Trump's Advisor**: Attempt to survive as an advisor in the chaotic Trump White House, managing crises and presidential tantrums.

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **AI Integration**: OpenAI API
- **State Management**: Zustand

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Environment Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   ```

### Supabase Setup

1. Create a new project in Supabase
2. Enable email authentication in Authentication settings
3. Copy your project URL and anon key to your `.env.local` file

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Game Flow

1. **Authentication**: Sign up or log in to your account
2. **Scenario Selection**: Choose a game scenario
3. **Character Customization**: Select your character's attributes and background
4. **Gameplay**: Interact with the AI storyteller, make choices, and see how the story unfolds based on your decisions and dice rolls

## Development

### Project Structure

- `app/`: Next.js app directory with pages and routes
- `components/`: React components
- `lib/`: Utility libraries for Supabase and OpenAI
- `utils/`: Helper functions and game logic
- `types/`: TypeScript type definitions
- `public/`: Static assets

## License

This project is for educational purposes only.

## Credits

- Scenarios inspired by the Sekai takehome assignment
- Built using OpenAI's GPT models for dynamic storytelling
