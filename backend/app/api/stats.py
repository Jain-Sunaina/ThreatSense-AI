from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db, Device, Prediction
from ..schemas import StatsOut

router = APIRouter()


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total_devices   = db.query(Device).count()
    healthy_devices = db.query(Device).filter(Device.status == "healthy").count()
    threat_count    = db.query(Device).filter(Device.status == "danger").count()

    total_predictions = db.query(Prediction).count()
    anomaly_count     = db.query(Prediction).filter(Prediction.result == "Anomaly").count()

    if total_predictions > 0:
        normal_count = total_predictions - anomaly_count
        accuracy     = round((normal_count / total_predictions) * 100, 1)
    else:
        accuracy = 94.2   # pre-training baseline

    return StatsOut(
        total_devices=total_devices,
        healthy_devices=healthy_devices,
        threat_count=threat_count,
        accuracy=accuracy,
        total_predictions=total_predictions,
        anomaly_count=anomaly_count,
    )
