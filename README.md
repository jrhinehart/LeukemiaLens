# LeukemiaLens

LeukemiaLens is a specialized research tracker designed to help researchers and clinicians stay updated with the latest scientific developments in leukemia. It aggregates articles from PubMed and enriches them with intelligent tagging for specific gene mutations, disease subtypes, research topics, and clinical treatments.

## Screenshots
### Advanced Filtering & Study Topics
![LeukemiaLens UI](assets/images/filter-screenshot.png)

## Features

- **Automated Data Ingestion**: Scheduled workers fetch recent scientific articles from PubMed (NCBI) matching leukemia-related queries.
- **Smart Tagging**:
  - **Mutations**: Automatically detects 65+ gene mutations based on ELN 2022 (AML) and WHO 2022 (ALL) standards, including risk-stratifying markers (NPM1, FLT3-ITD, TP53), MDS-related genes (ASXL1, BCOR, SF3B1), fusion genes (BCR-ABL1, PML-RARA, KMT2A), and ALL-specific alterations.
  - **Diseases**: Categorizes articles by subtype (AML, CML, ALL, CLL, MDS, MPN, DLBCL, MM).
  - **Study Topics**: Identifies key research areas like CAR-T, Cell Therapy, Immunotherapy, Clinical Trials, and Data Science/AI.
  - **Treatments**: Detects specific pharmacological treatments and established protocols (e.g., 7+3, VEN-AZA, FLAG-IDA).
- **Ontology-Based Filtering**: Reference tables ensure consistent disease, mutation, and treatment classification.
- **Advanced Search**: 
  - Filter by mutations, diseases, topics, and treatments.
  - Search by author, journal, institution, and complex karyotype status.
  - Flexible date range filtering.
- **CSV Export**: Export filtered results to CSV for further analysis, including full metadata and PubMed links.
- **Interactive Dashboards**:
  - **Real-time Research Stats**: Visual statistics of trending mutations, topics, and treatments.
  - **Database Statistics**: Specialized dashboard showing database growth, diversity, and coverage.
- **Modern UI**:
  - Responsive layout with specialized filtering components.
  - Client-side pagination for smooth and responsive browsing.
  - One-click filtering and resetting.

## Architecture

LeukemiaLens is built on a serverless Cloudflare Workers architecture:

```
┌─────────────────────────────────────────┐
│         Cloudflare Pages                │
│      (React + Vite Frontend)            │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────┐
│      Cloudflare Workers (API)           │
│         (Hono Framework)                │
│                                         │
│  Endpoints:                             │
│  • GET /api/search                      │
│  • GET /api/export (CSV)                │
│  • GET /api/stats (Trends)              │
│  • GET /api/database-stats              │
│  • GET /api/ontology                    │
│  • GET /api/study/:id                   │
└─────────────────┬───────────────────────┘
                  │
                  │
                  ▼
┌─────────────────────────────────────────┐
│       Cloudflare D1 Database            │
│           (SQLite)                      │
│                                         │
│  Tables:                                │
│  • studies                              │
│  • mutations / study_topics             │
│  • treatments                           │
│  • ref_diseases / ref_mutations         │
│  • ref_treatments (protocols/drugs)     │
└─────────────────────────────────────────┘
                  ▲
                  │
                  │
┌─────────────────┴───────────────────────┐
│   Cloudflare Workers (Ingest)           │
│      (Scheduled CRON Job)               │
│                                         │
│  • Fetches from PubMed E-utilities      │
│  • Extracts metadata & tags             │
│  • Populates D1 database                │
└─────────────────────────────────────────┘
```

## Tech Stack

- **API**: Cloudflare Workers + Hono framework (TypeScript)
- **Ingestion**: Cloudflare Workers with scheduled CRON jobs
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: React + Vite + TailwindCSS
- **Hosting**: Cloudflare Pages
- **Data Source**: PubMed Entrez E-utilities API

## Database Schema

The application uses a relational schema with ontology tables for consistent classification:

### Core Tables
- **`studies`** - Main article metadata (title, abstract, journal, authors, publication date, complex karyotype status)
- **`mutations`** - Junction table linking studies to detected gene mutations
- **`study_topics`** - Junction table linking studies to research topics (tags)
- **`treatments`** - Junction table linking studies to specific treatments
- **`links`** - External links to full text sources

### Reference Tables (Ontology)
- **`ref_diseases`** - Authoritative list of disease subtypes (AML, ALL, CML, etc.)
- **`ref_mutations`** - Comprehensive gene mutation ontology (65+ genes) with ELN risk classification
- **`ref_treatments`** - Catalog of normalized treatments (drugs and clinical protocols)
- **`ref_treatment_components`** - Mapping of clinical protocols to their individual drug components

