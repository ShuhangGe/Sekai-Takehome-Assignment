-- Create a table for users' saved games
CREATE TABLE IF NOT EXISTS saved_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for game statistics
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  turns_played INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_games
CREATE POLICY "Users can view their own saved games"
  ON saved_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved games"
  ON saved_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved games"
  ON saved_games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved games"
  ON saved_games FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for game_stats
CREATE POLICY "Users can view their own game stats"
  ON game_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game stats"
  ON game_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game stats"
  ON game_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update 'updated_at' column
CREATE TRIGGER update_saved_games_updated_at
BEFORE UPDATE ON saved_games
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_game_stats_updated_at
BEFORE UPDATE ON game_stats
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create a profile for new users
CREATE TRIGGER create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user(); 