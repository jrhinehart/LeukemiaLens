import os
import torch
import logging
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("debug_gpu")

def test_loading():
    model_name = 'BAAI/bge-base-en-v1.5'
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    logger.info(f"Testing on device: {device}")
    
    try:
        logger.info("--- Attempt 1: Standard loading ---")
        model = SentenceTransformer(model_name, device=device)
        logger.info("✓ Attempt 1 successful")
    except Exception as e:
        logger.error(f"✗ Attempt 1 failed: {e}")
        
    try:
        logger.info("--- Attempt 2: device=None then model.to(device) ---")
        model = SentenceTransformer(model_name, device=None)
        model.to(device)
        logger.info("✓ Attempt 2 successful")
    except Exception as e:
        logger.error(f"✗ Attempt 2 failed: {e}")

    try:
        logger.info("--- Attempt 3: model_kwargs={'low_cpu_mem_usage': False} ---")
        model = SentenceTransformer(model_name, device=device, model_kwargs={"low_cpu_mem_usage": False})
        logger.info("✓ Attempt 3 successful")
    except Exception as e:
        logger.error(f"✗ Attempt 3 failed: {e}")

if __name__ == "__main__":
    test_loading()
