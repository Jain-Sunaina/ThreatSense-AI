from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db, Alert
from ..schemas import AlertOut

router = APIRouter()


@router.get("/alerts", response_model=List[AlertOut])
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter: Critical | High | Warning | Info"),
    limit:    int            = Query(50,   ge=1, le=200),
    db:       Session        = Depends(get_db),
):
    q = db.query(Alert).order_by(Alert.timestamp.desc())
    if severity and severity.lower() != "all":
        q = q.filter(Alert.severity == severity)
    return q.limit(limit).all()
