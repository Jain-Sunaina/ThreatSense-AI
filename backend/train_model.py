"""
ThreatSense AI — Model Training Script
Trains an Isolation Forest anomaly detection model on a CSV dataset
and saves it as model.pkl using joblib.

Usage:
    python train_model.py --dataset <path_to_csv>

Example:
    python train_model.py --dataset ../data/raw/sensor_data.csv
"""

import argparse
import sys
import os

import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest


# ── Configuration ─────────────────────────────────────────────
CONTAMINATION  = 0.05
RANDOM_STATE   = 42
MODEL_OUT_PATH = os.path.join(os.path.dirname(__file__), "../data/models/model.pkl")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train an Isolation Forest model on an IoT sensor CSV dataset."
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "../data/raw/iot_telemetry_data.csv"),
        help="Path to the input CSV file (default: ../data/raw/sensor_data.csv)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=MODEL_OUT_PATH,
        help="Path to save the trained model .pkl file (default: ../data/models/model.pkl)",
    )
    return parser.parse_args()


def load_dataset(path: str) -> pd.DataFrame:
    """Load CSV and return a DataFrame, with basic existence check."""
    if not os.path.isfile(path):
        print(f"[ERROR] Dataset file not found: {path}")
        sys.exit(1)

    df = pd.read_csv(path)

    if df.empty:
        print("[ERROR] The dataset is empty.")
        sys.exit(1)

    return df


def select_numerical_features(df: pd.DataFrame) -> pd.DataFrame:
    """Select only numerical columns; exit if none are found."""
    num_df = df.select_dtypes(include=["number"])

    if num_df.empty:
        print("[ERROR] No numerical columns found in the dataset.")
        sys.exit(1)

    # Drop columns that are entirely NaN, then fill remaining NaNs with column median
    num_df = num_df.dropna(axis=1, how="all")
    num_df = num_df.fillna(num_df.median(numeric_only=True))

    return num_df


def train_isolation_forest(X: pd.DataFrame) -> IsolationForest:
    """Train and return a fitted Isolation Forest model."""
    model = IsolationForest(
        contamination=CONTAMINATION,
        random_state=RANDOM_STATE,
        n_estimators=100,
        n_jobs=-1,
    )
    model.fit(X)
    return model


def save_model(model: IsolationForest, output_path: str) -> None:
    """Persist the trained model to disk using joblib."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    joblib.dump(model, output_path)


def main() -> None:
    args = parse_args()

    # ── 1. Load dataset ───────────────────────────────────────
    df = load_dataset(args.dataset)
    print("─" * 48)
    print(f"  Dataset Shape          : {df.shape[0]} rows × {df.shape[1]} columns")

    # ── 2. Select numerical features ─────────────────────────
    X = df[["temp", "humidity", "co"]]
    # Fill missing values just in case
    X = X.fillna(X.median(numeric_only=True))

    print(f"  Numerical Features Used: {list(X.columns)}")
    print(f"  Feature Count          : {X.shape[1]}")

    # ── 3. Train Isolation Forest ─────────────────────────────
    print("─" * 48)
    print("  Training Isolation Forest …")
    print(f"    contamination = {CONTAMINATION}")
    print(f"    random_state  = {RANDOM_STATE}")

    model = train_isolation_forest(X)

    # ── 4. Save model ─────────────────────────────────────────
    save_model(model, args.output)

    print("─" * 48)
    print("  Training Completed Successfully")
    print(f"  Model saved to         : {os.path.abspath(args.output)}")
    print("─" * 48)


if __name__ == "__main__":
    main()
