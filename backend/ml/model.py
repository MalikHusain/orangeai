"""
ml/model.py — ResNet-50 model loader and inference engine
"""

import numpy as np
import os
import io
import random
from PIL import Image

# TensorFlow import (graceful fallback to simulation)
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️  TensorFlow not found — running in simulation mode")

# ── Constants ─────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "orange_disease_resnet50.h5")
IMG_SIZE   = (224, 224)

CLASS_LABELS = [
    "citrus_canker",
    "hlb",
    "black_spot",
    "root_rot",
    "melanose",
    "sooty_mould",
    "tristeza",
    "scab",
    "healthy",
]

CLASS_NAMES = {
    "citrus_canker": "Citrus Canker",
    "hlb":           "Huanglongbing (HLB)",
    "black_spot":    "Citrus Black Spot",
    "root_rot":      "Phytophthora Root Rot",
    "melanose":      "Melanose",
    "sooty_mould":   "Sooty Mould",
    "tristeza":      "Citrus Tristeza Virus",
    "scab":          "Citrus Scab",
    "healthy":       "Healthy Plant",
}

SEVERITY_MAP = {
    "citrus_canker": "high",
    "hlb":           "critical",
    "black_spot":    "medium",
    "root_rot":      "high",
    "melanose":      "low",
    "sooty_mould":   "low",
    "tristeza":      "critical",
    "scab":          "medium",
    "healthy":       "none",
}

model = None  # global model handle


def load_model():
    """Load the trained Keras model from disk."""
    global model
    if not TF_AVAILABLE:
        print("⚠️  Simulation mode: TensorFlow not installed")
        return

    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"✅ Model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"⚠️  Could not load model: {e} — using simulation mode")
    else:
        print(f"⚠️  Model file not found at {MODEL_PATH} — using simulation mode")


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Load image bytes → normalised (1, 224, 224, 3) float32 tensor."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def run_inference(image_bytes: bytes) -> dict:
    """
    Run inference on raw image bytes.
    Returns dict with primary prediction + full probability vector.
    """
    if model is not None and TF_AVAILABLE:
        tensor = preprocess_image(image_bytes)
        preds  = model.predict(tensor, verbose=0)[0]
        probs  = preds.tolist()
    else:
        # Simulation: return realistic-looking random probabilities
        probs = _simulate_probs()

    # Build result
    indexed = sorted(
        [(CLASS_LABELS[i], p) for i, p in enumerate(probs)],
        key=lambda x: x[1],
        reverse=True,
    )

    primary_id, primary_conf = indexed[0]
    top3 = [
        {
            "id":         cid,
            "name":       CLASS_NAMES[cid],
            "confidence": round(conf, 4),
            "severity":   SEVERITY_MAP[cid],
        }
        for cid, conf in indexed[:3]
    ]

    return {
        "primary": {
            "id":         primary_id,
            "name":       CLASS_NAMES[primary_id],
            "confidence": round(primary_conf, 4),
            "severity":   SEVERITY_MAP[primary_id],
        },
        "top3": top3,
        "probabilities": {CLASS_NAMES[cid]: round(p, 4) for cid, p in indexed},
    }


def _simulate_probs() -> list:
    """Generate realistic-looking probability distribution for demo mode."""
    probs = [random.uniform(0.001, 0.05) for _ in CLASS_LABELS]
    winner = random.randint(0, len(CLASS_LABELS) - 2)   # exclude healthy less often
    probs[winner] += random.uniform(0.6, 0.92)
    total = sum(probs)
    return [p / total for p in probs]