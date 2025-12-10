import sqlite3
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import time
import re

import os

# Configuration
DB_PATH = os.path.join(os.path.dirname(__file__), "articles.db")
SEARCH_TERM = '(Leukemia[Title/Abstract]) AND ("2023/01/01"[Date - Publication] : "3000"[Date - Publication])'
MAX_RESULTS = 20
EMAIL = "antigravity@gemini.google.com" # Required by NCBI

# Mutation Regex Patterns
MUTATION_PATTERNS = {
    "FLT3": r"\bFLT3\b",
    "NPM1": r"\bNPM1\b",
    "IDH1": r"\bIDH1\b",
    "IDH2": r"\bIDH2\b",
    "TP53": r"\bTP53\b",
    "KIT": r"\bKIT\b",
    "CEBPA": r"\bCEBPA\b",
    "RUNX1": r"\bRUNX1\b",
    "ASXL1": r"\bASXL1\b",
    "DNMT3A": r"\bDNMT3A\b",
    "TET2": r"\bTET2\b",
    "KRAS": r"\bKRAS\b",
    "NRAS": r"\bNRAS\b",
    "WT1": r"\bWT1\b",
    "BCR-ABL1": r"\bBCR[- ]?ABL1?\b",
    "PML-RARA": r"\bPML[- ]?RARA\b",
    "SF3B1": r"\bSF3B1\b",
    "GATA2": r"\bGATA2\b"
}

# Topic Regex Patterns
TOPIC_PATTERNS = {
    "Data Science/AI": r"\b(Artificial Intelligence|Machine Learning|Deep Learning|Bioinformatics|Neural Network|Big Data|Data Science|AI|ML)\b",
    "Cell Therapy": r"\b(Cell Therapy|Stem Cell|HSCT|Bone Marrow Transplant|HSC|Hematopoietic)\b",
    "CAR-T": r"\b(CAR-T|Chimeric Antigen|CART)\b",
    "Immunotherapy": r"\b(Immunotherapy|Checkpoint Inhibitor|PD-1|PD-L1|CTLA-4)\b"
}

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Updated schema with tags
    c.execute('''CREATE TABLE IF NOT EXISTS articles
                 (pubmed_id TEXT PRIMARY KEY, title TEXT, abstract TEXT, pub_date TEXT, url TEXT, mutations TEXT, diseases TEXT, authors TEXT, journal TEXT, affiliations TEXT, tags TEXT)''')
    conn.commit()
    conn.close()

def search_pubmed():
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": SEARCH_TERM,
        "retmax": MAX_RESULTS,
        "usehistory": "y",
        "email": EMAIL
    }
    response = requests.get(base_url, params=params)
    root = ET.fromstring(response.content)
    
    id_list = []
    for id_node in root.findall(".//Id"):
        id_list.append(id_node.text)
        
    return id_list

def fetch_details(id_list):
    if not id_list:
        return []
    
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    ids = ",".join(id_list)
    params = {
        "db": "pubmed",
        "id": ids,
        "retmode": "xml",
        "email": EMAIL
    }
    response = requests.get(base_url, params=params)
    return response.content

def extract_mutations(text):
    found = []
    if not text:
        return ""
    for gene, pattern in MUTATION_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            found.append(gene)
    return ",".join(found)

def extract_topics(text):
    found = []
    if not text:
        return ""
    for topic, pattern in TOPIC_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            found.append(topic)
    return ",".join(found)

def parse_and_save(xml_content):
    root = ET.fromstring(xml_content)
    articles = []
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    for article in root.findall(".//PubmedArticle"):
        pmid = article.find(".//PMID").text
        
        article_node = article.find("MedlineCitation/Article")
        title = article_node.find("ArticleTitle").text if article_node.find("ArticleTitle") is not None else "No Title"
        
        abstract_node = article_node.find("Abstract/AbstractText")
        abstract = ""
        if abstract_node is not None:
            abstract = abstract_node.text or ""
        
        pub_date_node = article_node.find("Journal/JournalIssue/PubDate")
        year = pub_date_node.find("Year")
        if year is not None:
            pub_date = year.text
        else:
            pub_date = "Unknown"
            
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        
        # New Metadata Extraction
        journal = article_node.find("Journal/Title").text if article_node.find("Journal/Title") is not None else "Unknown Journal"
        
        authors_list = []
        affiliations_list = []
        author_list_node = article_node.find("AuthorList")
        if author_list_node is not None:
            for author in author_list_node.findall("Author"):
                last_name = author.find("LastName").text if author.find("LastName") is not None else ""
                initials = author.find("Initials").text if author.find("Initials") is not None else ""
                if last_name:
                    authors_list.append(f"{last_name} {initials}")
                
                # Naive affiliation grabbing (just grabs all unique ones found)
                aff_info = author.find("AffiliationInfo/Affiliation")
                if aff_info is not None and aff_info.text:
                    if aff_info.text not in affiliations_list:
                        affiliations_list.append(aff_info.text)

        authors_str = ", ".join(authors_list)
        affiliations_str = " | ".join(affiliations_list) # Using pipe to separate complex strings

        full_text = f"{title} {abstract}"
        mutations = extract_mutations(full_text)
        tags = extract_topics(full_text)
        
        # Simple disease detection
        diseases = []
        if "AML" in full_text or "Acute Myeloid Leukemia" in full_text:
            diseases.append("AML")
        if "CML" in full_text or "Check Myeloid Leukemia" in full_text:
             diseases.append("CML")
        if "ALL" in full_text or "Acute Lymphoblastic Leukemia" in full_text:
             diseases.append("ALL")
             
        disease_str = ",".join(diseases)

        try:
            # Update INSERT statement
            c.execute("INSERT OR IGNORE INTO articles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      (pmid, title, abstract, pub_date, url, mutations, disease_str, authors_str, journal, affiliations_str, tags))
        except Exception as e:
            print(f"Error saving {pmid}: {e}")
            
    conn.commit()
    conn.close()
    print("Ingestion complete.")

if __name__ == "__main__":
    init_db()
    print("Searching PubMed...")
    ids = search_pubmed()
    print(f"Found {len(ids)} articles.")
    if ids:
        print("Fetching details...")
        xml_content = fetch_details(ids)
        print("Parsing and saving...")
        parse_and_save(xml_content)
