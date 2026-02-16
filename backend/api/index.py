import os
from fastapi import FastAPI
from supabase import create_client

app = FastAPI()

# Sin strips, sin validaciones raras, directo al grano
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

@app.get("/")
def home():
    try:
        # Si esto falla, el error 500 te dirá por qué en los logs
        supabase = create_client(url, key)
        return {"status": "ok", "message": "SportManager conectado"}
    except Exception as e:
        # Esto evitará el error 500 y te mostrará el texto del error en pantalla
        return {"status": "error", "details": str(e)}