import os
from fastapi import FastAPI
from supabase import create_client, Client

app = FastAPI()

# Traemos las credenciales de las variables de entorno de Vercel
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

@app.get("/")
def test_supabase():
    try:
        # Intentamos crear el cliente
        supabase: Client = create_client(url, key)
        # Hacemos una consulta mini a cualquier tabla (ej. productos)
        # Si no tienes tablas aún, solo comenta la línea de abajo
        # response = supabase.table("productos").select("*").limit(1).execute()
        return {"status": "success", "message": "Conectado a Supabase correctamente"}
    except Exception as e:
        return {"status": "error", "reason": str(e)}
