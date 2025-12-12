# LeukemiaLens

LeukemiaLens is a specialized research tracker designed to help researchers and clinicians stay updated with the latest scientific developments in leukemia. It aggregates articles from PubMed and enriches them with intelligent tagging for specific gene mutations, disease subtypes, and study topics.

## Screenshots
### Advanced Filtering & Study Topics
![LeukemiaLens UI](assets/images/filter-screenshot.png)

## Features

-   **Automated Data Ingestion**: Fetches recent scientific articles from PubMed (NCBI) matching leukemia-related queries.
-   **Smart Tagging**:
    -   **Mutations**: Automatically detects common gene mutations (FLT3, NPM1, IDH1, TP53, etc.).
    -   **Diseases**: Categorizes articles by subtype (AML, CML, ALL).
    -   **Study Topics**: Identifies key research areas like CAR-T, Cell Therapy, Immunotherapy, and Data Science/AI.
-   **Advanced Search**: Robust filtering by Author, Journal, Institution, and Publication Date.
-   **Interactive Dashboard**:
    -   Visual statistics of trending mutations and topics.
    -   One-click filtering and resetting.
    -   Direct links to full PubMed articles.

## Tech Stack

-   **Backend**: Cloudflare Workers (TypeScript)
-   **Frontend**: React, Vite, TailwindCSS (deployed via Cloudflare Pages / Workers Assets)
-   **Database**: Cloudflare D1 (SQLite)
-   **Data Source**: PubMed Entrez E-utilities API

## Setup & Running

### Prerequisites
-   Python 3.8+
-   Node.js 18+

### 1. Backend Setup

Navigate to the `backend/` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the ingestion script to populate the database (fetches from PubMed):
```bash
python ingest.py
```
*Note: This creates an `articles.db` SQLite database.*

Start the API server:
```bash
python main.py
```
The backend will run at `http://localhost:8000`.

### 2. Frontend Setup

Navigate to the `frontend/` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.
