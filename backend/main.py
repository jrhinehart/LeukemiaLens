from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="LeukemiaLens API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "articles.db")

class Article(BaseModel):
    pubmed_id: str
    title: str
    abstract: str
    pub_date: str
    url: str
    mutations: List[str]
    diseases: List[str]
    authors: str
    journal: str
    affiliations: str
    tags: List[str]

@app.get("/health")
def health_check():
    return {"status": "ok"}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/articles", response_model=List[Article])
def get_articles(
    mutation: Optional[List[str]] = Query(None),
    disease: Optional[List[str]] = Query(None),
    tag: Optional[List[str]] = Query(None),
    search: Optional[str] = None,
    start_date: Optional[str] = None, # YYYY-MM-DD
    end_date: Optional[str] = None,   # YYYY-MM-DD
    author: Optional[str] = None,
    journal: Optional[str] = None,
    institution: Optional[str] = None,
    limit: int = 50
):
    conn = get_db_connection()
    c = conn.cursor()
    
    query = "SELECT * FROM articles"
    params = []
    conditions = []
    
    # Helper to add OR conditions for a list of values
    def add_list_condition(column, values):
        if not values:
            return
        # (column LIKE ? OR column LIKE ?)
        clauses = [f"{column} LIKE ?" for _ in values]
        conditions.append(f"({' OR '.join(clauses)})")
        for v in values:
            params.append(f"%{v}%")

    add_list_condition("mutations", mutation)
    add_list_condition("diseases", disease)
    add_list_condition("tags", tag)

    if search:
        conditions.append("(title LIKE ? OR abstract LIKE ?)")
        params.append(f"%{search}%")
        params.append(f"%{search}%")

    # Date filtering (very basic string comparison for YYYY, might need robust parsing if dates are messy)
    if start_date:
        conditions.append("pub_date >= ?")
        # Extract year from YYYY-MM-DD for simple comparison against stored "YYYY" or "YYYY MON DD"
        # Since ingestion stores whatever PubMed gives (often YYYY), we just try to match year.
        # Ideally, ingestion should normalize dates. For now, we assume simple year filter or string compare.
        params.append(start_date[:4]) 
        
    if end_date:
        conditions.append("pub_date <= ?")
        params.append(end_date[:4])
        
    if author:
        conditions.append("authors LIKE ?")
        params.append(f"%{author}%")
        
    if journal:
        conditions.append("journal LIKE ?")
        params.append(f"%{journal}%")
        
    if institution:
        conditions.append("affiliations LIKE ?")
        params.append(f"%{institution}%")
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY pub_date DESC LIMIT ?"
    params.append(limit)
    
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    
    articles = []
    for row in rows:
        articles.append(Article(
            pubmed_id=row["pubmed_id"],
            title=row["title"],
            abstract=row["abstract"],
            pub_date=row["pub_date"],
            url=row["url"],
            mutations=row["mutations"].split(",") if row["mutations"] else [],
            diseases=row["diseases"].split(",") if row["diseases"] else [],
            authors=row["authors"] or "",
            journal=row["journal"] or "",
            affiliations=row["affiliations"] or "",
            tags=row["tags"].split(",") if row["tags"] else []
        ))
    return articles

@app.get("/stats")
def get_stats():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("SELECT mutations, tags FROM articles")
    rows = c.fetchall()
    
    mutation_counts = {}
    tag_counts = {}

    for row in rows:
        if row["mutations"]:
            for mut in row["mutations"].split(","):
                mut = mut.strip()
                if mut:
                    mutation_counts[mut] = mutation_counts.get(mut, 0) + 1
        
        if row["tags"]:
            for tag in row["tags"].split(","):
                tag = tag.strip()
                if tag:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
                
    conn.close()
    return {"mutations": mutation_counts, "tags": tag_counts}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
