import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. TRUCO DE RUTAS: Para que encuentre 'database.py' y la carpeta 'routers'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 2. IMPORTACIONES LOCALES (Ahora que el path está arreglado)
from routers import productos
# Descomenta los demás a medida que los limpies de los ".."
# from routers import ventas, separados, pedidos, facturas

app = FastAPI()

# 3. MIDDLEWARE: Vital para que tu frontend no dé error de "CORS"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. RUTAS
app.include_router(productos.router, prefix="/productos", tags=["productos"])

@app.get("/")
def home():
    return {
        "status": "ok", 
        "message": "SportManager API Online",
        "routers_activos": ["productos"]
    }