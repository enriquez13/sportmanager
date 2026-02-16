from pydantic import BaseModel
from typing import Optional
from datetime import date

# ── PRODUCTOS ─────────────────────────────────────────────────────
class ProductoBase(BaseModel):
    nombre: str
    categoria: str
    precio: float
    costo: float = 0
    stock: int = 0
    stock_minimo: int = 0
    talla: Optional[str] = None
    color: Optional[str] = None
    sku: Optional[str] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[float] = None
    costo: Optional[float] = None
    stock: Optional[int] = None
    stock_minimo: Optional[int] = None
    talla: Optional[str] = None
    color: Optional[str] = None
    sku: Optional[str] = None

class Producto(ProductoBase):
    id: int
    class Config:
        from_attributes = True

# ── VENTAS ────────────────────────────────────────────────────────
class ItemVenta(BaseModel):
    producto_id: Optional[int] = None
    nombre: str
    cantidad: int
    precio_unitario: float

class VentaCreate(BaseModel):
    items: list[ItemVenta]
    metodo_pago: str
    total: float

class Venta(VentaCreate):
    id: int
    fecha: Optional[str] = None
    hora: Optional[str] = None
    class Config:
        from_attributes = True

# ── SEPARADOS ─────────────────────────────────────────────────────
class SeparadoBase(BaseModel):
    cliente: str
    telefono: Optional[str] = None
    tipo: str                       # "stock" | "pedido"
    producto: str
    total: float
    abonado: float = 0
    fecha_limite: Optional[date] = None
    notas: Optional[str] = None

class SeparadoCreate(SeparadoBase):
    pass

class SeparadoUpdate(BaseModel):
    abonado: Optional[float] = None
    estado: Optional[str] = None    # "activo" | "entregado"
    notas: Optional[str] = None

class Separado(SeparadoBase):
    id: int
    estado: str = "activo"
    fecha_creacion: Optional[str] = None
    class Config:
        from_attributes = True

# ── PEDIDOS ───────────────────────────────────────────────────────
class PedidoBase(BaseModel):
    fabricante: str
    productos: str
    valor: float = 0
    fecha_pedido: Optional[date] = None
    fecha_llegada_estimada: Optional[date] = None
    clientes_esperando: Optional[str] = None

class PedidoCreate(PedidoBase):
    pass

class PedidoUpdate(BaseModel):
    estado: Optional[str] = None    # "pendiente" | "recibido" | "cancelado"
    fecha_llegada_estimada: Optional[date] = None

class Pedido(PedidoBase):
    id: int
    estado: str = "pendiente"
    class Config:
        from_attributes = True

# ── FACTURAS ──────────────────────────────────────────────────────
class ItemFactura(BaseModel):
    producto: str
    cantidad: int
    precio: float
    subtotal: float

class FacturaCreate(BaseModel):
    cliente: str
    telefono: Optional[str] = None
    items: list[ItemFactura]
    total: float
    tipo: str                       # "factura" | "recibo" | "separado"

class Factura(FacturaCreate):
    id: int
    fecha: Optional[str] = None
    class Config:
        from_attributes = True
