import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "deepsight.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        prediction TEXT NOT NULL,
        prediction_label INTEGER NOT NULL,
        confidence REAL NOT NULL,
        authenticity_score REAL NOT NULL,
        explanation TEXT NOT NULL,
        prediction_time_ms REAL NOT NULL,
        brightness REAL NOT NULL,
        contrast REAL NOT NULL,
        sharpness REAL NOT NULL,
        entropy REAL NOT NULL,
        color_histogram TEXT NOT NULL,
        original_b64 TEXT NOT NULL,
        heatmap_b64 TEXT NOT NULL,
        overlay_b64 TEXT NOT NULL,
        clahe_b64 TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

def save_prediction(
    filename: str,
    prediction: str,
    prediction_label: int,
    confidence: float,
    authenticity_score: float,
    explanation: str,
    prediction_time_ms: float,
    brightness: float,
    contrast: float,
    sharpness: float,
    entropy: float,
    color_histogram: dict,
    original_b64: str,
    heatmap_b64: str,
    overlay_b64: str,
    clahe_b64: str
) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO predictions (
        filename, prediction, prediction_label, confidence, authenticity_score,
        explanation, prediction_time_ms, brightness, contrast, sharpness, entropy,
        color_histogram, original_b64, heatmap_b64, overlay_b64, clahe_b64
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        filename, prediction, prediction_label, confidence, authenticity_score,
        explanation, prediction_time_ms, brightness, contrast, sharpness, entropy,
        json.dumps(color_histogram), original_b64, heatmap_b64, overlay_b64, clahe_b64
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_history(limit: int = 50):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, filename, prediction, prediction_label, confidence, authenticity_score,
           explanation, prediction_time_ms, brightness, contrast, sharpness, entropy,
           color_histogram, original_b64, heatmap_b64, overlay_b64, clahe_b64, created_at
    FROM predictions
    ORDER BY created_at DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        item = dict(row)
        try:
            item['color_histogram'] = json.loads(item['color_histogram'])
        except Exception:
            item['color_histogram'] = {}
        results.append(item)
    return results

def delete_history_item(item_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions WHERE id = ?", (item_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted
