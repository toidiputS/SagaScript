-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  plan TEXT NOT NULL DEFAULT 'apprentice',
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_words INTEGER DEFAULT 0,
  total_series INTEGER DEFAULT 0,
  total_books INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_writing_days INTEGER DEFAULT 0,
  average_words_per_day INTEGER DEFAULT 0,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create recent_activity table
CREATE TABLE IF NOT EXISTS recent_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  related_title TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL,
  required_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create plan_usage table
CREATE TABLE IF NOT EXISTS plan_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  series_used INTEGER DEFAULT 0,
  series_limit INTEGER NOT NULL,
  ai_prompts_used INTEGER DEFAULT 0,
  ai_prompts_limit INTEGER NOT NULL,
  collaborators_used INTEGER DEFAULT 0,
  collaborators_limit INTEGER NOT NULL,
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activity_user_id ON recent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activity_timestamp ON recent_activity(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_usage_user_id ON plan_usage(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Stats: Users can read and update their own stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recent Activity: Users can read and insert their own activity
CREATE POLICY "Users can view own activity" ON recent_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON recent_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Everyone can read achievements
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User Achievements: Users can read their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions: Users can read their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plan Usage: Users can read their own usage
CREATE POLICY "Users can view own usage" ON plan_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON plan_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON plan_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Create initial user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Create initial plan usage (apprentice plan limits)
  INSERT INTO public.plan_usage (
    user_id,
    series_limit,
    ai_prompts_limit,
    collaborators_limit,
    storage_limit
  )
  VALUES (
    NEW.id,
    3,      -- 3 series for apprentice
    100,    -- 100 AI prompts per month
    0,      -- No collaborators for apprentice
    1073741824  -- 1GB storage limit
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON plan_usage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, type, required_value) VALUES
('First Words', 'Write your first 100 words', 'ri-quill-pen-line', 'word_count', 100),
('Getting Started', 'Write 1,000 words', 'ri-file-text-line', 'word_count', 1000),
('Wordsmith', 'Write 10,000 words', 'ri-book-line', 'word_count', 10000),
('Author', 'Write 50,000 words', 'ri-book-2-line', 'word_count', 50000),
('Novelist', 'Write 100,000 words', 'ri-book-3-line', 'word_count', 100000),
('Streak Starter', 'Write for 3 days in a row', 'ri-fire-line', 'streak', 3),
('Consistent Writer', 'Write for 7 days in a row', 'ri-fire-fill', 'streak', 7),
('Dedicated Author', 'Write for 30 days in a row', 'ri-medal-line', 'streak', 30),
('Chapter Master', 'Complete 10 chapters', 'ri-file-list-line', 'chapter_count', 10),
('Book Author', 'Complete your first book', 'ri-book-mark-line', 'book_count', 1),
('Series Creator', 'Create your first series', 'ri-stack-line', 'series_count', 1),
('Character Creator', 'Create 10 characters', 'ri-user-star-line', 'character_count', 10),
('World Builder', 'Create 5 locations', 'ri-map-pin-line', 'location_count', 5)
ON CONFLICT DO NOTHING;