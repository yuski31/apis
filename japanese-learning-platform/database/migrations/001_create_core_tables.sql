-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timezone TEXT,
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  learning_goals TEXT[],
  interests TEXT[]
);

-- RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Create Characters Table
CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  character TEXT NOT NULL,
  type TEXT CHECK (type IN ('hiragana', 'katakana', 'kanji')),
  meaning TEXT[],
  readings JSONB, -- {onyomi: [], kunyomi: []}
  stroke_count INTEGER,
  stroke_diagram_url TEXT,
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  frequency_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_characters_type ON characters(type);
CREATE INDEX idx_characters_jlpt ON characters(jlpt_level);

-- Create Words Table
CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  reading TEXT,
  meanings JSONB, -- [{meaning: "", example_sentences: []}]
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  frequency_rank INTEGER,
  part_of_speech TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_words_jlpt ON words(jlpt_level);
CREATE INDEX idx_words_reading ON words(reading);

-- Create Grammar Points Table
CREATE TABLE grammar_points (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  structure TEXT NOT NULL,
  meaning TEXT NOT NULL,
  usage_notes TEXT,
  examples JSONB, -- [{japanese: "", english: ""}]
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  related_grammar INTEGER[], -- References to other grammar point IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grammar_jlpt ON grammar_points(jlpt_level);