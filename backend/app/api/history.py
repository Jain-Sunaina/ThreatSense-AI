from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db, Prediction
from ..schemas import PredictionOut

router = APIRouter()


@router.get("/history", response_model=List[PredictionOut])
def get_history(
    device_id: Optional[str] = Query(None),
    limit:     int            = Query(50, ge=1, le=200),
    db:        Session        = Depends(get_db),
):
    q = db.query(Prediction).order_by(Prediction.timestamp.desc())
    if device_id:
        q = q.filter(Prediction.device_id == device_id)
    return q.limit(limit).all()
