# LeukemiaLens Roadmap & Design Guidelines

This document tracks planned features, architectural decisions, and design instructions for development.

---

## Architectural Principles

<!-- Add your high-level architectural guidance here -->

### Tech Stack Decisions
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Cloudflare Workers (Hono framework) + D1 SQLite
- **AI**: Cloudflare Workers AI (LLaMA models) + Hosted Claude
- **Hosting**: Cloudflare Pages

### Design Philosophy
- Patient-first, compassionate design
- Dark mode support pending
- Accessibility a priority

---

## Design Instructions

<!-- Add specific design guidelines, color palettes, component patterns, etc. -->

### UI/UX Guidelines
- 

### Component Patterns
- 

---

## Roadmap

### 🚀 In Progress
- [ ] User Authentication with Clerk
- [ ] PDF Generation and R2 Storage for Research Insights (Downloadable Reports)

### 📋 Planned (High Priority)
- [ ] Enhanced Patient Knowledge Graph
- [ ] Real-time Clinical Trial matching

### 💡 Future Ideas
- [ ] 

### ✅ Completed
- [x] Landing page with disease group navigation (Myeloid, Lymphoid, Myeloma)
- [x] Disease-specific resource pages with treatments and live news
- [x] Educational hub for newly diagnosed patients (Blood Cell Production, Mutations, Risk Stratification, Stem Cell Transplants)
- [x] AI-powered Smart Search and Research Insights
- [x] RAG-enhanced Research Insights with full-text synthesis (Claude 3.5 Sonnet)
- [x] Persistent Research Insights history (D1 storage) with shareable links
- [x] Interactive Deep Research follow-up chat via /api/rag/query
- [x] Unified RAG orchestration pipeline (`backfill-production.ts`) with GPU acceleration
- [x] High-density Stats page redesign with mobile optimization and compact metrics
- [x] Automatic deduplication and "Skip Recording" for non-OA/incompatible articles
- [x] Grouped mutation filtering (Functional Categories / ELN 2022 Risk)
- [x] Treatment filtering with protocol component resolution
- [x] Responsive mobile design with collapsible filter drawer
- [x] CSV export for research results
- [x] Database statistics dashboard

---

## Notes & Ideas

<!-- Add any additional notes, brainstorming, or reference links -->

### Hybrid Ingestion Strategy and AI Pipeline:
No GPU needed, and your low CPU + 70% RAM setup is workable for a CPU‑only RAG pipeline, especially with Claude handling the heavy inference.

### CPU‑only RAG is realistic

