from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "SportManager API está viva 🚀",
        "env": "Vercel Production 2026"
    }

@app.get("/test")
def test_route():
    return {"message": "La ruta de prueba funciona correctamente"}