# Database Schema Design

## Overview
This document outlines the database schema for the AI-powered Japanese learning platform. We'll use Supabase (PostgreSQL) with Row Level Security to ensure data privacy and security.

## Core Entities

### 1. Users
```sql
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
```

### 2. Learning Content

#### Characters (Kanji/Hiragana/Katakana)
```sql
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
```

#### Words
```sql
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
```

#### Grammar Points
```sql
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
```

### 3. User Progress Tracking

#### Spaced Repetition System (SRS)
```sql
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
```

#### User Performance Data
```sql
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
```

### 4. Lessons and Curriculum

#### Lesson Modules
```sql
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
```

#### Lesson Items
```sql
CREATE TABLE lesson_items (
  id SERIAL PRIMARY KEY,
  lesson_module_id INTEGER REFERENCES lesson_modules(id),
  content_type TEXT CHECK (content_type IN ('character', 'word', 'grammar')),
  content_id INTEGER,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lesson_items_module ON lesson_items(lesson_module_id);
```

#### User Lesson Progress
```sql
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
```

### 5. AI-Generated Content

#### Generated Stories/Dialogues
```sql
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
```

#### User Interactions with AI Content
```sql
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
```

### 6. Interactive Books

#### Books
```sql
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
```

#### Book Reading Progress
```sql
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
```

### 7. Practice Exercises and Games

#### Exercise Types
```sql
CREATE TABLE exercise_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  content_type TEXT CHECK (content_type IN ('character', 'word', 'grammar')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Exercises
```sql
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  exercise_type_id INTEGER REFERENCES exercise_types(id),
  content JSONB, -- Exercise-specific content structure
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  jlpt_level INTEGER CHECK (jlpt_level BETWEEN 1 AND 5),
  time_limit INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Exercise Attempts
```sql
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
```

### 8. Social Features

#### Study Groups/Clans
```sql
CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Group Memberships
```sql
CREATE TABLE group_memberships (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  group_id INTEGER REFERENCES study_groups(id),
  role TEXT CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);
```

#### Forum Posts
```sql
CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  group_id INTEGER REFERENCES study_groups(id),
  title TEXT,
  content TEXT,
  parent_post_id INTEGER REFERENCES forum_posts(id), -- For replies
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_forum_posts_group ON forum_posts(group_id);
CREATE INDEX idx_forum_posts_parent ON forum_posts(parent_post_id);
```

### 9. Analytics and Progress Tracking

#### Study Sessions
```sql
CREATE TABLE study_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- seconds
  activities JSONB, -- Record of activities during session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(start_time);
```

#### Achievements/Badges
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB, -- Conditions to unlock achievement
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Achievements
```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id INTEGER REFERENCES achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

### 10. AI Conversation History

#### Conversations
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  conversation_type TEXT CHECK (conversation_type IN ('free_chat', 'roleplay', 'pronunciation', 'grammar')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
```

#### Messages
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  sender_type TEXT CHECK (sender_type IN ('user', 'ai')),
  content TEXT,
  translated_content JSONB, -- {language: translation}
  audio_url TEXT,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

## Relationships Summary

1. **Users** are connected to most entities as they interact with the system
2. **Characters/Words/Grammar** form the core learning content
3. **SRS Cards** and **Performance Data** track individual learning progress
4. **Lesson Modules** and **Items** structure the curriculum
5. **AI Generated Content** provides personalized learning materials
6. **Books** and **Reading Progress** enable extensive reading practice
7. **Exercises** and **Attempts** track practice performance
8. **Study Groups** and **Forum Posts** facilitate social learning
9. **Study Sessions** and **Achievements** provide engagement metrics
10. **Conversations** and **Messages** store AI interaction history

## Indexing Strategy

- Primary keys on all tables
- Foreign key indexes for relationship navigation
- Composite indexes for common query patterns
- Functional indexes for computed fields
- Partial indexes for filtered queries

## Security Considerations

- Row Level Security (RLS) policies for all user-related data
- Views for aggregated analytics that don't expose individual user data
- Encrypted storage for sensitive user information
- Audit trails for administrative actions