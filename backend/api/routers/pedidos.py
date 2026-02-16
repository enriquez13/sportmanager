from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..database import supabase
from ..models import PedidoCreate, PedidoUpdate

router = APIRouter()

@router.get("/")
def listar_pedidos(estado: str = None):
    query = supabase.table("pedidos").select("*").order("id", desc=True)
    if estado:
        query = query.eq("estado", estado)
    return query.execute().data

@router.post("/", status_code=201)
def crear_pedido(pedido: PedidoCreate):
    data = pedido.model_dump()
    data["estado"] = "pendiente"
    if not data.get("fecha_pedido"):
        data["fecha_pedido"] = datetime.now().strftime("%Y-%m-%d")
    else:
        data["fecha_pedido"] = str(data["fecha_pedido"])
    if data.get("fecha_llegada_estimada"):
        data["fecha_llegada_estimada"] = str(data["fecha_llegada_estimada"])
    res = supabase.table("pedidos").insert(data).execute()
    return res.data[0]

@router.patch("/{id}")
def actualizar_pedido(id: int, cambios: PedidoUpdate):
    data = {k: v for k, v in cambios.model_dump().items() if v is not None}
    if "fecha_llegada_estimada" in data:
        data["fecha_llegada_estimada"] = str(data["fecha_llegada_estimada"])
    res = supabase.table("pedidos").update(data).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return res.data[0]

@router.patch("/{id}/recibido")
def marcar_recibido(id: int):
    res = supabase.table("pedidos").update({"estado": "recibido"}).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return res.data[0]

@router.delete("/{id}", status_code=204)
def eliminar_pedido(id: int):
    supabase.table("pedidos").delete().eq("id", id).execute()
