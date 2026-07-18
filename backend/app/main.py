from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .database.seed import seed_devices
from .api import (
    predict_router, devices_router, alerts_router,
    history_router, stats_router,   health_router,
)

BASE_DIR   = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "data" / "models" / "model.pkl"


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_devices()

    try:
        app.state.model = joblib.load(MODEL_PATH)
        print(f"[ThreatSense AI] Model loaded from '{MODEL_PATH}'")
    except FileNotFoundError:
        app.state.model = None
        print(f"[ThreatSense AI] WARNING: model.pkl not found at '{MODEL_PATH}'")

    app.state.last_prediction_time = None
    yield


app = FastAPI(
    title="ThreatSense AI",
    description="Real-Time AI Powered IoT Threat Detection",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(devices_router)
app.include_router(alerts_router)
app.include_router(history_router)
app.include_router(stats_router)
app.include_router(health_router)


@app.get("/")
def home():
    return {
        "project": "ThreatSense AI",
        "version": "2.0.0",
        "status":  "Running",
        "docs":    "/docs",
    }
