-- Create Exercise Types Table
CREATE TABLE exercise_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  content_type TEXT CHECK (content_type IN ('character', 'word', 'grammar')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Exercises Table
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  exercise_type_id INTEGER REFERENCES exercise_types(id),
  content JSONB, -- Exercise-specific content structure
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  time_limit INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Exercise Attempts Table
CREATE TABLE user_exercise_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_id INTEGER REFERENCES exercises(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INTEGER, -- seconds
  score NUMERIC(5,2),
  is_correct BOOLEAN,
  user_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercise_attempts_user ON user_exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_exercise ON user_exercise_attempts(exercise_id);