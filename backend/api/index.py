import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importación estándar 2026:
from supabase import create_client, Client

app = FastAPI()

# Configuración de CORS para el frontend que está en el otro proyecto de Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Variables de entorno (Asegúrate de que no tengan espacios en Vercel)
url: str = os.environ.get("SUPABASE_URL", "").strip()
key: str = os.environ.get("SUPABASE_KEY", "").strip()

# Inicialización fuera de las rutas para mejor rendimiento (Serverless Cold Start)
supabase: Client = create_client(url, key)

@app.get("/")
def home():
    return {"status": "success", "message": "SportManager 2026 Online"}

# Si vas a importar tus routers, hazlo así:
# from routers import productos
# app.include_router(productos.router)