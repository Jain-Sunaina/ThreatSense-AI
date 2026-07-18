from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SensorReading(BaseModel):
    temperature: float
    humidity:    float
    air_quality: float
    device_id:   str = "DEV-01"


class PredictionOut(BaseModel):
    prediction:  str
    severity:    str
    device_id:   str
    temperature: float
    humidity:    float
    air_quality: float
    timestamp:   datetime

    class Config:
        from_attributes = True


class DeviceOut(BaseModel):
    device_id:   str
    name:        str
    device_type: str
    status:      str
    last_seen:   Optional[datetime]
    temperature: Optional[float] = None
    humidity:    Optional[float] = None
    air_quality: Optional[float] = None
    prediction:  Optional[str]   = None

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id:          int
    device_id:   str
    timestamp:   datetime
    severity:    str
    description: str
    prediction:  str

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_devices:   int
    healthy_devices: int
    threat_count:    int
    accuracy:        float
    total_predictions: int
    anomaly_count:   int


class HealthOut(BaseModel):
    status:          str
    model_status:    str
    db_status:       str
    model_name:      str
    last_prediction: Optional[str]
    api_endpoint:    str
    version:         str
    system_health:   str
