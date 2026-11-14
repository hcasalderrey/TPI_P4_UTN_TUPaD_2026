# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador de Programación 4 (Tecnicatura Universitaria en Programación a Distancia).

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Alumno:** Casalderrey, Hernán
- **Repositorio (público):** https://github.com/hcasalderrey/TPI_P4_UTN_TUPaD_2026

## Video de demostración

**Enlace:** `https://<enlace-publico>` ← _completar con el link público del video_

Duración: 10 a 15 minutos. Contenido: presentación con cámara encendida, registro de un usuario, compra como cliente, gestión como administrador (categorías, productos, pedidos, usuarios) y cancelación de un pedido con restitución de stock.

## Tecnologías

| | Backend | Frontend |
|---|---|---|
| Lenguaje | Python 3.11 a 3.13 | TypeScript (`strict: true`, sin `any`) |
| Framework | FastAPI + SQLModel | React 19 + Vite + Tailwind CSS 4 |
| Datos | PostgreSQL 15+ (`psycopg2-binary`) | Axios, TanStack Query / Form / Table |
| Estado y rutas | — | Zustand (con `persist`), React Router 7 |
| Seguridad | JWT en cookie HttpOnly, bcrypt, roles `user` / `admin` | `ProtectedRoute` por rol |

Arquitectura del backend: `Router → Service → Unit of Work → Repository → Model`, un módulo por dominio (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`). El `commit` ocurre solo en el `__exit__` del Unit of Work. El frontend se organiza por *features* que espejan los módulos del backend.

## Requisitos

- Python 3.11, 3.12 o 3.13 (SQLModel 0.0.22+ no funciona con 3.14)
- Node.js 20.19 o superior y [pnpm](https://pnpm.io) 9 o superior
- PostgreSQL 15 o superior. Alternativa: Docker (incluido `docker-compose.yml`), o SQLite solo para desarrollo local

> El desarrollo y las pruebas se hicieron con Python 3.11 y Node 22.

## Instalación y ejecución

### 1. Base de datos

Con Docker (usuario, clave y base coinciden con `backend/.env.example`):

```bash
docker compose up -d
```

Si el puerto 5432 está ocupado, levantarla en otro (por ejemplo 5433) y ajustar `DATABASE_URL` en `backend/.env`:

```powershell
$env:POSTGRES_PORT = "5433"       # Windows (PowerShell)
docker compose up -d
```

```bash
POSTGRES_PORT=5433 docker compose up -d   # macOS / Linux
```

Con un PostgreSQL propio: crear la base (`CREATE DATABASE foodstore_db;`) y ajustar `DATABASE_URL`. Para probar sin PostgreSQL: `DATABASE_URL=sqlite:///./foodstore.db`.

### 2. Backend (http://localhost:8000)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate                 # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env                 # macOS/Linux: cp .env.example .env
python -m app.db.seed                  # crea las tablas y carga los datos iniciales
uvicorn app.main:app --reload
```

- Documentación interactiva: http://localhost:8000/docs y http://localhost:8000/redoc
- Todos los endpoints están bajo `/api/v1`.

### 3. Frontend (http://localhost:5173)

```bash
cd frontend
pnpm install
copy .env.example .env                 # macOS/Linux: cp .env.example .env
pnpm build                             # verifica los tipos (tsc) y compila
pnpm dev
```

## Variables de entorno

**`backend/.env`**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si la API se sirve por HTTPS | `false` |

**`frontend/.env`**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

Si el puerto 5173 del frontend estuviera ocupado y Vite usara otro, hay que poner ese origen en `FRONTEND_ORIGIN`.

## Usuarios del seed

`python -m app.db.seed` es idempotente (se puede ejecutar varias veces sin duplicar datos) y carga 4 categorías, 10 productos con stock y estos usuarios:

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin1234!` |
| Cliente (para probar) | `cliente` | `Cliente1234!` |

## Qué hace cada rol

- **Cliente (`user`):** recorre el catálogo (paginado en el servidor, con búsqueda y filtro por categoría), arma un carrito que persiste al recargar, confirma el pedido con dirección y forma de pago, y consulta y cancela sus pedidos mientras están en `PENDIENTE`.
- **Administrador (`admin`):** panel con resumen, ABM de categorías y productos (incluido stock y disponibilidad), gestión de pedidos con cambio de estado y gestión de usuarios (activar y desactivar). También puede comprar como cualquier usuario.

## Reglas de negocio principales

- **Crear pedido (RN-01):** una sola transacción. Valida que no haya productos repetidos y que cada producto exista, esté activo, disponible y con stock; descuenta el stock y guarda en cada línea una **copia del nombre y del precio**. Si algo falla, no se persiste nada.
- **Estados (RN-02):** `PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde los dos primeros. Una transición inválida responde 400.
- **Cancelar (RN-03):** devuelve el stock de cada línea en la misma transacción.
- **Permisos (RN-04):** el cliente solo ve y cancela sus pedidos (y solo en `PENDIENTE`); el admin ve todos.
- **Inmutabilidad (RN-05):** no hay endpoints para editar ni borrar pedidos.
- **Datos del pedido (RN-06):** forma de pago `EFECTIVO` o `TRANSFERENCIA` y dirección de 5 a 200 caracteres.
- Las bajas de categorías, productos y usuarios son lógicas. Para evitar sobreventa, el stock se lee con `SELECT … FOR UPDATE` dentro de la transacción.

## Estructura

```
.
├── docker-compose.yml
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI, CORS con credenciales, routers bajo /api/v1
│   │   ├── core/                # config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/             # auth, usuarios, categorias, productos, pedidos
│   │   └── db/seed.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── shared/              # api (axios, queryClient), ui, components, layout
    │   ├── features/            # auth, categorias, productos, usuarios, pedidos
    │   ├── store/               # authStore, cartStore (Zustand + persist)
    │   └── routes/              # AppRouter, ProtectedRoute
    ├── public/img/              # fotos del catálogo (ver CREDITOS.md)
    ├── package.json
    └── .env.example
```

## Imágenes

Las fotos de los productos provienen de Wikimedia Commons con licencias libres; autores y licencias en [`frontend/public/img/CREDITOS.md`](frontend/public/img/CREDITOS.md).
