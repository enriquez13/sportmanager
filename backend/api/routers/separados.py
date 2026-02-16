from fastapi import APIRouter, HTTPException
from datetime import datetime
from database import supabase
from models import SeparadoCreate, SeparadoUpdate

router = APIRouter()

@router.get("/")
def listar_separados(estado: str = None, tipo: str = None):
    query = supabase.table("separados").select("*").order("id", desc=True)
    if estado:
        query = query.eq("estado", estado)
    if tipo:
        query = query.eq("tipo", tipo)
    return query.execute().data

@router.post("/", status_code=201)
def crear_separado(sep: SeparadoCreate):
    data = sep.model_dump()
    data["estado"] = "activo"
    data["fecha_creacion"] = datetime.now().strftime("%Y-%m-%d")
    # convertir date a string para Supabase
    if data.get("fecha_limite"):
        data["fecha_limite"] = str(data["fecha_limite"])
    res = supabase.table("separados").insert(data).execute()
    return res.data[0]

@router.patch("/{id}")
def actualizar_separado(id: int, cambios: SeparadoUpdate):
    data = {k: v for k, v in cambios.model_dump().items() if v is not None}
    res = supabase.table("separados").update(data).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Separado no encontrado")
    return res.data[0]

@router.patch("/{id}/abono")
def registrar_abono(id: int, monto: float):
    sep = supabase.table("separados").select("abonado, total").eq("id", id).single().execute()
    if not sep.data:
        raise HTTPException(status_code=404, detail="Separado no encontrado")
    nuevo = min(sep.data["total"], sep.data["abonado"] + monto)
    res = supabase.table("separados").update({"abonado": nuevo}).eq("id", id).execute()
    return res.data[0]

@router.patch("/{id}/entregar")
def marcar_entregado(id: int):
    res = supabase.table("separados").update({"estado": "entregado"}).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Separado no encontrado")
    return res.data[0]

@router.delete("/{id}", status_code=204)
def eliminar_separado(id: int):
    supabase.table("separados").delete().eq("id", id).execute()
