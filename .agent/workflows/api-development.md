---
description: API Worker development and endpoints
domain: workers/api/src/index.ts, workers/api/src/*.ts
owner: API Development Agent
---

# API Development

## Scope & Ownership

This agent owns the **Cloudflare Workers API** that serves the frontend. Primary files:

- `workers/api/src/index.ts` - Main Hono app and all routes
- `workers/api/wrangler.toml` - Worker configuration

## Current Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/search` | Search articles with filters | No |
| GET | `/api/export` | Export filtered results as CSV | No |
| GET | `/api/stats` | Trending mutations, topics, treatments | No |
| GET | `/api/database-stats` | Database metrics and coverage | No |
| GET | `/api/ontology` | Reference lists (diseases, mutations, treatments) | No |
| GET | `/api/study/:id` | Single study details | No |
| POST | `/api/parse-query` | AI: Parse natural language to filters | No |
| POST | `/api/summarize` | AI: Generate research insights | No |
| GET | `/api/news/:topic` | Fetch news for disease group | No |

## Tech Stack

- **Framework**: Hono (lightweight, Cloudflare-native)
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Cloudflare Workers AI (LLaMA models)
- **Storage**: Cloudflare R2 (for future asset storage)

## Adding a New Endpoint

1. Add route in `index.ts` following Hono patterns:
```typescript
app.get('/api/new-endpoint', async (c) => {
    const db = c.env.DB;
    // Query D1
    const result = await db.prepare('SELECT ...').all();
    return c.json({ data: result.results });
});
```

2. Update this workflow with endpoint documentation
3. Update `README.md` API documentation section

## Query Patterns

### D1 Parameterized Queries
```typescript
// Always use parameterized queries
const result = await db
    .prepare('SELECT * FROM studies WHERE disease = ?')
    .bind(disease)
    .all();
```

### Pagination
```typescript
const limit = parseInt(c.req.query('limit') || '50');
const offset = parseInt(c.req.query('offset') || '0');
// Add to query: LIMIT ? OFFSET ?
```

### Multi-value Filters
```typescript
const mutations = c.req.query('mutation')?.split(',') || [];
if (mutations.length > 0) {
    const placeholders = mutations.map(() => '?').join(',');
    query += ` AND m.gene_symbol IN (${placeholders})`;
    params.push(...mutations);
}
```

## AI Endpoints

### Parse Query (`/api/parse-query`)
Uses Workers AI to convert natural language to structured filters.
- Model: `@cf/meta/llama-3-8b-instruct`
- Prompt engineering in endpoint code

### Summarize (`/api/summarize`)
Generates research insights from article set.
- Model: `@cf/meta/llama-2-7b-chat-fp16`
- Limited to 15 articles per request for token limits

## Future Endpoints (Planned)

- [ ] `POST /api/save-search` - Save search for authenticated user
- [ ] `GET /api/user/searches` - Get user's saved searches
- [ ] `POST /api/generate-asset` - Generate exportable asset
- [ ] `GET /api/user/assets` - Get user's generated assets

## Local Development

```bash
cd workers/api
npm install
wrangler dev  # Runs on http://localhost:8787
```

## Deployment

```bash
cd workers/api
wrangler deploy
```

## Testing Checklist

- [ ] Endpoint returns valid JSON
- [ ] Error cases return appropriate status codes
- [ ] Query parameters validated
- [ ] D1 queries use parameterized binding
- [ ] CORS headers set for frontend access
