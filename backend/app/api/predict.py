from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import os
import pandas as pd

router = APIRouter()

MODEL_PATH = "data/models/model.pkl"

model = joblib.load(MODEL_PATH)


class SensorData(BaseModel):
    co: float
    humidity: float
    lpg: float
    smoke: float
    temp: float


@router.post("/predict")
def predict(data: SensorData):

    df = pd.DataFrame([{
        "co": data.co,
        "humidity": data.humidity,
        "lpg": data.lpg,
        "smoke": data.smoke,
        "temp": data.temp
    }])

    prediction = model.predict(df)[0]

    return {
        "prediction": "Anomaly" if prediction == -1 else "Normal"
    }
    