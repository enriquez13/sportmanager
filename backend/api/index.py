import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

# Esto ayuda a Vercel a encontrar tu carpeta 'routers'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importamos los routers (Sin el punto inicial)
from routers import productos, ventas, separados, pedidos, facturas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# VARIABLES DE ENTORNO (Ya sabemos que funcionan)
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

@app.get("/")
def home():
    return {"status": "ok", "message": "SportManager API 🏃 - Conexión Exitosa"}

# ACTIVACIÓN PROGRESIVA: 
# Prueba primero solo con productos. Si funciona, descomenta el resto uno por uno.
app.include_router(productos.router, prefix="/productos", tags=["productos"])
# app.include_router(ventas.router,    prefix="/ventas",    tags=["ventas"])
# app.include_router(separados.router, prefix="/separados", tags=["separados"])