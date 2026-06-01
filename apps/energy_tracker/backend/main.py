import os
import sqlite3
import pandas as pd
import pickle
import numpy as np
from datetime import datetime

# Paths
DB_DIR = "apps/energy_tracker/backend/data/db"
DB_PATH = os.path.join(DB_DIR, "energy.db")
CSV_PATH = "energy_project/data/processed_energy_data.csv"
MODEL_PATH = "energy_project/models/rf_model.pkl"

def _get_db():
    """Open a connection with recommended settings."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def _init_db():
    """Initialize the SQLite database schema."""
    conn = _get_db()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS consumption_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                energy_sum REAL NOT NULL,
                temperature_max REAL NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    finally:
        conn.close()

def get_historical_data(limit: int = 365):
    """Load historical consumption and temperature, including manual readings."""
    print(f"[BACKEND_START] get_historical_data called with limit={limit}")
    try:
        all_records = []
        
        # 1. Load from CSV
        if os.path.exists(CSV_PATH):
            df = pd.read_csv(CSV_PATH)
            df['day'] = pd.to_datetime(df['day'])
            df = df.sort_values('day', ascending=False).head(limit)
            df['day'] = df['day'].dt.strftime('%Y-%m-%d')
            all_records = df[['day', 'energy_sum', 'temperatureMax']].to_dict(orient='records')
        
        # 2. Load from SQLite manual readings
        conn = _get_db()
        _init_db()
        manual_rows = conn.execute("SELECT date as day, energy_sum, temperature_max as temperatureMax FROM consumption_records ORDER BY date DESC").fetchall()
        conn.close()
        
        manual_records = [dict(r) for r in manual_rows]
        
        # 3. Combine and sort
        combined = manual_records + all_records
        # Sort by date descending
        combined.sort(key=lambda x: x['day'], reverse=True)
        
        results = combined[:limit]
        print(f"[BACKEND_SUCCESS] Returning {len(results)} historical records (including {len(manual_records)} manual)")
        return results
    except Exception as e:
        print(f"[BACKEND_ERROR] get_historical_data failed: {str(e)}")
        raise

def predict_energy(year: int, month: int, day: int):
    """Use the loaded .pkl model to predict energy consumption for a specific date."""
    print(f"[BACKEND_START] predict_energy called for {year}-{month:02d}-{day:02d}")
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"[BACKEND_ERROR] Model file not found at {MODEL_PATH}")
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
            
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
            
        # Standardize inputs based on typical RF models (year, month, day)
        # Assuming the model was trained on [year, month, day] features
        features = np.array([[year, month, day]])
        prediction = model.predict(features)[0]
        
        result = {
            "date": f"{year}-{month:02d}-{day:02d}",
            "predicted_energy": float(round(prediction, 2)),
            "unit": "kWh"
        }
        print(f"[BACKEND_SUCCESS] Prediction complete: {result['predicted_energy']} kWh")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] predict_energy failed: {str(e)}")
        raise

def get_stats():
    """Calculate high-level stats (avg consumption, max temp correlation, total records)."""
    print("[BACKEND_START] get_stats called")
    try:
        if not os.path.exists(CSV_PATH):
            return {"avg_consumption": 0, "peak_consumption": 0, "temp_correlation": 0, "total_records": 0}
            
        df = pd.read_csv(CSV_PATH)
        
        avg_cons = float(df['energy_sum'].mean())
        peak_cons = float(df['energy_sum'].max())
        corr = float(df['energy_sum'].corr(df['temperatureMax']))
        total = len(df)
        
        # Merge with manual readings if any
        conn = _get_db()
        _init_db()
        manual_rows = conn.execute("SELECT energy_sum, temperature_max FROM consumption_records").fetchall()
        conn.close()
        
        if manual_rows:
            manual_df = pd.DataFrame([dict(r) for r in manual_rows])
            total += len(manual_df)
            # Recalculate with combined data if needed, but for now we focus on the large historical set
            # for correlation and averages as manual data might be sparse initially
            
        stats = {
            "avg_consumption": round(avg_cons, 2),
            "peak_consumption": round(peak_cons, 2),
            "temp_correlation": round(corr, 4),
            "total_records": total
        }
        print(f"[BACKEND_SUCCESS] Stats generated: {stats}")
        return stats
    except Exception as e:
        print(f"[BACKEND_ERROR] get_stats failed: {str(e)}")
        raise

def add_manual_reading(date: str, energy_sum: float, temperature_max: float):
    """Allow users to log a new meter reading to the SQLite database."""
    print(f"[BACKEND_START] add_manual_reading called for {date}")
    try:
        conn = _get_db()
        _init_db()
        cursor = conn.execute(
            "INSERT INTO consumption_records (date, energy_sum, temperature_max) VALUES (?, ?, ?)",
            (date, energy_sum, temperature_max)
        )
        conn.commit()
        record_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM consumption_records WHERE id = ?", (record_id,)).fetchone()
        conn.close()
        
        result = dict(row)
        print(f"[BACKEND_SUCCESS] Manual reading added with ID {record_id}")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] add_manual_reading failed: {str(e)}")
        raise