With Claude in the cloud via AI Gateway, your Unraid container handles lighter tasks: PDF → text extraction, chunking, embedding generation (small CPU‑optimized models), and R2/D1 sync. Users run full CPU‑only RAG on similar Unraid setups with 3‑7B quantized models at usable speeds (3‑10 tokens/sec). [starkinsider](https://www.starkinsider.com/2025/08/starkmind-building-an-at-home-llm-with-rag-not-really-that-hard.html)

### RAM strategy (70% baseline)

Your ~30% headroom is enough if managed:
- **Set strict limits**: In Unraid Docker advanced view → Extra Parameters: `--memory=4G --cpus=2.0` (or fractional) per RAG container. This prevents swapping/lockups even under spikes. [reddit](https://www.reddit.com/r/unRAID/comments/ctul23/how_do_i_limit_ramcpu_usage_of_docker_containers/)
- **Prioritize**: Use small embedding models (e.g., all‑MiniLM‑L6‑v2, ~90MB) that fit in 1‑2 GB. Offload full LLM to Claude. [reddit](https://www.reddit.com/r/Rag/comments/1qafa53/best_practices_for_running_a_cpuonly_rag_chatbot/)
- **Monitor/audit**: Check `docker stats` and Unraid dashboard; pause low‑priority of your 20 containers during ingestion if needed. Total addition: 4‑8 GB for the stack. [reddit](https://www.reddit.com/r/unRAID/comments/1jt2hr0/unraid_unresponsive_high_docker_ram_usage_and/)

### CPU utilization

Your low baseline is perfect—RAG bursts to 100% on a few cores during parsing/embedding:
- **Pin cores**: Extra Parameters: `--cpuset-cpus="4-7"` (isolate 4 cores for RAG). Keeps other containers responsive. [youtube](https://www.youtube.com/watch?v=f8ieFDCRkLs)
- **Batch process**: Run ingestion as scheduled jobs (not always‑on) to avoid sustained load. [starkinsider](https://www.starkinsider.com/2025/08/starkmind-building-an-at-home-llm-with-rag-not-really-that-hard.html)
- **Modern CPU bonus**: If Intel 12th+ gen or AMD Zen 3+, enable performance governor for 20‑50% faster single‑threaded tasks. [youtube](https://www.youtube.com/watch?v=f8ieFDCRkLs)

### Recommended container stack
```
PDF Parser (pdfcpu/tika) → Text Chunker → Embedding (sentence-transformers CPU) → R2 Upload → Query API (FastAPI + FAISS/whoosh index)
```
```
Docker Compose:
├── pdfcpu:latest (parse → text files)
├── sentence-transformers (embed → numpy)
├── FastAPI + FAISS (query endpoint → R2 sync)
└── Cron job for batch ingest
```

Tune embeddings with pip install onnxruntime sentence-transformers[onnx] for Ryzen speedups.

This runs comfortably without upgrades for <50 docs/hour. Test embedding speed first: ollama run nomic-embed-text on a sample doc. If viable, you're set.

- All CPU‑friendly, low‑memory; total ~6 GB RAM, 4 cores peak.
- Proven on Unraid without GPU. [starkinsider](https://www.starkinsider.com/2025/08/starkmind-building-an-at-home-llm-with-rag-not-really-that-hard.html)

### Quick validation steps
1. Spin up Ollama container (CPU mode, 3B model) → test embedding speed.
2. Add pdfplumber Docker → parse a sample doc.
3. If RAM hits 90%+, add 16 GB stick (~$30) or trim other containers.

This keeps everything local except Claude, leveraging your spare CPU headroom effectively. Share your CPU model and total RAM for a tuned config.





### High-level request flow for Clerk authentication:
User hits your Pages SPA; Clerk frontend components handle sign up / sign in and maintain a session token (JWT) in cookie or header.

SPA calls your API routes (Workers) and sends the Clerk session token in the Authorization: Bearer <token> header (or relies on the __session cookie).

Each Worker verifies the token using Clerk’s backend SDK / authenticateRequest or verifyToken, and either:

Rejects with 401 if invalid/missing, or

Extracts userId and claims, then proceeds to D1/R2.

### Authentication & authorization in Workers
Configure Clerk’s JWT key / JWKS in your Worker env (e.g., CLERK_JWT_KEY), so verification is “networkless” and fast.

In a small auth utility used by all Workers:

Read token from Authorization or __session.
​

Call Clerk backend SDK’s authenticateRequest() (recommended) or verifyToken() with the JWT key.

On success, return a context including userId, email, and any custom claims; on failure, throw or return null and send 401/403.

This gives you a simple requireUser helper for protected endpoints and a maybeUser helper for “optional auth” routes.

Using auth to protect API endpoints
For each API Worker route:

Public routes (e.g., basic search):

Call maybeUser and allow anonymous access but still log or personalize if userId exists.

Rate-limited / value-add routes (e.g., advanced search, asset generation):

Require a valid userId and apply per-user quotas by counting requests or stored records in D1 keyed by userId.

Strictly protected routes (e.g., admin, bulk export, high-cost pipelines):

Require userId and an additional role flag from token claims or from a D1 lookup (e.g., role = 'admin').

Customize Clerk JWT templates to include roles/flags as claims if you want to avoid a DB round trip per call.

The net effect: no unauthenticated user can call your expensive/generative API endpoints, and you can differentiate per-user limits and roles cleanly at the edge.

Data model in D1/R2
Use Clerk’s userId as the stable foreign key:

users table (optional, to cache profile data):

id (Clerk userId), email, created_at, plan, role, etc.

search_history table:

id, user_id, query, filters_json, created_at.

assets table:

id, user_id, type, r2_key, metadata_json, created_at.

R2 hosts the actual generated assets; D1 stores metadata and links.

Webhooks for sync / lifecycle
Configure Clerk webhooks to a dedicated Worker endpoint for events like user.created, user.deleted, etc.
​

On user.created, insert or update the users row in D1.

On user.deleted, soft-delete or anonymize related records in D1/R2 as needed.

This gives you a clean, Cloudflare-native flow where Clerk handles identity, your Workers enforce access on every API call, and D1/R2 handle all per-user state tied to the Clerk userId.

### User Authentication with Clerk:

Workers + Clerk + D1/R2.

1. User session creation (front end)
User opens your Cloudflare Pages SPA.

SPA loads Clerk frontend (e.g., <SignIn/>, <SignUp/>) and configuration.

User signs up / signs in via Clerk (email/password, social, etc.).
​

Clerk creates a session and returns a session token (JWT), stored in a cookie (__session) and/or available to the SPA.

2. Calling your API (Workers)
User performs an action in the SPA (save search, generate asset, etc.).

SPA sends a fetch request to your API route (Worker), including the Clerk token (via Authorization: Bearer <JWT> or session cookie).

3. Worker authentication
Worker receives request at /api/....

Worker extracts token from header or cookie.
​

Worker calls a shared auth helper using Clerk backend SDK (verifyToken / authenticateRequest) with your Clerk issuer and JWKS / public key.

If token is invalid/expired/missing, helper returns null → Worker responds 401 Unauthorized (or 403).
​

If token is valid, helper returns auth context: userId, email, plus any custom claims (e.g., role, plan).

4. Authorization and business logic
Worker checks route type:

Public: optional userId.

Auth-only: require userId.

Role-based: require userId + claim (e.g., role=admin).

For protected API (search history / asset creation), Worker now has userId and any quota/role info.

5. Data access in D1 and R2
Worker reads/writes search history in D1 using userId as foreign key (e.g., INSERT INTO search_history(user_id, query, ...)).

For asset generation:

Worker generates asset (or orchestrates another service).

Worker writes asset bytes to R2 at key like userId/assetId.

Worker writes an assets row in D1: asset_id, user_id, r2_key, metadata.

6. Response to client
Worker returns JSON to SPA with the updated search history or asset metadata (including URLs/presigned URLs for R2).

SPA updates UI showing user‑specific content tied to their Clerk account.

7. Lifecycle via webhooks (optional but recommended)
Clerk sends webhooks (e.g., user.created, user.deleted) to a dedicated Worker endpoint.
​

Webhook Worker verifies Clerk signature, then:

On user.created: upsert row in users table in D1 (cache email, role, plan, etc.).

On user.deleted: soft‑delete or anonymize D1 rows and optionally clean R2 assets.