See [`schema.sql`](schema.sql), [`schema_mutations.sql`](schema_mutations.sql), and [`schema_treatments.sql`](schema_treatments.sql) for complete definitions.

## Setup & Deployment

### Prerequisites

- **Node.js** 18+
- **Wrangler CLI**: `npm install -g wrangler`
- **Cloudflare Account** with:
  - Workers enabled
  - D1 database access
  - Pages deployment access

### 1. Database Setup

Create the D1 database:
```bash
wrangler d1 create leukemialens-db
```

Note the database ID from the output and update `wrangler.toml` files.

Apply the schemas:
```bash
wrangler d1 execute leukemialens-db --file=schema.sql
wrangler d1 execute leukemialens-db --file=schema_mutations.sql
wrangler d1 execute leukemialens-db --file=schema_treatments.sql
```

### 2. API Worker Setup

Navigate to the API worker directory:
```bash
cd workers/api
npm install
```

Update `wrangler.toml` with your database ID.

Deploy:
```bash
wrangler deploy
```

### 3. Ingest Worker Setup

Navigate to the ingest worker directory:
```bash
cd workers/ingest
npm install
```

Set up environment variables:
```bash
# Add your NCBI API key (optional but recommended for higher rate limits)
wrangler secret put NCBI_API_KEY

# Set Cloudflare credentials for D1 API access (for backfill scripts)
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_API_TOKEN
```

> [!IMPORTANT]
> ### NCBI API Limits & Best Practices
> To ensure reliable ingestion and avoid IP blocks from NCBI:
> - **API Key**: Always use an `NCBI_API_KEY`. It increases your rate limit from **3** to **10** requests per second.
> - **Off-Peak Hours**: For large backfills (more than 100 requests), NCBI recommends running scripts during off-peak hours (9:00 PM – 5:00 AM US Eastern Time).
> - **Chunking**: The system automatically chunks requests, but it is recommended to keep `batch-size` per year between **100-500** to avoid timeouts.
> - **Tool Identification**: This project identifies itself as `LeukemiaLens` as required by NCBI policy.

Update `wrangler.toml` with your database ID and configure the CRON schedule.

Deploy:
```bash
wrangler deploy
```

#### Running Backfill Scripts

To populate the database with historical data:

```bash
# Backfill articles (100 per year by default)
npx tsx scripts/backfill-production.ts --start-year 2000 --end-year 2024

# For larger datasets, run in chunks or during off-peak hours
npx tsx scripts/backfill-production.ts --start-year 2000 --end-year 2024 --batch-size 500

# Backfill specific metadata for existing articles
npx tsx scripts/backfill-topics.ts
npx tsx scripts/backfill-mutations.ts   # Re-tag with expanded 65-gene set
npx tsx scripts/backfill-treatments.ts
npx tsx scripts/backfill-dates.ts
```

### 4. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
npm install
```

**Local Development:**
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

**Deploy to Cloudflare Pages:**
```bash
npm run build
wrangler pages deploy dist
```

## API Endpoints

### `GET /api/search`
Search and filter articles.

**Query Parameters:**
- `q` - Text search (title/abstract)
- `mutation` - Filter by gene mutations (comma-separated symbols)
- `disease` - Filter by disease subtypes (comma-separated codes)
- `tag` - Filter by study topics (comma-separated)
- `treatment` - Filter by treatment codes (comma-separated)
- `complex_karyotype` - Filter for complex karyotype articles (`true`/`false`)
- `author` - Filter by author name
- `journal` - Filter by journal name
- `institution` - Filter by institution/affiliation (currently matches titles)
- `year_start` - Filter by start date (YYYY or YYYY-MM-DD)
- `year_end` - Filter by end date (YYYY or YYYY-MM-DD)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

### `GET /api/export`
Export filtered results as CSV. Accepts same query parameters as `/api/search` (higher `limit` recommended).

### `GET /api/stats`
Get trend statistics on mutations, topics, and treatments.

### `GET /api/database-stats`
Get comprehensive metrics on database size, coverage, and date ranges.

### `GET /api/ontology`
Get reference lists of diseases, mutations, and treatments (including protocol components).

### `GET /api/study/:id`
Get detailed information for a specific study by ID.

## UI Components

LeukemiaLens uses a modular filtering system built with specialized React components:
- **`SimpleListFilter`**: Multi-select filtering for discrete categories (Diseases, Topics).
- **`SearchableListFilter`**: High-cardinality filtering with search and frequency counts (Mutations, Treatments).
- **`DateRangeFilter`**: Flexible date boundary selection.
- **`TextSearchFilter`**: Real-time keyword search.

## Development

### Local Testing

**API Worker:**
```bash
cd workers/api
wrangler dev
```

**Ingest Worker:**
```bash
cd workers/ingest
wrangler dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## License

This project is for research and educational purposes.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
