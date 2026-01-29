"""
Embedding Generation Module

Generates vector embeddings from text chunks using BAAI/bge-base-en-v1.5 (768 dimensions).
Supports GPU acceleration for high-throughput batch processing.
"""

import os
from typing import List
import logging

from sentence_transformers import SentenceTransformer
import numpy as np
import threading

logger = logging.getLogger(__name__)

# Configuration - now using bge-base-en-v1.5 for consistency with Workers AI
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'BAAI/bge-base-en-v1.5')
EMBEDDING_DIM = 768  # bge-base-en-v1.5 produces 768-dimensional vectors

# Batch size - higher for GPU, lower for CPU
DEFAULT_CPU_BATCH_SIZE = 32
DEFAULT_GPU_BATCH_SIZE = 128

# Global model instance (loaded once)
_model = None
_device = None
_model_lock = threading.Lock()


def get_device() -> str:
    """Detect and return the best available device."""
    global _device
    if _device is not None:
        return _device
    
    try:
        import torch
        if torch.cuda.is_available():
            _device = 'cuda'
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
            logger.info(f"🚀 GPU detected: {gpu_name} ({gpu_memory:.1f} GB)")
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            _device = 'mps'
            logger.info("🍎 Apple MPS detected")
        else:
            _device = 'cpu'
            logger.info("💻 Using CPU for embeddings")
    except ImportError:
        _device = 'cpu'
        logger.warning("PyTorch not found, using CPU")
    
    return _device


def get_model() -> SentenceTransformer:
    """Get or load the embedding model with thread safety."""
    global _model
    if _model is None:
        with _model_lock:
            # Double-check pattern
            if _model is None:
                device = get_device()
                logger.info(f"Loading embedding model: {EMBEDDING_MODEL} on {device}")
                
                try:
                    # Explicitly disable low_cpu_mem_usage to avoid 'meta tensor' errors on some systems
                    _model = SentenceTransformer(
                        EMBEDDING_MODEL, 
                        device=device,
                        model_kwargs={"low_cpu_mem_usage": False}
                    )
                except Exception as e:
                    logger.warning(f"Failed to load with GPU optimizations: {e}. Trying fallback...")
                    # Fallback: Load on CPU first then move, or just load without extras
                    _model = SentenceTransformer(EMBEDDING_MODEL, device='cpu')
                    if device != 'cpu':
                        try:
                            _model.to(device)
                        except Exception as move_error:
                            logger.error(f"Failed to move model to {device}: {move_error}. Staying on CPU.")
                
                logger.info(f"Model loaded. Embedding dimension: {_model.get_sentence_embedding_dimension()}")
    return _model


def pre_load_model():
    """Hint to load the model in the main thread before starting parallel workers."""
    get_model()


def get_batch_size() -> int:
    """Return optimal batch size based on device."""
    device = get_device()
    if device == 'cuda':
        return int(os.getenv('GPU_BATCH_SIZE', DEFAULT_GPU_BATCH_SIZE))
    return int(os.getenv('CPU_BATCH_SIZE', DEFAULT_CPU_BATCH_SIZE))


def generate_embeddings(texts: List[str], show_progress: bool = True) -> List[List[float]]:
    """
    Generate embeddings for a list of text chunks.
    
    Args:
        texts: List of text strings to embed
        show_progress: Whether to show progress bar
    
    Returns:
        List of embedding vectors (each is a list of 768 floats)
    """
    if not texts:
        return []
    
    model = get_model()
    batch_size = get_batch_size()
    
    logger.info(f"Generating embeddings for {len(texts)} chunks (batch_size={batch_size})...")
    
    # BGE models benefit from a query prefix for retrieval tasks
    # For documents, we use the text as-is; for queries, we'd add "Represent this sentence: "
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=show_progress,
        convert_to_numpy=True,
        normalize_embeddings=True  # BGE models work better with normalized vectors
    )
    
    # Convert numpy arrays to lists for JSON serialization
    result = [emb.tolist() for emb in embeddings]
    
    logger.info(f"Generated {len(result)} embeddings of dimension {len(result[0])}")
    
    return result


def generate_query_embedding(query: str) -> List[float]:
    """
    Generate embedding for a search query.
    
    BGE models work best when queries are prefixed with an instruction.
    """
    model = get_model()
    # For BGE models, prepend instruction for query embeddings
    query_with_instruction = f"Represent this sentence for searching relevant passages: {query}"
    embedding = model.encode(query_with_instruction, convert_to_numpy=True, normalize_embeddings=True)
    return embedding.tolist()


def generate_single_embedding(text: str) -> List[float]:
    """Generate embedding for a single text string (document, not query)."""
    model = get_model()
    embedding = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return embedding.tolist()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


if __name__ == '__main__':
    # Test embedding generation
    print("=" * 60)
    print("Embedding Model Test: BAAI/bge-base-en-v1.5")
    print("=" * 60)
    
    test_texts = [
        "FLT3 mutations are common in acute myeloid leukemia and affect prognosis.",
        "Venetoclax combined with azacitidine has shown promising results in AML treatment.",
        "Bone marrow transplantation remains an important treatment option for high-risk leukemia.",
    ]
    
    embeddings = generate_embeddings(test_texts, show_progress=False)
    
    print(f"\n✓ Generated {len(embeddings)} embeddings")
    print(f"✓ Embedding dimension: {len(embeddings[0])} (expected: 768)")
    print(f"✓ Device: {get_device()}")
    
    # Test query embedding
    query_emb = generate_query_embedding("FLT3 treatment options")
    print(f"✓ Query embedding dimension: {len(query_emb)}")
    
    # Test similarity
    print("\nSimilarity to query 'FLT3 treatment options':")
    for i, e in enumerate(embeddings):
        sim = cosine_similarity(query_emb, e)
        print(f"  Text {i+1}: {sim:.3f}")
