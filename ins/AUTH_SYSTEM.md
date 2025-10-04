# Authentication and Authorization System

## Overview
This document outlines the authentication and authorization strategy for the AI-powered Japanese learning platform using NextAuth.js with Supabase as the backend.

## 1. Authentication Flow

### 1.1 Supported Authentication Methods

#### Email/Password Authentication
```javascript
// nextauth.config.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/database/users";

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;

        const user = await getUserByEmail(email);
        if (!user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          username: user.username
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  }
};
```

#### OAuth Providers
```javascript
// Additional providers in nextauth.config.js
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

providers: [
  // ... existing credentials provider
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  }),
  GitHub({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET
  })
]
```

#### Magic Link Authentication
```javascript
import EmailProvider from "next-auth/providers/email";

providers: [
  // ... other providers
  EmailProvider({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
    maxAge: 24 * 60 * 60, // 24 hours
    sendVerificationRequest: async ({ identifier, url, provider }) => {
      // Custom email sending logic
      await sendMagicLinkEmail(identifier, url);
    }
  })
]
```

### 1.2 User Registration Flow

#### Sign Up Process
1. User submits registration form
2. Validate input data
3. Check for duplicate email/username
4. Hash password with bcrypt
5. Create user record in Supabase
6. Send verification email
7. Redirect to verification page

```javascript
// app/auth/actions.js
"use server";

import { createUser } from "@/lib/database/users";
import { hash } from "bcryptjs";

export async function registerUser(formData) {
  const { email, password, username, fullName } = formData;

  // Validate input
  if (!email || !password || !username) {
    return { error: "Missing required fields" };
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "User already exists with this email" };
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user
  try {
    const user = await createUser({
      email,
      password_hash: hashedPassword,
      username,
      full_name: fullName
    });

    // Send verification email
    await sendVerificationEmail(email);

    return { success: true, userId: user.id };
  } catch (error) {
    return { error: "Failed to create user" };
  }
}
```

### 1.3 Session Management

#### Session Configuration
```javascript
// nextauth.config.js
export const authConfig = {
  // ... other configurations
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true
};
```

#### Session Refresh
```javascript
// lib/auth/session.js
"use server";

import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function refreshUserSession() {
  const session = await getServerSession(authConfig);

  if (session?.user?.id) {
    // Update last active timestamp
    await updateUserLastActive(session.user.id);

    // Refresh user data if needed
    const updatedUser = await getUserById(session.user.id);

    return {
      ...session,
      user: {
        ...session.user,
        ...updatedUser
      }
    };
  }

  return session;
}
```

## 2. Authorization System

### 2.1 Role-Based Access Control (RBAC)

#### User Roles
```sql
-- Add roles to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN permissions TEXT[];

-- Predefined roles
-- 'admin' - Full access to all features
-- 'moderator' - Can manage content and community
-- 'teacher' - Can create lessons and track student progress
-- 'student' - Standard learner access
-- 'premium' - Student with additional features
```

#### Permission Checking
```javascript
// lib/auth/permissions.js
export function hasPermission(userRole, requiredPermission) {
  const permissionHierarchy = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_content'],
    moderator: ['read', 'write', 'manage_content'],
    teacher: ['read', 'write', 'create_lessons'],
    premium: ['read', 'advanced_features'],
    student: ['read']
  };

  return permissionHierarchy[userRole]?.includes(requiredPermission) || false;
}

export function requirePermission(permission) {
  return async function middleware(req, res) {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasPermission(session.user.role, permission)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return true;
  };
}
```

### 2.2 Resource-Based Access Control

#### Content Access Rules
```javascript
// lib/auth/content-access.js
export async function canAccessContent(userId, contentId, contentType) {
  // Free content accessible to all
  const content = await getContentById(contentId, contentType);
  if (content.is_free) return true;

  // Check user subscription
  const userSubscription = await getUserSubscription(userId);
  if (userSubscription?.is_active) return true;

  // Check if user has purchased this specific content
  const purchase = await getUserContentPurchase(userId, contentId);
  if (purchase) return true;

  // Premium users get access to JLPT N3 and below content
  const user = await getUserById(userId);
  if (user.role === 'premium' && content.jlpt_level >= 3) return true;

  return false;
}
```

#### Progress Data Access
```javascript
// Only users can access their own progress data
// Implemented via RLS in Supabase
CREATE POLICY "Users can view their own progress"
ON user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON user_progress
FOR UPDATE
USING (auth.uid() = user_id);
```

### 2.3 API Route Protection

#### Protected API Routes
```javascript
// app/api/protected/route.js
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function GET(request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Process request
  const data = await getProtectedData(session.user.id);

  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
```

#### Role-Specific API Routes
```javascript
// app/api/admin/route.js
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function GET(request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check admin role
  if (session.user.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Process admin request
  const data = await getAdminData();

  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
```

## 3. Supabase Integration

### 3.1 Supabase Auth Setup
```javascript
// lib/supabase/client.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### 3.2 Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view/edit their own data
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all user data
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
USING ( EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));
```

### 3.3 Custom Claims in JWT
```javascript
// auth.config.js
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.username = user.username;

      // Fetch user role and permissions
      const userData = await getUserById(user.id);
      token.role = userData?.role || 'student';
      token.permissions = userData?.permissions || [];
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.permissions = token.permissions;
    }
    return session;
  }
}
```

## 4. Security Considerations

### 4.1 Password Security
- Minimum 8 characters with complexity requirements
- bcrypt hashing with salt rounds >= 12
- Rate limiting on authentication attempts
- Password reset tokens with expiration

### 4.2 Session Security
- JWT with secure flags
- HttpOnly and SameSite cookies
- Regular session rotation
- Logout on all devices functionality

### 4.3 Data Protection
- Encryption at rest for sensitive data
- TLS encryption for all communications
- Input validation and sanitization
- SQL injection prevention through parameterized queries

### 4.4 Privacy Compliance
- GDPR-compliant data handling
- User data export functionality
- Right to deletion implementation
- Consent management for data processing

## 5. Implementation Roadmap

### Phase 1: Core Authentication
- Email/password authentication
- Session management
- Basic RBAC implementation

### Phase 2: Enhanced Security
- OAuth provider integration
- Magic link authentication
- Advanced session management

### Phase 3: Authorization Features
- Fine-grained permissions system
- Content access control
- Administrative interfaces

### Phase 4: Compliance & Monitoring
- Privacy compliance features
- Security auditing
- Monitoring and alerting