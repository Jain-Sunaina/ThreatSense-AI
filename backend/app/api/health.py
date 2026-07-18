from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..database import get_db
from ..schemas import HealthOut

router = APIRouter()

API_ENDPOINT = "https://threatsense-ai.onrender.com"
VERSION      = "2.0.0"


@router.get("/health", response_model=HealthOut)
def health(request: Request, db: Session = Depends(get_db)):
    model_ok = getattr(request.app.state, "model", None) is not None

    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    last_pred = getattr(request.app.state, "last_prediction_time", None)

    overall = "Healthy" if model_ok and db_ok else "Degraded"

    return HealthOut(
        status=overall,
        model_status="Loaded" if model_ok else "Not Loaded",
        db_status="Connected" if db_ok else "Error",
        model_name="Isolation Forest",
        last_prediction=last_pred,
        api_endpoint=API_ENDPOINT,
        version=VERSION,
        system_health=overall,
    )
