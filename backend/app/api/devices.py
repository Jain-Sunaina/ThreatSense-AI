from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db, Device, SensorReading, Prediction
from ..schemas import DeviceOut

router = APIRouter()


@router.get("/devices", response_model=List[DeviceOut])
def get_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).order_by(Device.device_id).all()
    result  = []

    for dev in devices:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.device_id == dev.device_id)
            .order_by(SensorReading.timestamp.desc())
            .first()
        )
        latest_pred = (
            db.query(Prediction)
            .filter(Prediction.device_id == dev.device_id)
            .order_by(Prediction.timestamp.desc())
            .first()
        )
        result.append(DeviceOut(
            device_id=dev.device_id,
            name=dev.name,
            device_type=dev.device_type,
            status=dev.status,
            last_seen=dev.last_seen,
            temperature=latest.temperature if latest else None,
            humidity=latest.humidity    if latest else None,
            air_quality=latest.air_quality if latest else None,
            prediction=latest_pred.result  if latest_pred else None,
        ))

    return result
