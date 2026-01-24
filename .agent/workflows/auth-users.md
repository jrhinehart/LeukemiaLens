---
description: User authentication with Clerk and user data management
domain: workers/api (auth middleware), frontend (Clerk components), D1 (user tables)
owner: Auth & Users Agent
---

# Authentication & User Management

## Scope & Ownership

This agent owns **user authentication via Clerk** and user-specific data management. This is a **planned feature** based on ROADMAP specifications.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Pages SPA)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ <SignIn/>   │  │ <SignUp/>   │  │ <UserButton/>       │  │
│  │ Clerk       │  │ Clerk       │  │ Session Management  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    Authorization: Bearer <JWT>
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Worker                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Auth Middleware                                      │    │
│  │ • Extract token from header/cookie                   │    │
│  │ • Verify with Clerk SDK                              │    │
│  │ • Return userId + claims                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ Public Routes │  │ Auth Routes   │  │ Admin Routes  │   │
│  │ (optional id) │  │ (require id)  │  │ (require role)│   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ D1 Database     │
                    │ • users         │
                    │ • search_history│
                    │ • assets        │
                    └─────────────────┘
```

## Clerk Setup

### Environment Variables
```
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_JWT_KEY=<your-jwt-verification-key>
```

### Frontend Integration
```tsx
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <App />
</ClerkProvider>

// Components
import { SignIn, SignUp, UserButton, useAuth } from '@clerk/clerk-react';
```

### Worker Auth Middleware
```typescript
import { verifyToken } from '@clerk/backend';

interface AuthContext {
    userId: string;
    email?: string;
    role?: string;
}

async function requireUser(c: Context): Promise<AuthContext | null> {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
                  || c.req.cookie('__session');
    
    if (!token) return null;
    
    try {
        const payload = await verifyToken(token, {
            jwtKey: c.env.CLERK_JWT_KEY,
        });
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    } catch {
        return null;
    }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,        -- Clerk userId
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user',   -- 'user', 'premium', 'admin'
    plan TEXT DEFAULT 'free',
    created_at TEXT,
    updated_at TEXT
);
```

### Search History
```sql
CREATE TABLE search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    query TEXT,
    filters_json TEXT,          -- JSON of applied filters
    result_count INTEGER,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### User Assets
```sql
CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT,                  -- 'export', 'report', 'visualization'
    r2_key TEXT,                -- Path in R2
    metadata_json TEXT,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Route Protection Levels

### Public Routes
```typescript
app.get('/api/search', async (c) => {
    const auth = await maybeUser(c);  // Optional auth
    // Log user if present, allow anonymous
});
```

### Auth-Required Routes
```typescript
app.post('/api/save-search', async (c) => {
    const auth = await requireUser(c);
    if (!auth) return c.json({ error: 'Unauthorized' }, 401);
    // Proceed with auth.userId
});
```

### Role-Based Routes
```typescript
app.get('/api/admin/users', async (c) => {
    const auth = await requireUser(c);
    if (!auth || auth.role !== 'admin') {
        return c.json({ error: 'Forbidden' }, 403);
    }
    // Admin-only logic
});
```

## Webhook Handling

**Clerk Webhook Endpoint** (`POST /api/webhooks/clerk`)
```typescript
app.post('/api/webhooks/clerk', async (c) => {
    // Verify webhook signature
    const payload = await c.req.json();
    
    switch (payload.type) {
        case 'user.created':
            await db.prepare(
                'INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)'
            ).bind(payload.data.id, payload.data.email, new Date().toISOString()).run();
            break;
            
        case 'user.deleted':
            await db.prepare('DELETE FROM users WHERE id = ?').bind(payload.data.id).run();
            // Also clean up search_history and assets
            break;
    }
    
    return c.json({ received: true });
});
```

## Implementation Phases

### Phase 1: Basic Auth
- [ ] Clerk account setup
- [ ] Frontend Clerk components
- [ ] Worker auth middleware
- [ ] Users table in D1

### Phase 2: User Features
- [ ] Save search endpoint
- [ ] Search history retrieval
- [ ] User profile page

### Phase 3: Asset Management
- [ ] Asset creation endpoints
- [ ] R2 storage integration
- [ ] User asset gallery

### Phase 4: Roles & Quotas
- [ ] Role-based access control
- [ ] Usage quotas and limits
- [ ] Premium feature gating

## Testing Checklist

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] JWT verification succeeds for valid tokens
- [ ] 401 returned for invalid/missing tokens
- [ ] User created in D1 via webhook
- [ ] User data isolated per userId
- [ ] Role checks work correctly
