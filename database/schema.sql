-- Supabase PostgreSQL Schema for 성격팔자 (Seonggyeok-Palja)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personality Types table (MBTI x 팔자유형)
CREATE TABLE public.personality_types (
  code VARCHAR(4) PRIMARY KEY,
  alias TEXT NOT NULL,
  image_url TEXT,
  description TEXT NOT NULL,
  advice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Results table
CREATE TABLE public.analysis_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_type VARCHAR(4) REFERENCES public.personality_types(code),
  mbti_type VARCHAR(4),
  palja_type VARCHAR(20),
  birth_date DATE,
  birth_time TIME,
  lunar_calendar BOOLEAN DEFAULT false,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Synergy Analysis table
CREATE TABLE public.synergy_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_type VARCHAR(4) REFERENCES public.personality_types(code),
  user_type VARCHAR(4) REFERENCES public.personality_types(code),
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Results table
CREATE TABLE public.saved_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  result_type VARCHAR(20) NOT NULL, -- 'analysis' or 'synergy'
  result_id UUID,
  title TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Settings table
CREATE TABLE public.admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX idx_analysis_results_personality_type ON public.analysis_results(personality_type);
CREATE INDEX idx_synergy_analysis_user_id ON public.synergy_analysis(user_id);
CREATE INDEX idx_saved_results_user_id ON public.saved_results(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synergy_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analysis results policies
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analysis results" ON public.analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis results" ON public.analysis_results
  FOR DELETE USING (auth.uid() = user_id);

-- Synergy analysis policies
CREATE POLICY "Users can view own synergy analysis" ON public.synergy_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own synergy analysis" ON public.synergy_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved results policies
CREATE POLICY "Users can manage own saved results" ON public.saved_results
  FOR ALL USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, photo_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();