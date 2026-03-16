# Fix-ISO — Plataforma de Gestión ISO 27001:2022

Plataforma web para la implementación, seguimiento y gestión integral del estándar **ISO/IEC 27001:2022** en organizaciones. Cubre los 93 controles del Anexo A, gestión de activos de información, evaluación de riesgos, declaración de aplicabilidad (SoA) y administración de usuarios con control de acceso basado en roles (RBAC).

---

## Tabla de contenidos

- [Visión general](#visión-general)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Módulos funcionales](#módulos-funcionales)
- [Autenticación y autorización](#autenticación-y-autorización)
- [Contrato API](#contrato-api)
- [Estrategia de mocking (MSW)](#estrategia-de-mocking-msw)
- [Base de datos](#base-de-datos)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Roadmap](#roadmap)

---

## Visión general

Fix-ISO permite a las organizaciones:

- **Implementar ISO 27001:2022** con seguimiento de los 93 controles del Anexo A organizados en 4 dominios (Organizacional, Personas, Físicos, Tecnológicos).
- **Gestionar activos de información** con clasificación (público, interno, confidencial, restringido) y evaluación de riesgos por activo.
- **Generar la Declaración de Aplicabilidad (SoA)** indicando qué controles aplican, cuáles no, y la justificación correspondiente.
- **Administrar usuarios y permisos** con RBAC granular: 5 roles predefinidos y ~31 permisos con formato `módulo:acción`.
- **Visualizar el estado de cumplimiento** mediante dashboard con indicadores, gráficas de cumplimiento por dominio y distribución de riesgo.

El proyecto está diseñado para que **frontend y backend se desarrollen en paralelo** sin bloquearse entre sí, usando MSW (Mock Service Worker) en el frontend para simular la API completa.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (fix-iso/)                  │
│  React 19 + Vite 7 + TypeScript 5.9 + Ant Design 6     │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌───────────────────┐   │
│  │  Pages   │──▶│ API Layer│──▶│  MSW (dev mock)   │   │
│  │  Layouts │   │  (Axios) │   │  o Backend real   │   │
│  │  Guards  │   └──────────┘   └───────────────────┘   │
│  └──────────┘                                           │
│       │                                                 │
│  ┌────▼─────┐  ┌────────────┐  ┌──────────────────┐    │
│  │AuthContext│  │ Hooks      │  │ Router + Guards  │    │
│  │Permissions│  │ useAuth    │  │ AuthGuard        │    │
│  └──────────┘  │ usePerms   │  │ PermissionGuard  │    │
│                └────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
                        │
                   VITE_ENABLE_MOCKS=false
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                Backend (backend_fix-iso/)                │
│  Express + Prisma + PostgreSQL (planificado)            │
│                                                         │
│  Auth JWT ──▶ RBAC Middleware ──▶ Módulos CRUD          │
│  bcrypt       Permisos            Controllers/Services  │
└─────────────────────────────────────────────────────────┘
```

**Flujo clave:** El frontend hace peticiones HTTP normales vía Axios. En desarrollo, MSW intercepta esas peticiones en el Service Worker del navegador y responde con datos mock. Cuando el backend esté listo, se desactiva MSW (`VITE_ENABLE_MOCKS=false`) y todo funciona sin cambiar una línea de código del frontend.

---

## Stack tecnológico

### Frontend (`fix-iso/`)

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 7.3 | Build tool y dev server |
| TypeScript | 5.9 | Tipado estático |
| Ant Design | 6.3 | Librería de componentes UI |
| @ant-design/charts | 2.6 | Gráficas del dashboard |
| @ant-design/icons | 6.1 | Iconografía |
| React Router | 7.13 | Enrutamiento SPA |
| Axios | 1.13 | Cliente HTTP con interceptores JWT |
| MSW | 2.12 | Mock de API en desarrollo (devDependency) |
| DayJS | 1.11 | Manejo de fechas |

### Backend (`backend_fix-iso/`) — Planificado

| Tecnología | Propósito |
|---|---|
| Express | Framework HTTP |
| Prisma | ORM type-safe |
| PostgreSQL | Base de datos |
| bcryptjs | Hash de contraseñas |
| jsonwebtoken | JWT auth |
| zod | Validación de payloads |

---

## Estructura del proyecto

```
proyecto_fix-iso/
├── fix-iso/                          # Frontend
│   ├── .env.development              # Variables de entorno
│   ├── index.html                    # Entry HTML
│   ├── vite.config.ts                # Configuración Vite
│   ├── tsconfig.json                 # TypeScript config
│   ├── public/
│   │   └── mockServiceWorker.js      # Service Worker de MSW
│   └── src/
│       ├── main.tsx                  # Entry point (bootstrap MSW)
│       ├── App.tsx                   # Providers + Router
│       ├── api/                      # Capa de comunicación HTTP
│       │   ├── client.ts             # Axios instance + interceptores JWT
│       │   ├── auth.api.ts           # login, refresh, logout, me
│       │   ├── users.api.ts          # CRUD usuarios
│       │   ├── controls.api.ts       # Temas, controles, SoA
│       │   ├── assets.api.ts         # CRUD activos + riesgos
│       │   ├── dashboard.api.ts      # Estadísticas y gráficas
│       │   └── admin.api.ts          # Roles, permisos, módulos
│       ├── context/
│       │   ├── AuthContext.ts        # Definición del contexto + tipos
│       │   └── AuthProvider.tsx      # Provider con login/logout/refresh
│       ├── guards/
│       │   ├── AuthGuard.tsx         # Guard de ruta: redirige a /login
│       │   └── PermissionGuard.tsx   # Guard de componente: 403 o hide
│       ├── hooks/
│       │   ├── useAuth.ts            # Acceso al contexto de auth
│       │   └── usePermissions.ts     # hasPermission, hasAny, hasAll
│       ├── layouts/
│       │   ├── MainLayout.tsx        # Header + Sidebar + Content
│       │   ├── AuthLayout.tsx        # Layout centrado para login
│       │   └── Sidebar.tsx           # Menú dinámico según módulos/rol
│       ├── mocks/
│       │   ├── browser.ts            # Inicialización del worker MSW
│       │   ├── data/                 # Datos mock con tipado fuerte
│       │   │   ├── users.mock.ts     # 6 usuarios, mapeo roles→permisos
│       │   │   ├── roles.mock.ts     # 5 roles, 31 permisos, grupos
│       │   │   ├── controls.mock.ts  # 93 controles ISO, SoA, estados
│       │   │   └── assets.mock.ts    # 10 activos, 8 evaluaciones riesgo
│       │   └── handlers/             # Interceptores de peticiones
│       │       ├── auth.handlers.ts
│       │       ├── users.handlers.ts
│       │       ├── controls.handlers.ts
│       │       ├── assets.handlers.ts
│       │       ├── dashboard.handlers.ts
│       │       └── admin.handlers.ts
│       ├── pages/
│       │   ├── auth/LoginPage.tsx
│       │   ├── dashboard/DashboardPage.tsx
│       │   ├── controls/
│       │   │   ├── ControlsListPage.tsx
│       │   │   └── SoAPage.tsx
│       │   ├── assets/
│       │   │   ├── AssetsListPage.tsx
│       │   │   └── AssetDetailPage.tsx
│       │   ├── admin/
│       │   │   ├── UsersPage.tsx
│       │   │   └── RolesPage.tsx
│       │   └── NotFoundPage.tsx
│       ├── router/
│       │   └── index.tsx             # createBrowserRouter con guards
│       ├── theme/
│       │   └── antdTheme.ts          # Tema personalizado Ant Design
│       └── types/                    # Contratos TypeScript (API)
│           ├── index.ts              # Barrel export
│           ├── auth.types.ts
│           ├── user.types.ts
│           ├── control.types.ts
│           ├── asset.types.ts
│           ├── dashboard.types.ts
│           └── common.types.ts
│
├── backend_fix-iso/                  # Backend (estructura base)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── config/index.ts
│       ├── controllers/exampleController.ts
│       ├── middleware/logger.ts
│       ├── models/exampleModel.ts
│       └── routes/index.ts
│
└── bigDataFixiso/                    # (módulo separado)
```

---

## Instalación y ejecución

### Requisitos previos

- Node.js >= 18
- npm >= 9

### Frontend

```bash
cd fix-iso
npm install
npm run dev          # Inicia en http://localhost:5173
```

El frontend arranca con MSW activado por defecto. No necesita backend para funcionar.

### Build de producción

```bash
npm run build        # Genera dist/ con TypeScript check + Vite build
npm run preview      # Preview local del build
```

---

## Variables de entorno

Archivo `fix-iso/.env.development`:

| Variable | Valor | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL del backend real |
| `VITE_ENABLE_MOCKS` | `true` | Activa MSW para simular la API |

Para conectar al backend real, cambiar `VITE_ENABLE_MOCKS` a `false`. El `baseURL` de Axios cambiará automáticamente de relativo (para MSW) a `VITE_API_URL`.

---

## Módulos funcionales

### 1. Autenticación (`/login`)

- Formulario de login con validación de email y contraseña.
- JWT con access token (15 min) + refresh token (7 días).
- Tokens almacenados en memoria (no localStorage) para protección contra XSS.
- Refresh automático transparente vía interceptor Axios en respuestas 401.

### 2. Dashboard (`/dashboard`)

- **4 tarjetas KPI:** cumplimiento general (%), controles implementados, en progreso, activos de alto riesgo.
- **Gráfico de barras apiladas:** cumplimiento por dominio ISO (Organizacional, Personas, Físico, Tecnológico).
- **Gráfico de dona:** distribución de niveles de riesgo (Crítico, Alto, Medio, Bajo).
- **Tabla de actividad reciente:** últimas acciones en el sistema.

### 3. Controles ISO 27001 (`/controls`)

- Tabla paginada de los 93 controles del Anexo A con filtros por dominio, estado y búsqueda.
- **Estados:** Pendiente, En progreso, Implementado, No conformidad, En revisión.
- **Niveles de madurez:** Inicial, Gestionado, Definido, Medido, Optimizado (modelo CMM).
- Drawer lateral para editar estado, madurez, porcentaje de cumplimiento, fecha de revisión y notas.

### 4. Declaración de Aplicabilidad — SoA (`/soa`)

- Tabla con los 93 controles y toggle de aplicabilidad.
- Campo de justificación obligatorio para controles excluidos.
- Estado de implementación por control.

### 5. Gestión de Activos (`/assets`)

- CRUD completo con filtros por tipo (información, software, hardware, servicio, personas, intangible) y clasificación.
- **Detalle de activo** (`/assets/:id`): ficha descriptiva + tabla de evaluaciones de riesgo.
- **Evaluación de riesgos por activo:** amenaza, vulnerabilidad, probabilidad (1-5), impacto (1-5), score calculado, nivel de riesgo, tratamiento (mitigar, aceptar, transferir, evitar).

### 6. Gestión de Usuarios (`/admin/users`)

- CRUD de usuarios con asignación de múltiples roles.
- Activar/desactivar cuentas.
- Búsqueda por nombre o email.

### 7. Roles y Permisos (`/admin/roles`)

- Tabla de roles con conteo de usuarios y permisos.
- Gestión de permisos por rol mediante checkboxes agrupados por módulo.
- 5 roles predefinidos: Super Admin, Administrador, Auditor, Consultor, Empleado.

---

## Autenticación y autorización

### Flujo JWT

```
Login → POST /api/auth/login
         ↓
   { accessToken, refreshToken, user }
         ↓
   accessToken en memoria (variable JS)
   refreshToken en sessionStorage
         ↓
   Axios interceptor agrega Authorization: Bearer <token>
         ↓
   Si 401 → POST /api/auth/refresh → nuevo par de tokens
   Si refresh falla → redirect a /login
```

### RBAC (Control de Acceso Basado en Roles)

**Roles:**

| Rol | Descripción |
|---|---|
| `super_admin` | Acceso total al sistema |
| `admin` | Gestión de usuarios, roles, controles y activos |
| `auditor` | Lectura de controles, SoA y activos |
| `consultant` | Controles y activos (lectura + escritura) |
| `employee` | Solo dashboard y lectura básica |

**Permisos (formato `módulo:acción`):**

```
dashboard:read
users:read, users:create, users:update, users:delete
roles:read, roles:create, roles:update, roles:delete
controls:read, controls:create, controls:update, controls:delete, controls:export
soa:read, soa:update
assets:read, assets:create, assets:update, assets:delete
risk:read, risk:create, risk:update
audits:read
```

**Guards en el frontend:**

- `AuthGuard` — Componente de ruta. Si el usuario no está autenticado, redirige a `/login`.
- `PermissionGuard` — Componente wrapper. Recibe `permission` o `permissions[]` con modo `any`/`all`. Muestra el contenido solo si el usuario tiene el permiso requerido, de lo contrario muestra 403 o un fallback personalizado.
- `usePermissions()` — Hook con `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`.

---

## Contrato API

Endpoints implementados (mock) y que el backend debe replicar:

```
Autenticación
  POST   /api/auth/login              { email, password } → { accessToken, refreshToken, user }
  POST   /api/auth/refresh            { refreshToken }    → { accessToken, refreshToken }
  POST   /api/auth/logout             { refreshToken }    → { message }
  GET    /api/auth/me                 Bearer token        → { data: AuthUser }

Usuarios
  GET    /api/users                   ?page, limit, search → PaginatedResponse<User>
  GET    /api/users/:id               → { data: User }
  POST   /api/users                   CreateUserPayload   → { data: User }
  PUT    /api/users/:id               UpdateUserPayload   → { data: User }
  DELETE /api/users/:id               → 204

Controles ISO
  GET    /api/controls/themes         → { data: IsoTheme[] }
  GET    /api/companies/:id/controls  ?themeId, status, search, page, limit → PaginatedResponse<CompanyControl>
  PUT    /api/companies/:id/controls/:controlId  UpdateCompanyControlPayload → { data: CompanyControl }

Declaración de Aplicabilidad
  GET    /api/companies/:id/soa       → { data: SoAEntry[] }
  PUT    /api/companies/:id/soa/:controlId  UpdateSoAPayload → { data: SoAEntry }

Activos
  GET    /api/assets                  ?assetType, classification, search, page, limit → PaginatedResponse<Asset>
  GET    /api/assets/:id              → { data: Asset & { risks: AssetRiskAssessment[] } }
  POST   /api/assets                  CreateAssetPayload  → { data: Asset }
  PUT    /api/assets/:id              UpdateAssetPayload  → { data: Asset }
  DELETE /api/assets/:id              → 204
  POST   /api/assets/:id/risks       CreateRiskPayload   → { data: AssetRiskAssessment }

Dashboard
  GET    /api/dashboard/stats              → { data: DashboardStats }
  GET    /api/dashboard/compliance-progress → { data: ComplianceByTheme[] }
  GET    /api/dashboard/risk-overview      → { data: RiskOverview[] }
  GET    /api/dashboard/recent-activity    → { data: RecentActivity[] }

Administración
  GET    /api/roles                   → { data: Role[] }
  POST   /api/roles                   { name, description, permissionIds } → { data: Role }
  PUT    /api/roles/:id               { name, description } → { data: Role }
  GET    /api/roles/:id/permissions   → { data: number[] }
  PUT    /api/roles/:id/permissions   { permissionIds } → { message }
  GET    /api/permissions             → { data: PermissionGroup[] }
  GET    /api/permissions/all         → { data: Permission[] }
  GET    /api/modules                 → { data: UserModule[] }
```

### Formato de respuestas

```typescript
// Respuesta simple
{ data: T }

// Respuesta paginada
{
  data: T[],
  meta: { page: number, limit: number, total: number, totalPages: number }
}

// Error
{ error: string, details?: { field: string, message: string }[] }
```

---

## Estrategia de mocking (MSW)

**MSW (Mock Service Worker)** intercepta peticiones HTTP a nivel de Service Worker del navegador. El frontend no sabe si está hablando con un mock o con el backend real.

### Cómo funciona

1. `main.tsx` verifica `VITE_ENABLE_MOCKS`. Si es `true`, importa e inicia el worker de MSW antes de renderizar React.
2. Los handlers en `src/mocks/handlers/` capturan rutas (`http.get`, `http.post`, etc.) y retornan `HttpResponse.json(...)`.
3. Los datos en `src/mocks/data/` son objetos TypeScript con el mismo tipado que usará el backend.
4. Los handlers simulan lógica real: paginación, filtrado, búsqueda, validación de credenciales, cálculo de risk scores.

### Transición a backend real

```bash
# En .env.development, cambiar:
VITE_ENABLE_MOCKS=false
```

- El worker de MSW no se registra.
- Axios envía las peticiones a `VITE_API_URL` (http://localhost:3000).
- Si el backend implementa el mismo contrato API, el frontend funciona sin cambios.

### Datos mock incluidos

| Recurso | Cantidad | Detalles |
|---|---|---|
| Usuarios | 6 | Con roles variados (admin, auditor, consultant, employee) |
| Roles | 5 | super_admin, admin, auditor, consultant, employee |
| Permisos | 31 | Agrupados por módulo |
| Controles ISO | 93 | Los 93 controles del Anexo A ISO 27001:2022 |
| Controles empresa | 93 | Con estados y madurez variados |
| Entradas SoA | 93 | Aplicabilidad y justificación |
| Activos | 10 | Tipos: servidor, código fuente, laptops, etc. |
| Evaluaciones riesgo | 8 | Con cálculo automático de score y nivel |

---

## Base de datos

### Esquema planificado (22 tablas)

```
Autenticación & Usuarios        ISO 27001
├── users                        ├── iso_themes (4 dominios)
├── refresh_tokens               ├── iso_controls (93 controles)
├── roles                        ├── company_controls
├── permissions                  └── statements_of_applicability
├── role_permissions
├── user_roles                  Activos & Riesgos
└── modules                     ├── assets
                                 ├── asset_risk_assessments
Organizacional                   └── risk_assessments
├── companies
├── company_users               Trazabilidad
├── audit_log                   └── notifications
└── trainings
```

### ISO 27001:2022 — Anexo A

| Dominio | Código | Controles |
|---|---|---|
| Organizacional | A.5.1 — A.5.37 | 37 |
| Personas | A.6.1 — A.6.8 | 8 |
| Físico | A.7.1 — A.7.14 | 14 |
| Tecnológico | A.8.1 — A.8.34 | 34 |
| **Total** | | **93** |

---

## Credenciales de prueba

Con MSW activo, se puede iniciar sesión con cualquier usuario registrado en los datos mock usando la contraseña universal:

| Email | Contraseña | Rol |
|---|---|---|
| `admin@fixiso.com` | `Admin123!` | Super Admin |
| `carlos.mendez@fixiso.com` | `Admin123!` | Administrador |
| `laura.garcia@fixiso.com` | `Admin123!` | Auditor |
| `miguel.torres@fixiso.com` | `Admin123!` | Consultor |
| `ana.rodriguez@fixiso.com` | `Admin123!` | Empleado |
| `pedro.lopez@fixiso.com` | `Admin123!` | Empleado |

---

## Roadmap

### Completado

- [x] Estructura de carpetas frontend
- [x] TypeScript types como contrato API
- [x] Tema Ant Design personalizado
- [x] API client con interceptores JWT (auto-refresh)
- [x] 93 controles ISO 27001:2022 como datos mock
- [x] MSW handlers con lógica real (paginación, filtros, CRUD)
- [x] Sistema de autenticación (AuthContext + guards)
- [x] RBAC con permisos granulares (hooks + guards)
- [x] Login, Dashboard, Controles, SoA, Activos, Usuarios, Roles
- [x] Build sin errores TypeScript

### Pendiente — Frontend

- [ ] Lazy loading de rutas (code splitting)
- [ ] Componentes reutilizables (formularios, tablas genéricas)
- [ ] Notificaciones en tiempo real
- [ ] Exportación a PDF/Excel (controles, SoA, activos)
- [ ] Modo oscuro
- [ ] Tests unitarios y de integración

### Pendiente — Backend

- [ ] Prisma schema con las 22 tablas
- [ ] Seed con roles, permisos y 93 controles ISO
- [ ] Endpoints de autenticación JWT
- [ ] Middleware RBAC
- [ ] CRUD de todos los módulos
- [ ] Audit log middleware
- [ ] Validación con zod
- [ ] Tests de API

---

## Decisiones técnicas

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| MSW para mocking | JSON Server, Mirage JS | Intercepta a nivel de red, cero cambios de código al conectar backend real |
| Prisma como ORM | TypeORM, Sequelize | Type-safe, schema declarativo, migraciones automáticas |
| Tokens en memoria | localStorage | Protección contra XSS |
| Organización por módulos (backend) | Organización por capas | Cada módulo es autocontenido, más fácil de mantener |
| Ant Design | Material UI, Chakra | Componentes enterprise-ready, tablas y formularios avanzados |
| ISO 27001:2022 | ISO 27001:2013 | Versión vigente con 93 controles en 4 dominios |
