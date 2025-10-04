-- Create Spaced Repetition System (SRS) Cards Table
CREATE TABLE srs_cards (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_type TEXT CHECK (content_type IN ('character', 'word', 'grammar')),
  content_id INTEGER,
  ease_factor NUMERIC(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_srs_user_content ON srs_cards(user_id, content_type, content_id);
CREATE INDEX idx_srs_next_review ON srs_cards(next_review);

-- Create User Performance Data Table
CREATE TABLE user_performance (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_type TEXT CHECK (content_type IN ('character', 'word', 'grammar')),
  content_id INTEGER,
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE,
  accuracy_rate NUMERIC(5,2),
  avg_response_time NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performance_user ON user_performance(user_id);
CREATE INDEX idx_performance_content ON user_performance(content_type, content_id);

-- Create Lesson Modules Table
CREATE TABLE lesson_modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  estimated_duration INTEGER, -- in minutes
  prerequisites INTEGER[], -- References to other module IDs
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Lesson Items Table
CREATE TABLE lesson_items (
  id SERIAL PRIMARY KEY,
  lesson_module_id INTEGER REFERENCES lesson_modules(id),
  content_type TEXT CHECK (content_type IN ('character', 'word', 'grammar')),
  content_id INTEGER,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lesson_items_module ON lesson_items(lesson_module_id);

-- Create User Lesson Progress Table
CREATE TABLE user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  lesson_module_id INTEGER REFERENCES lesson_modules(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_percentage NUMERIC(5,2),
  quiz_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_module_id)
);

CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);