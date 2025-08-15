# 📋 Documentación Completa - Sistema EcoReciclaje

## 🎯 Descripción General

EcoReciclaje es una plataforma web inteligente de gestión de residuos desarrollada con **Next.js 15**, **Prisma ORM**, **TypeScript** y base de datos **SQLite/PostgreSQL**. El sistema permite a usuarios solicitar recolección de residuos, gestionar empresas recolectoras, administrar horarios y mantener un sistema de puntos e incentivos.

---

## 🏗️ Arquitectura del Sistema

### **Stack Tecnológico**
- **Frontend**: Next.js 15 con App Router, React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Base de Datos**: Prisma ORM con SQLite (desarrollo) / PostgreSQL (producción)
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Autenticación**: Sistema custom con bcryptjs
- **Validaciones**: Zod (implementado parcialmente)

### **Estructura de Carpetas**
```
eco-reciclaje/
├── prisma/
│   └── schema.prisma          # Modelos de base de datos
├── scripts/                   # Scripts de inicialización y pruebas
├── src/
│   ├── app/                   # Rutas y páginas (App Router)
│   ├── components/           # Componentes React reutilizables
│   └── lib/                  # Utilities y lógica de negocio
├── public/                   # Archivos estáticos
└── Archivos de configuración
```

---

## 🗄️ Base de Datos - Modelos Prisma

### **Modelo Usuario**
```prisma
model Usuario {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  nombre      String?
  telefono    String?
  localidad   String?
  direccion   String?
  role        Role     @default(USUARIO)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  suscripcion     Suscripcion?
  solicitudes     SolicitudRecoleccion[]
  puntos         HistorialPuntos[]
  empresaPerfiles EmpresaPerfil[]
}

enum Role {
  ADMIN
  USUARIO  
  EMPRESA
}
```

### **Modelo Solicitud de Recolección**
```prisma
model SolicitudRecoleccion {
  id               String            @id @default(cuid())
  usuarioId        String
  tipoResiduo      TipoResiduo
  cantidadEstimada String?
  descripcion      String?
  direccion        String
  fechaSolicitada  DateTime
  horarioPreferido String?
  estado           EstadoSolicitud   @default(PENDIENTE)
  fechaProgramada  DateTime?
  empresaAsignada  String?
  notasRecolector  String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  // Relaciones
  usuario         Usuario           @relation(fields: [usuarioId], references: [id])
  empresa         EmpresaPerfil?    @relation(fields: [empresaAsignada], references: [id])
}

enum TipoResiduo {
  ORGANICO
  INORGANICO
  PELIGROSO
}

enum EstadoSolicitud {
  PENDIENTE
  PROGRAMADA
  ASIGNADA
  COMPLETADA
  CANCELADA
}
```

### **Modelo Sistema de Puntos**
```prisma
model HistorialPuntos {
  id        String   @id @default(cuid())
  usuarioId String
  puntos    Int
  motivo    String?
  createdAt DateTime @default(now())

  usuario Usuario @relation(fields: [usuarioId], references: [id])
}
```

### **Modelo Horarios Orgánicos**
```prisma
model HorarioOrganico {
  id        String @id @default(cuid())
  localidad String
  lunes     Boolean @default(false)
  martes    Boolean @default(false)
  miercoles Boolean @default(false)
  jueves    Boolean @default(false)
  viernes   Boolean @default(false)
  sabado    Boolean @default(false)
  domingo   Boolean @default(false)
  
  @@unique([localidad])
}
```

---

## 🔐 Sistema de Autenticación

### **Archivo**: `src/lib/auth.ts`

**Funcionalidades implementadas:**
- ✅ Registro de usuarios con validación
- ✅ Login con email y contraseña
- ✅ Hash de contraseñas con bcryptjs
- ✅ Obtener usuario actual desde cookies
- ✅ Logout y limpieza de sesión
- ✅ Middleware de protección de rutas

**Funciones principales:**
```typescript
// Registro
async function registrarUsuario(data: RegistroData)

// Login  
async function loginUsuario(email: string, password: string)

// Usuario actual
async function getCurrentUser()

// Logout
async function logoutUser()
```

**Rutas protegidas**: Todo `/dashboard/*` requiere autenticación

---

## 👥 Gestión de Usuarios y Empresas

### **Archivo**: `src/lib/admin.ts`

**Funcionalidades para administradores:**
- ✅ Listar todos los usuarios del sistema
- ✅ Crear usuarios manualmente
- ✅ Actualizar información de usuarios
- ✅ Eliminar usuarios
- ✅ Cambiar roles (ADMIN, USUARIO, EMPRESA)
- ✅ Gestionar empresas recolectoras
- ✅ Activar/desactivar suscripciones

**Funciones principales:**
```typescript
// Usuarios
async function obtenerTodosUsuarios()
async function crearUsuario(data: CrearUsuarioData)
async function actualizarUsuario(id: string, data: ActualizarUsuarioData)
async function eliminarUsuario(id: string)

// Empresas
async function obtenerTodasEmpresas()
async function crearEmpresa(data: CrearEmpresaData)
```

