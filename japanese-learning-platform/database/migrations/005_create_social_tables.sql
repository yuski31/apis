-- Create Study Groups/Clans Table
CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Group Memberships Table
CREATE TABLE group_memberships (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  group_id INTEGER REFERENCES study_groups(id),
  role TEXT CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Create Forum Posts Table
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