import sqlite3
import os

db_path = os.path.join('instance', 'expense_tracker.db')
conn = sqlite3.connect(db_path)
try:
    conn.execute("ALTER TABLE expenses ADD COLUMN type VARCHAR(20) DEFAULT 'expense'")
    conn.commit()
    print("Migration successful")
except sqlite3.OperationalError as e:
    print(f"Migration error (already exists?): {e}")
conn.close()
