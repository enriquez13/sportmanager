import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Asegura que Python encuentre database.py y la carpeta routers
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import productos, ventas, separados, pedidos, facturas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registramos todos los módulos
app.include_router(productos.router, prefix="/productos", tags=["productos"])
app.include_router(ventas.router,    prefix="/ventas",    tags=["ventas"])
app.include_router(separados.router, prefix="/separados", tags=["separados"])
app.include_router(pedidos.router,   prefix="/pedidos",   tags=["pedidos"])
app.include_router(facturas.router,  prefix="/facturas",  tags=["facturas"])

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "SportManager API v1.0 - Sistema de Gestión Activo",
        "modulos": ["productos", "ventas", "separados", "pedidos", "facturas"]
    }