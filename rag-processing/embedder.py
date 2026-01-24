"""
Embedding Generation Module

Generates vector embeddings from text chunks using sentence-transformers.
Optimized for CPU execution with batching.
"""

import os
from typing import List
import logging

from sentence_transformers import SentenceTransformer
import numpy as np

logger = logging.getLogger(__name__)

# Configuration
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
BATCH_SIZE = 32  # Embeddings per batch

# Global model instance (loaded once)
_model = None


def get_model() -> SentenceTransformer:
    """Get or load the embedding model."""
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        _model = SentenceTransformer(EMBEDDING_MODEL)
        logger.info(f"Model loaded. Embedding dimension: {_model.get_sentence_embedding_dimension()}")
    return _model


def generate_embeddings(texts: List[str], show_progress: bool = True) -> List[List[float]]:
    """
    Generate embeddings for a list of text chunks.
    
    Args:
        texts: List of text strings to embed
        show_progress: Whether to show progress bar
    
    Returns:
        List of embedding vectors (each is a list of floats)
    """
    if not texts:
        return []
    
    model = get_model()
    
    logger.info(f"Generating embeddings for {len(texts)} chunks...")
    
    # Generate embeddings in batches
    embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=show_progress,
        convert_to_numpy=True
    )
    
    # Convert numpy arrays to lists for JSON serialization
    result = [emb.tolist() for emb in embeddings]
    
    logger.info(f"Generated {len(result)} embeddings of dimension {len(result[0])}")
    
    return result


def generate_single_embedding(text: str) -> List[float]:
    """Generate embedding for a single text string."""
    model = get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


if __name__ == '__main__':
    # Test embedding generation
    test_texts = [
        "FLT3 mutations are common in acute myeloid leukemia and affect prognosis.",
        "Venetoclax combined with azacitidine has shown promising results in AML treatment.",
        "Bone marrow transplantation remains an important treatment option for high-risk leukemia.",
    ]
    
    embeddings = generate_embeddings(test_texts, show_progress=False)
    
    print(f"\nGenerated {len(embeddings)} embeddings")
    print(f"Embedding dimension: {len(embeddings[0])}")
    
    # Test similarity
    print("\nSimilarity matrix:")
    for i, e1 in enumerate(embeddings):
        for j, e2 in enumerate(embeddings):
            sim = cosine_similarity(e1, e2)
            print(f"  [{i}][{j}]: {sim:.3f}", end="")
        print()
