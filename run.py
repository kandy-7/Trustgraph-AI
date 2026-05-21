"""
TrustGraph AI – Server Runner
Run from project root:
    python run.py
"""
import uvicorn
from backend.config import HOST, PORT, DEBUG

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host    = HOST,
        port    = PORT,
        reload  = DEBUG,
        log_level = "debug" if DEBUG else "info"
    )