---

## 🏆 Sistema de Puntos

### **Archivo**: `src/lib/puntos.ts`

**Funcionalidades implementadas:**
- ✅ Asignar puntos por acciones
- ✅ Sistema de bonificaciones
- ✅ Penalizaciones por cancelaciones
- ✅ Historial completo de puntos
- ✅ Ranking de usuarios
- ✅ Estadísticas de puntos

**Sistema de puntuación:**
- **Solicitud completada**: +10 puntos
- **Solicitud orgánica**: +5 puntos adicionales
- **Primera solicitud del mes**: +15 puntos bonus
- **Cancelación**: -5 puntos
- **No presentarse**: -10 puntos

**Funciones principales:**
```typescript
// Asignar puntos
async function asignarPuntos(usuarioId: string, puntos: number, motivo: string)

// Estadísticas
async function obtenerEstadisticasPuntos(usuarioId: string)

// Ranking
async function obtenerRankingUsuarios()
```

---

## ♻️ Sistema de Recolecciones

### **Archivo**: `src/lib/recolecciones.ts`

**Funcionalidades implementadas:**
- ✅ Crear solicitudes de recolección
- ✅ Programación automática según horarios
- ✅ Gestión de estados de solicitudes
- ✅ Asignación a empresas recolectoras
- ✅ Filtros por estado, localidad y tipo
- ✅ Configuración de horarios orgánicos

**Tipos de residuos soportados:**
- **ORGANICO**: Restos de comida, jardinería
- **INORGANICO**: Plásticos, cartones, metales
- **PELIGROSO**: Baterías, químicos, aceites

**Estados de solicitudes:**
- **PENDIENTE**: Recién creada, esperando programación
- **PROGRAMADA**: Fecha asignada automáticamente
- **ASIGNADA**: Empresa recolectora asignada
- **COMPLETADA**: Recolección realizada exitosamente
- **CANCELADA**: Cancelada por usuario o admin

**Funciones principales:**
```typescript
// Solicitudes
async function crearSolicitudRecoleccion(data: CrearSolicitudData)
async function obtenerSolicitudesUsuario(usuarioId: string)
async function obtenerTodasLasSolicitudes(filtros?: Filtros)

// Horarios
async function configurarHorarioOrganico(localidad: string, dias: DiasObject)
async function obtenerHorarioOrganico(localidad: string)
```

---

## 🎨 Interfaz de Usuario

### **Componentes Principales**

#### **Dashboard Multi-rol** (`src/components/portal/DashboardContent.tsx`)
- ✅ Dashboard diferenciado por roles
- ✅ Métricas y estadísticas en tiempo real
- ✅ Navegación contextual
- ✅ Enlaces rápidos a funcionalidades

#### **Formulario de Solicitudes** (`src/components/recolecciones/SolicitudRecoleccionForm.tsx`)
- ✅ Formulario completo para crear solicitudes
- ✅ Validación de campos
- ✅ Selección de tipo de residuo
- ✅ Programación automática de fechas

#### **Gestión de Solicitudes Usuario** (`src/components/recolecciones/MisSolicitudes.tsx`)
- ✅ Lista de todas las solicitudes del usuario
- ✅ Filtros por estado y tipo
- ✅ Detalles expandibles
- ✅ Acciones contextualess

#### **Gestión Administrativa** (`src/components/admin/GestionSolicitudes.tsx`)
- ✅ Vista completa de todas las solicitudes
- ✅ Filtros avanzados (estado, localidad)
- ✅ Gestión masiva de solicitudes
- ✅ Exportación de datos

#### **Configuración de Horarios** (`src/components/admin/ConfiguracionHorarios.tsx`)
- ✅ Interface para configurar días de recolección
- ✅ Gestión por localidad
- ✅ Vista de calendario semanal

### **Componentes UI Reutilizables** (`src/components/ui/`)
- ✅ Button, Card, Input, Label
- ✅ Tabs, Modal, Badge
- ✅ Select, Textarea
- ✅ Todos basados en shadcn/ui

---

## 🛣️ Rutas y Páginas

### **Rutas Públicas**
- `/` - Landing page
- `/auth/login` - Página de login
- `/auth/signup` - Página de registro

### **Rutas de Usuario** (Requieren autenticación)
- `/dashboard` - Dashboard principal
- `/dashboard/recolecciones` - Crear solicitudes y ver "Mis Solicitudes"

### **Rutas Administrativas** (Requieren rol ADMIN)
- `/dashboard/admin/usuarios` - Gestión de usuarios
- `/dashboard/admin/empresas` - Gestión de empresas
- `/dashboard/admin/solicitudes` - Todas las solicitudes del sistema
- `/dashboard/admin/puntos` - Configuración del sistema de puntos
- `/dashboard/admin/horarios` - Configuración de horarios orgánicos

