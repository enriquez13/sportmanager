import os
import sys
from fastapi import FastAPI

# Asegura que Python vea tus carpetas locales
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from supabase import create_client
    SUPABASE_INSTALLED = True
except ImportError:
    SUPABASE_INSTALLED = False

app = FastAPI()

@app.get("/")
def check_connection():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not SUPABASE_INSTALLED:
        return {"status": "error", "message": "Falta 'supabase' en requirements.txt"}
    
    if not url or not key:
        return {"status": "error", "message": "Faltan las variables en Vercel"}

    try:
        # Probamos la conexión
        supabase = create_client(url, key)
        return {
            "status": "success",
            "message": "¡SportManager conectado a Supabase! 🏃🎁",
            "url_activa": url
        }
    except Exception as e:
        return {"status": "error", "details": str(e)}