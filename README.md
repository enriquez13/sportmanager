# SportManager Pro 🏃

Monorepo con frontend React y backend FastAPI, desplegados por separado en Vercel.

```
sportmanager/
├── backend/      → Vercel Proyecto #1
├── frontend/     → Vercel Proyecto #2
└── supabase_schema.sql
```

---

## 1. Supabase (base de datos)

1. Ve a https://supabase.com → crea cuenta → **New project**
2. Anota la **Project URL** y la **anon/public API Key** (en Settings → API)
3. Ve a **SQL Editor** → pega y ejecuta el contenido de `supabase_schema.sql`

---

## 2. GitHub

```bash
git init
git add .
git commit -m "feat: sportmanager inicial"
# Crea el repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/sportmanager.git
git push -u origin main
```

---

## 3. Backend en Vercel

1. Ve a https://vercel.com → **Add New Project**
2. Importa tu repo → **Root Directory: `backend`**
3. En **Environment Variables** agrega:
   ```
   SUPABASE_URL   = https://xxxx.supabase.co
   SUPABASE_KEY   = eyJ...
   ```
4. Deploy → anota la URL, ej: `https://sportmanager-backend.vercel.app`

**Prueba:** abre `https://sportmanager-backend.vercel.app/` → debes ver `{"status":"ok"}`  
**Docs automáticas:** `https://sportmanager-backend.vercel.app/docs`

---

## 4. Frontend en Vercel

1. **Add New Project** otra vez → mismo repo → **Root Directory: `frontend`**
2. Framework: **Vite**
3. En **Environment Variables**:
   ```
   VITE_API_URL = https://sportmanager-backend.vercel.app
   ```
4. Deploy → ¡listo!

---

## 5. Desarrollo local

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # rellena con tus credenciales de Supabase
uvicorn api.index:app --reload  # corre en http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL=http://localhost:8000
npm run dev                     # corre en http://localhost:5173
```

---

## Estructura de archivos clave

| Archivo | Para qué sirve |
|---|---|
| `backend/api/index.py` | Entry point FastAPI |
| `backend/api/models.py` | Modelos Pydantic (validación) |
| `backend/api/database.py` | Conexión Supabase |
| `backend/api/routers/*.py` | Endpoints por módulo |
| `backend/vercel.json` | Config Vercel para Python |
| `frontend/src/api/client.js` | Todas las llamadas al backend |
| `frontend/src/hooks/useApi.js` | Hooks para loading/error/data |
| `frontend/src/context/ToastContext.jsx` | Notificaciones globales |
| `supabase_schema.sql` | Tablas de la base de datos |