### **Rutas de Empresa** (Requieren rol EMPRESA)
- `/dashboard` - Dashboard de empresa con solicitudes asignadas

---

## 🔧 Scripts de Inicialización

### **Scripts Disponibles** (directorio `/scripts/`)

#### **create-admin.js**
```bash
node scripts/create-admin.js
```
- Crea el usuario administrador inicial
- Email: admin@ecoreciclaje.com
- Password: admin123

#### **create-test-users.js**
```bash
node scripts/create-test-users.js
```
- Crea usuarios de prueba con diferentes roles
- Incluye usuarios normales, empresas y admin

#### **create-sample-data.js**
```bash
node scripts/create-sample-data.js
```
- Genera datos de ejemplo para desarrollo
- Incluye suscripciones y empresas recolectoras

#### **setup-horarios.js**
```bash
node scripts/setup-horarios.js
```
- Configura horarios orgánicos para localidades comunes
- Establece días de recolección por defecto

#### **crear-solicitudes-prueba.js**
```bash
node scripts/crear-solicitudes-prueba.js
```
- Genera solicitudes de prueba con diferentes estados
- Útil para testing de interfaces

---

## ⚙️ Configuración del Entorno

### **Variables de Entorno** (`.env`)
```env
# Base de datos
DATABASE_URL="file:./dev.db"  # SQLite para desarrollo
# DATABASE_URL="postgresql://..." # PostgreSQL para producción

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### **Scripts npm disponibles**
```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

---

## 🔒 Seguridad Implementada

### **Autenticación y Autorización**
- ✅ Hash de contraseñas con bcryptjs
- ✅ Middleware de protección de rutas
- ✅ Validación de roles por endpoint
- ✅ Limpieza de datos de entrada

### **Validaciones**
- ✅ Validación de email y contraseñas
- ✅ Sanitización de inputs
- ✅ Verificación de permisos por rol

---

## 🧪 Testing y Desarrollo

### **Datos de Prueba Incluidos**
- **Admin**: admin@ecoreciclaje.com / admin123
- **Usuario**: usuario@test.com / password123
- **Empresa**: empresa@test.com / password123

### **Estados de Testing**
- ✅ Autenticación y registro
- ✅ Creación de solicitudes
- ✅ Dashboard multi-rol
- ✅ Sistema de puntos
- ✅ Gestión administrativa

---

## 🚀 Estado Actual del Proyecto

### **✅ Completado**
- [x] Sistema de autenticación completo
- [x] Base de datos con todos los modelos
- [x] Dashboard multi-rol funcional
- [x] Sistema de puntos implementado
- [x] Gestión de solicitudes (crear, ver, filtrar)
- [x] Configuración de horarios orgánicos
- [x] Scripts de inicialización y datos de prueba
- [x] Interfaz responsive y moderna
- [x] Server Actions para todas las operaciones
- [x] Middleware de seguridad

### **🔄 En Progreso**
- [ ] Validaciones con Zod más robustas
- [ ] Sistema de notificaciones
- [ ] Integración con APIs de geolocalización

### **📋 Pendiente**
- [ ] Tests automatizados (Jest/Cypress)
- [ ] Deployment en producción
- [ ] Sistema de notificaciones push
- [ ] Integración con servicios de pago
- [ ] App móvil (React Native)
- [ ] API pública para terceros

---

## 📱 Funcionalidades por Rol

### **👤 Usuario Normal**
- ✅ Crear solicitudes de recolección
- ✅ Ver historial de solicitudes
- ✅ Consultar puntos acumulados
- ✅ Ver ranking de usuarios
- ✅ Gestionar perfil personal

### **🏢 Empresa Recolectora**
- ✅ Ver solicitudes asignadas
- ✅ Marcar recolecciones como completadas
- ✅ Actualizar estado de solicitudes
- ✅ Dashboard con métricas

### **👨‍💼 Administrador**
- ✅ Gestión completa de usuarios
- ✅ Configuración de empresas
- ✅ Administrar todas las solicitudes
- ✅ Configurar horarios orgánicos
- ✅ Gestión del sistema de puntos
- ✅ Estadísticas y reportes

---

## 🔗 Comandos Útiles

### **Base de Datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar cambios a la BD
npm run db:push  

# Abrir Prisma Studio
npm run db:studio

# Reset de BD (development)
rm prisma/dev.db && npm run db:push
```

### **Desarrollo**
```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

### **Inicialización del Sistema**
```bash
# Ejecutar todos los scripts de inicialización
node scripts/create-admin.js
node scripts/create-test-users.js
node scripts/setup-horarios.js
node scripts/crear-solicitudes-prueba.js
```

---

## 📞 Soporte y Contacto

Este sistema ha sido desarrollado como una solución completa de gestión de residuos con todas las funcionalidades básicas implementadas y probadas. La documentación se actualiza conforme se añaden nuevas funcionalidades.

**Versión actual**: 1.0.0  
**Última actualización**: Agosto 2025
