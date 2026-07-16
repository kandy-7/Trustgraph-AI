"""
TrustGraph AI — Dual Server Runner
Runs both FastAPI backend (port 8000) and Vite frontend (port 5173) concurrently.
Run from project root:
    python run.py
"""
import sys
import os
import subprocess
import time
import signal

def run_servers():
    print("🚀 Starting TrustGraph AI Platform...")
    
    # 1. Start backend process
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"]
    print(f"📡 Launching FastAPI backend on http://127.0.0.1:8000")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=os.path.abspath(os.path.dirname(__file__)),
        stdout=None,
        stderr=None
    )

    # Allow backend a second to bind port
    time.sleep(1)

    # 2. Start frontend process
    frontend_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), "frontend")
    print(f"💻 Launching Vite frontend in {frontend_dir}...")
    
    # Cross-platform npm command handling
    shell_flag = sys.platform == "win32"
    npm_cmd = ["npm", "run", "dev"]
    
    frontend_proc = subprocess.Popen(
        npm_cmd,
        cwd=frontend_dir,
        shell=shell_flag,
        stdout=None,
        stderr=None
    )

    print("\n✅ Both servers are running!")
    print("👉 Frontend: http://localhost:5173")
    print("👉 Backend API: http://127.0.0.1:8000/api")
    print("👉 API Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.")

    try:
        # Keep runner alive while processes run
        while True:
            if backend_proc.poll() is not None:
                print("❌ Backend server stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("❌ Frontend dev server stopped unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
    finally:
        # Terminate processes cleanly
        for proc, name in [(backend_proc, "Backend"), (frontend_proc, "Frontend")]:
            try:
                if proc.poll() is None:
                    if sys.platform == "win32":
                        subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    else:
                        proc.terminate()
                        proc.wait(timeout=2)
                    print(f"🔌 Stopped {name} server.")
            except Exception as e:
                print(f"Could not stop {name} process: {e}")
        print("👋 TrustGraph AI offline.")

if __name__ == "__main__":
    run_servers()
