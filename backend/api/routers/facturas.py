from fastapi import APIRouter
from datetime import datetime
from ..database import supabase
from ..models import FacturaCreate

router = APIRouter()

@router.get("/")
def listar_facturas():
    return supabase.table("facturas").select("*").order("id", desc=True).execute().data

@router.post("/", status_code=201)
def crear_factura(factura: FacturaCreate):
    data = factura.model_dump()
    data["fecha"] = datetime.now().strftime("%Y-%m-%d")
    res = supabase.table("facturas").insert(data).execute()
    return res.data[0]
