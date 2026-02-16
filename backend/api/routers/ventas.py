from fastapi import APIRouter, HTTPException
from datetime import datetime
from database import supabase
from models import VentaCreate

router = APIRouter()

@router.get("/")
def listar_ventas(fecha: str = None):
    query = supabase.table("ventas").select("*").order("id", desc=True)
    if fecha:
        query = query.eq("fecha", fecha)
    return query.execute().data

@router.get("/hoy")
def ventas_hoy():
    hoy = datetime.now().strftime("%Y-%m-%d")
    res = supabase.table("ventas").select("*").eq("fecha", hoy).order("id", desc=True).execute()
    total = sum(v["total"] for v in res.data)
    return {"ventas": res.data, "total_dia": total, "cantidad": len(res.data)}

@router.post("/", status_code=201)
def registrar_venta(venta: VentaCreate):
    ahora = datetime.now()

    # Descontar stock de cada producto vendido
    for item in venta.items:
        if item.producto_id:
            prod = supabase.table("productos").select("stock").eq("id", item.producto_id).single().execute()
            if not prod.data:
                raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no encontrado")
            nuevo_stock = prod.data["stock"] - item.cantidad
            if nuevo_stock < 0:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {item.nombre}")
            supabase.table("productos").update({"stock": nuevo_stock}).eq("id", item.producto_id).execute()

    data = venta.model_dump()
    data["fecha"] = ahora.strftime("%Y-%m-%d")
    data["hora"]  = ahora.strftime("%H:%M")
    # Supabase no acepta objetos anidados directamente → serializar items
    data["items"] = [i.model_dump() if hasattr(i, "model_dump") else i for i in venta.items]

    res = supabase.table("ventas").insert(data).execute()
    return res.data[0]

@router.delete("/{id}", status_code=204)
def eliminar_venta(id: int):
    supabase.table("ventas").delete().eq("id", id).execute()
