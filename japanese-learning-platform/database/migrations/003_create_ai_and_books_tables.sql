-- Create AI Generated Content Table
CREATE TABLE ai_generated_content (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content_type TEXT CHECK (content_type IN ('story', 'dialogue', 'exercise', 'explanation')),
  content JSONB, -- Structured content data
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  topics TEXT[],
  estimated_reading_time INTEGER, -- in minutes
  generated_by TEXT, -- AI model identifier
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false
);

-- Create User Interactions with AI Content Table
CREATE TABLE ai_content_interactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_id INTEGER REFERENCES ai_generated_content(id),
  time_spent INTEGER, -- seconds
  bookmarked_passages JSONB, -- Array of bookmarked sections
  annotations JSONB, -- User annotations on content
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_user ON ai_content_interactions(user_id);

-- Create Books Table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_image_url TEXT,
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  total_pages INTEGER,
  content JSONB, -- Structured book content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT false
);

-- Create Book Reading Progress Table
CREATE TABLE book_reading_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  book_id INTEGER REFERENCES books(id),
  current_page INTEGER,
  last_read TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);