from .session import SessionLocal
from .models import Device

INITIAL_DEVICES = [
    {"device_id": "DEV-01", "name": "Temp Sensor Alpha",    "device_type": "Temp Sensor",     "status": "healthy"},
    {"device_id": "DEV-02", "name": "Humidity Node Beta",   "device_type": "Humidity Sensor",  "status": "healthy"},
    {"device_id": "DEV-03", "name": "AQ Monitor Gamma",     "device_type": "Air Quality",      "status": "warning"},
    {"device_id": "DEV-04", "name": "Water Flow Delta",     "device_type": "Water Flow",       "status": "healthy"},
    {"device_id": "DEV-05", "name": "Voltage Probe Epsilon","device_type": "Voltage Meter",    "status": "healthy"},
    {"device_id": "DEV-06", "name": "Traffic Cam Zeta",     "device_type": "Traffic Cam",      "status": "healthy"},
    {"device_id": "DEV-07", "name": "Temp Sensor Eta",      "device_type": "Temp Sensor",      "status": "danger"},
    {"device_id": "DEV-08", "name": "Humidity Node Theta",  "device_type": "Humidity Sensor",  "status": "warning"},
    {"device_id": "DEV-09", "name": "AQ Monitor Iota",      "device_type": "Air Quality",      "status": "healthy"},
    {"device_id": "DEV-10", "name": "Voltage Probe Kappa",  "device_type": "Voltage Meter",    "status": "offline"},
]


def seed_devices():
    db = SessionLocal()
    try:
        for d in INITIAL_DEVICES:
            exists = db.query(Device).filter(Device.device_id == d["device_id"]).first()
            if not exists:
                db.add(Device(**d))
        db.commit()
    finally:
        db.close()
