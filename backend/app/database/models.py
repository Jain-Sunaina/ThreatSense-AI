from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .session import Base


class Device(Base):
    __tablename__ = "devices"

    id          = Column(Integer, primary_key=True, index=True)
    device_id   = Column(String, unique=True, index=True, nullable=False)
    name        = Column(String, nullable=False)
    device_type = Column(String, nullable=False)
    status      = Column(String, default="healthy")   # healthy | warning | danger | offline
    last_seen   = Column(DateTime, default=datetime.utcnow)

    readings    = relationship("SensorReading", back_populates="device", cascade="all, delete-orphan")
    alerts      = relationship("Alert",         back_populates="device", cascade="all, delete-orphan")
    predictions = relationship("Prediction",    back_populates="device", cascade="all, delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id          = Column(Integer, primary_key=True, index=True)
    device_id   = Column(String, ForeignKey("devices.device_id"), nullable=False)
    timestamp   = Column(DateTime, default=datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False)
    humidity    = Column(Float, nullable=False)
    air_quality = Column(Float, nullable=False)

    device      = relationship("Device", back_populates="readings")


class Alert(Base):
    __tablename__ = "alerts"

    id          = Column(Integer, primary_key=True, index=True)
    device_id   = Column(String, ForeignKey("devices.device_id"), nullable=False)
    timestamp   = Column(DateTime, default=datetime.utcnow, index=True)
    severity    = Column(String, nullable=False)      # Info | Warning | High | Critical
    description = Column(String, nullable=False)
    prediction  = Column(String, nullable=False)      # Normal | Anomaly

    device      = relationship("Device", back_populates="alerts")


class Prediction(Base):
    __tablename__ = "predictions"

    id          = Column(Integer, primary_key=True, index=True)
    device_id   = Column(String, ForeignKey("devices.device_id"), nullable=False)
    timestamp   = Column(DateTime, default=datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False)
    humidity    = Column(Float, nullable=False)
    air_quality = Column(Float, nullable=False)
    result      = Column(String, nullable=False)      # Normal | Anomaly
    severity    = Column(String, nullable=False)      # Info | Warning | High | Critical

    device      = relationship("Device", back_populates="predictions")
