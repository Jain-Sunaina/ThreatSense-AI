from datetime import datetime
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db, Device, SensorReading, Alert, Prediction
from ..schemas import SensorReading as SensorReadingSchema, PredictionOut

router = APIRouter()

SEVERITY_MAP = {
    ("Anomaly", True):  "Critical",
    ("Anomaly", False): "High",
    ("Normal",  True):  "Warning",
    ("Normal",  False): "Info",
}

ATTACK_LABELS = [
    "DoS Attack", "MITM Attack", "Replay Attack",
    "Fuzzing", "Data Injection", "Brute Force", "Spoofing",
]


def _assign_severity(result: str, extreme: bool) -> str:
    return SEVERITY_MAP.get((result, extreme), "Info")


def _is_extreme(temp: float, humidity: float, aqi: float) -> bool:
    return temp > 45 or humidity < 15 or aqi > 175


@router.post("/predict", response_model=PredictionOut)
def predict(reading: SensorReadingSchema, request: Request, db: Session = Depends(get_db)):
    model = getattr(request.app.state, "model", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    features = np.array([[reading.temperature, reading.humidity, reading.air_quality]])
    raw      = model.predict(features)
    result   = "Anomaly" if raw[0] == -1 else "Normal"
    extreme  = _is_extreme(reading.temperature, reading.humidity, reading.air_quality)
    severity = _assign_severity(result, extreme)

    now = datetime.utcnow()

    device = db.query(Device).filter(Device.device_id == reading.device_id).first()
    if not device:
        device = Device(
            device_id=reading.device_id,
            name=reading.device_id,
            device_type="IoT Sensor",
            status="healthy",
        )
        db.add(device)

    device.last_seen = now
    device.status    = "danger" if result == "Anomaly" else "healthy"

    db.add(SensorReading(
        device_id=reading.device_id,
        timestamp=now,
        temperature=reading.temperature,
        humidity=reading.humidity,
        air_quality=reading.air_quality,
    ))

    db.add(Prediction(
        device_id=reading.device_id,
        timestamp=now,
        temperature=reading.temperature,
        humidity=reading.humidity,
        air_quality=reading.air_quality,
        result=result,
        severity=severity,
    ))

    if result == "Anomaly":
        import random
        attack = random.choice(ATTACK_LABELS)
        db.add(Alert(
            device_id=reading.device_id,
            timestamp=now,
            severity=severity,
            description=f"{attack} detected on {reading.device_id}",
            prediction=result,
        ))

    db.commit()

    request.app.state.last_prediction_time = now.isoformat()

    return PredictionOut(
        prediction=result,
        severity=severity,
        device_id=reading.device_id,
        temperature=reading.temperature,
        humidity=reading.humidity,
        air_quality=reading.air_quality,
        timestamp=now,
    )
