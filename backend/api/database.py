import os
from supabase import create_client, Client

# En Vercel no hace falta load_dotenv(), pero no estorba si lo dejas.
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    raise ValueError("Faltan variables de entorno SUPABASE en Vercel")

supabase: Client = create_client(url, key)