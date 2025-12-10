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

@app.get("/health")
def health_check():
    return {"status": "ok"}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/articles", response_model=List[Article])
def get_articles(
    mutation: Optional[str] = None,
    disease: Optional[str] = None,
    limit: int = 50
):
    conn = get_db_connection()
    c = conn.cursor()
    
    query = "SELECT * FROM articles"
    params = []
    conditions = []
    
    if mutation:
        conditions.append("mutations LIKE ?")
        params.append(f"%{mutation}%")
        
    if disease:
        conditions.append("diseases LIKE ?")
        params.append(f"%{disease}%")
        
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
            diseases=row["diseases"].split(",") if row["diseases"] else []
        ))
    return articles

@app.get("/stats")
def get_stats():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Simple count of mutations (naive approach: extract all strings)
    # Since we store as CSV, we iterate.
    c.execute("SELECT mutations FROM articles")
    rows = c.fetchall()
    
    mutation_counts = {}
    for row in rows:
        if row["mutations"]:
            for mut in row["mutations"].split(","):
                mut = mut.strip()
                mutation_counts[mut] = mutation_counts.get(mut, 0) + 1
                
    conn.close()
    return {"mutations": mutation_counts}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
