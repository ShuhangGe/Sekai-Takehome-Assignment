# AI D&D Adventure

An AI-powered text-based adventure game inspired by Dungeons & Dragons, built with Next.js and Supabase.

## Features

- Interactive AI-powered storytelling
- Character creation and customization
- D&D-style dice roll mechanics
- Save and load game progress
- User authentication and profiles
- Game statistics and history

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: Zustand
- **AI Integration**: OpenAI API

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations from the `supabase/migrations` directory
3. Set up the following tables:
   - `profiles`
   - `games`
   - Enable Row Level Security on all tables

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd ai-dnd-adventure

# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
ai-dnd-adventure/
├── app/                    # Next.js App Router 
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── game/               # Game-related pages
│   └── profile/            # User profile page
├── components/             # React components
├── lib/                    # Utility functions and hooks
├── public/                 # Static assets
├── supabase/               # Supabase configuration
│   └── migrations/         # SQL migrations
├── types/                  # TypeScript type definitions
├── .env.local              # Environment variables (create this)
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies
```

## How to Play

1. Sign up or log in to your account
2. Start a new game by creating a character
3. Navigate through the adventure by responding to the AI dungeon master
4. Make skill checks using dice rolls
5. Save your progress to continue later

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
