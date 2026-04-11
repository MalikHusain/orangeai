"""
OrangeAI — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from database.db import init_db
from routes import detect, history, geo, stats, tts
from ml.model import load_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🍊 OrangeAI starting up...")
    await init_db()
    load_model()
    print("✅ Model loaded. Server ready.")
    yield
    # Shutdown
    print("OrangeAI shutting down.")

app = FastAPI(
    title="OrangeAI API",
    description="Orange Disease Detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for local development
# NOTE: allow_credentials must be False when allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(detect.router,  prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(geo.router,     prefix="/api")
app.include_router(stats.router,   prefix="/api")
app.include_router(tts.router,     prefix="/api")

@app.get("/api/health")
async def health():
    from ml.model import model
    return {
        "status": "ok",
        "model":  "loaded" if model is not None else "simulation",
        "version": "1.0.0",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)