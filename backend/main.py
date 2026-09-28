import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app import app, db

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database initialized")
    app.run(debug=True, host='0.0.0.0', port=8000)
