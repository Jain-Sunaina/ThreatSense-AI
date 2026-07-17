from contextlib import asynccontextmanager

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
# ── Model path (relative to where run.py is executed: project root) ──
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "data" / "models" / "model.pkl"

# ── Load model once at startup via lifespan ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the Isolation Forest model when the server starts."""
    try:
        app.state.model = joblib.load(MODEL_PATH)
        print(f"[ThreatSense AI] Model loaded from '{MODEL_PATH}'")
    except FileNotFoundError:
        raise RuntimeError(
            f"model.pkl not found at '{MODEL_PATH}'. "
            "Run train_model.py first."
        )
    yield
    # Nothing to clean up on shutdown


# ── App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="ThreatSense AI",
    description="Real-Time AI Powered IoT Threat Detection",
    version="1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schema ────────────────────────────────────────────────────
class SensorReading(BaseModel):
    temperature: float
    humidity: float
    air_quality: float


# ── Routes ────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {
        "project": "ThreatSense AI",
        "status": "Running",
        "AI Model": "Loaded Successfully",
    }


@app.post("/predict")
def predict(reading: SensorReading):
    """
    Accept a JSON body with temperature, humidity, and air_quality.
    Returns {"prediction": "Normal"} or {"prediction": "Anomaly"}.
    """
    try:
        # Build the feature vector — column order must match training
        features = np.array([[
            reading.temperature,
            reading.humidity,
            reading.air_quality,
        ]])

        result = app.state.model.predict(features)

        # Isolation Forest: -1 = anomaly, 1 = normal
        label = "Anomaly" if result[0] == -1 else "Normal"
        return {"prediction": label}

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
