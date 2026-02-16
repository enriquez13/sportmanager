from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ruta exacta según tu árbol de archivos
from backend.api.routers import productos, ventas, separados, pedidos, facturas 

app = FastAPI(title="SportManager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ en producción reemplaza por tu dominio frontend de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.include_router(productos.router, prefix="/productos", tags=["productos"])
#app.include_router(ventas.router,    prefix="/ventas",    tags=["ventas"])
#app.include_router(separados.router, prefix="/separados", tags=["separados"])
#app.include_router(pedidos.router,   prefix="/pedidos",   tags=["pedidos"])
#app.include_router(facturas.router,  prefix="/facturas",  tags=["facturas"])

@app.get("/")
def health():
    return {"status": "ok", "message": "SportManager API 🏃"}
