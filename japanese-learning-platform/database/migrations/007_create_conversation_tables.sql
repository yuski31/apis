-- Create Conversations Table
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

-- Create Messages Table
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