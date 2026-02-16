from fastapi import APIRouter, HTTPException
# Cambiamos de 'from ..database' a esto:
from database import supabase 
# Y lo mismo para models si está en /api/models.py
from models import ProductoCreate, ProductoUpdate

router = APIRouter()

@router.get("/")
def listar_productos():
    res = supabase.table("productos").select("*").order("nombre").execute()
    return res.data

@router.get("/{id}")
def obtener_producto(id: int):
    res = supabase.table("productos").select("*").eq("id", id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return res.data

@router.post("/", status_code=201)
def crear_producto(producto: ProductoCreate):
    res = supabase.table("productos").insert(producto.model_dump()).execute()
    return res.data[0]

@router.patch("/{id}")
def actualizar_producto(id: int, cambios: ProductoUpdate):
    data = {k: v for k, v in cambios.model_dump().items() if v is not None}
    res = supabase.table("productos").update(data).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return res.data[0]

@router.delete("/{id}", status_code=204)
def eliminar_producto(id: int):
    supabase.table("productos").delete().eq("id", id).execute()
