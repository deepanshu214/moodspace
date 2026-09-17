import sys
from pathlib import Path

# Ensure the backend directory is in sys.path so that all internal `src.*` imports resolve correctly
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from src.main import app
