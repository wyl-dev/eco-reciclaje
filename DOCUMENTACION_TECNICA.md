# 🔧 Documentación Técnica - Implementación EcoReciclaje

## 📂 Estructura Detallada de Archivos

### **Backend - Server Actions y Lógica**

#### `src/lib/auth.ts`
**Propósito**: Sistema de autenticación completo
```typescript
// Funciones principales implementadas:
- registrarUsuario(data: RegistroData)
- loginUsuario(email: string, password: string) 
- getCurrentUser()
- logoutUser()

// Características:
- Hash de contraseñas con bcryptjs (10 rounds)
- Manejo de cookies para sesiones
- Validación de datos de entrada
- Manejo de errores personalizado
```

#### `src/lib/admin.ts`  
**Propósito**: Operaciones administrativas
```typescript
// Gestión de usuarios:
- obtenerTodosUsuarios()
- crearUsuario(data)
- actualizarUsuario(id, data)
- eliminarUsuario(id)
- cambiarRolUsuario(id, role)

// Gestión de empresas:
- obtenerTodasEmpresas()
- crearEmpresa(data)
- actualizarEmpresa(id, data)
- activarDesactivarEmpresa(id)
```

#### `src/lib/puntos.ts`
**Propósito**: Sistema de gamificación y puntos
```typescript
// Sistema de puntuación:
PUNTOS_BASE = 10          // Por solicitud completada
PUNTOS_ORGANICO = 5       // Bonus por orgánico  
PUNTOS_PRIMER_MES = 15    // Bonus primera solicitud del mes
PENALIZACION_CANCELAR = -5 // Por cancelar
PENALIZACION_NO_PRESENTAR = -10 // Por no presentarse

// Funciones implementadas:
- asignarPuntos(usuarioId, puntos, motivo)
- obtenerEstadisticasPuntos(usuarioId)  
- obtenerRankingUsuarios(limite?)
- calcularBonificaciones(usuarioId, tipoResiduo)
```

#### `src/lib/recolecciones.ts`
**Propósito**: Lógica central de solicitudes y recolecciones
```typescript
// Funciones principales:
- crearSolicitudRecoleccion(data)
- obtenerSolicitudesUsuario(usuarioId, filtros?)
- obtenerTodasLasSolicitudes(filtros?)
- actualizarEstadoSolicitud(id, estado)
- asignarEmpresaSolicitud(solicitudId, empresaId)

// Programación automática:
- calcularFechaProgramada(tipoResiduo, localidad)
- obtenerHorarioOrganico(localidad)
- configurarHorarioOrganico(localidad, dias)

// Estados manejados:
PENDIENTE → PROGRAMADA → ASIGNADA → COMPLETADA
                    ↓
                 CANCELADA
```

---

### **Frontend - Componentes y Páginas**

#### Dashboard Principal (`src/components/portal/DashboardContent.tsx`)
**Características**:
- **Renderizado condicional** por roles (ADMIN, USUARIO, EMPRESA)
- **Métricas en tiempo real** (puntos, solicitudes activas, completadas)
- **Navegación contextual** según permisos
- **Responsive design** con Tailwind CSS

```tsx
// Estructura de componente:
- DashboardContent (componente principal)
  ├── AdminDashboard (vista administrativa)
  ├── EmpresaDashboard (vista de empresa) 
  └── UsuarioDashboard (vista de usuario normal)

// Props recibidas:
interface UserData {
  id: string
  role: 'ADMIN' | 'USUARIO' | 'EMPRESA'
  solicitudes: SolicitudRecoleccion[]
  puntos: HistorialPuntos[]
  // ... otros campos
}
```

#### Formulario de Solicitudes (`src/components/recolecciones/SolicitudRecoleccionForm.tsx`)
**Funcionalidades**:
- **Validación en tiempo real** de campos
- **Programación automática** según tipo de residuo
- **Integración con sistema de puntos**
- **Feedback visual** de acciones

```tsx
// Estados del formulario:
const [formData, setFormData] = useState({
  tipoResiduo: 'ORGANICO' | 'INORGANICO' | 'PELIGROSO',
  cantidadEstimada: string,
  descripcion: string,
  direccion: string,
  fechaSolicitada: Date,
  horarioPreferido: string
})

// Validaciones implementadas:
- Fecha no puede ser anterior a hoy
- Dirección es requerida
- Cantidad estimada opcional pero recomendada
```

#### Gestión de Solicitudes Usuario (`src/components/recolecciones/MisSolicitudes.tsx`)
**Características**:
- **Filtros múltiples** (estado, tipo, fecha)
- **Paginación** para muchas solicitudes
- **Detalles expandibles** con información completa
- **Acciones contextuales** (cancelar, ver detalles)

#### Gestión Administrativa (`src/components/admin/GestionSolicitudes.tsx`)
**Funcionalidades avanzadas**:
- **Vista de todas las solicitudes** del sistema
- **Filtros administrativos** (localidad, empresa, estado)
- **Acciones masivas** (asignar empresas, cambiar estados)
- **Exportación de datos** (implementación futura)

---

### **Base de Datos - Migraciones y Esquemas**

#### Modelo de Base de Datos Completo
```prisma
// Usuario base con roles
model Usuario {
  id              String @id @default(cuid())
  email           String @unique
  password        String
  nombre          String?
  telefono        String?
  localidad       String?
  direccion       String?
  role            Role @default(USUARIO)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relaciones 1:N
  suscripcion     Suscripcion?
  solicitudes     SolicitudRecoleccion[]
  puntos          HistorialPuntos[]
  empresaPerfiles EmpresaPerfil[]
}

// Solicitudes con estado y tracking
model SolicitudRecoleccion {
  id               String @id @default(cuid())
  usuarioId        String
  tipoResiduo      TipoResiduo
  cantidadEstimada String?
  descripcion      String?
  direccion        String
  fechaSolicitada  DateTime
  horarioPreferido String?
  estado           EstadoSolicitud @default(PENDIENTE)
  fechaProgramada  DateTime?
  empresaAsignada  String?
  notasRecolector  String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Relaciones
  usuario Usuario @relation(fields: [usuarioId], references: [id])
  empresa EmpresaPerfil? @relation(fields: [empresaAsignada], references: [id])
}

// Sistema de puntos con historial
model HistorialPuntos {
  id        String @id @default(cuid())
  usuarioId String
  puntos    Int
  motivo    String?
  createdAt DateTime @default(now())
  
  usuario Usuario @relation(fields: [usuarioId], references: [id])
}

// Horarios configurables por localidad
model HorarioOrganico {
  id        String @id @default(cuid())
  localidad String @unique
  lunes     Boolean @default(false)
  martes    Boolean @default(false)
  miercoles Boolean @default(false)
  jueves    Boolean @default(false)
  viernes   Boolean @default(false)
  sabado    Boolean @default(false)
  domingo   Boolean @default(false)
}
```

---

### **Middleware y Seguridad**

#### `middleware.ts`
**Funcionalidades**:
- **Protección de rutas** administrativas
- **Redirección automática** según rol
- **Validación de sesiones** en cada request
- **Logging de accesos** (implementación futura)

```typescript
// Rutas protegidas configuradas:
const protectedRoutes = ['/dashboard']
const adminRoutes = ['/dashboard/admin']
const empresaRoutes = ['/dashboard/empresa']

// Lógica de autorización:
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar autenticación
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const user = await getCurrentUser()
    if (!user) return redirectToLogin()
  }
  
  // Verificar permisos de admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (user.role !== 'ADMIN') return redirectToDashboard()
  }
}
```

---

### **Scripts de Inicialización Detallados**

#### `scripts/create-admin.js`
```javascript
// Crea usuario administrador inicial
const adminData = {
  email: 'admin@ecoreciclaje.com',
  password: await bcrypt.hash('admin123', 10),
  nombre: 'Administrador Sistema',
  role: 'ADMIN',
  localidad: 'Central'
}

// Verifica que no exista ya un admin
const existingAdmin = await prisma.usuario.findFirst({
  where: { role: 'ADMIN' }
})
```

#### `scripts/create-test-users.js`
```javascript
// Usuarios de prueba con diferentes roles:
const usuarios = [
  { email: 'usuario@test.com', role: 'USUARIO' },
  { email: 'empresa@test.com', role: 'EMPRESA' },
  { email: 'admin2@test.com', role: 'ADMIN' }
]

// Incluye datos realistas para testing
```

#### `scripts/setup-horarios.js`
```javascript
// Configura horarios orgánicos por defecto
const horariosLocalidades = {
  'Centro': { lunes: true, miercoles: true, viernes: true },
  'Norte': { martes: true, jueves: true, sabado: true },
  'Sur': { lunes: true, miercoles: true, sabado: true }
}
```

---

### **API Routes y Server Actions**

#### Server Actions Implementadas

**Autenticación** (`src/app/auth/actions.ts`):
```typescript
'use server'

export async function loginAction(formData: FormData) {
  // Validación de campos
  // Llamada a loginUsuario()
  // Manejo de cookies
  // Redirección según rol
}

export async function signupAction(formData: FormData) {
  // Validación de datos
  // Llamada a registrarUsuario()
  // Auto-login después del registro
}
```

**Recolecciones Usuario** (`src/app/dashboard/recolecciones/actions.ts`):
```typescript
'use server'

export async function crearSolicitudAction(formData: FormData) {
  // Validación de usuario autenticado
  // Creación de solicitud
  // Programación automática
  // Asignación de puntos
}

export async function obtenerMisSolicitudesAction() {
  // Obtener usuario actual
  // Filtrar solicitudes del usuario
  // Incluir datos relacionados
}
```

**Administración** (`src/app/dashboard/admin/*/actions.ts`):
```typescript
'use server'

// Verificación de permisos de admin en cada action
export async function obtenerTodasSolicitudesAction(filtros: Filtros) {
export async function actualizarEstadoSolicitudAction(id: string, estado: EstadoSolicitud)
export async function configurarHorarioOrganicoAction(data: HorarioData)
```

---

### **Componentes UI Personalizados**

#### `src/components/ui/`
Basados en **shadcn/ui** pero customizados:

- **Button**: Variantes (default, destructive, outline, secondary, ghost, link)
- **Card**: Container principal para contenido
- **Input/Label**: Formularios con validación visual
- **Tabs**: Navegación entre secciones
- **Badge**: Estados y categorías
- **Modal**: Diálogos y confirmaciones
- **Select**: Dropdowns con opciones múltiples
- **Textarea**: Campos de texto largo

---

### **Optimizaciones y Performance**

#### Estrategias Implementadas:
1. **Server Components** por defecto
2. **Client Components** solo cuando necesario
3. **Server Actions** para operaciones de backend
4. **Lazy loading** de componentes pesados
5. **Memoización** de cálculos costosos
6. **Índices de base de datos** en campos frecuentes

#### Prisma Optimizations:
```typescript
// Includes selectivos para evitar over-fetching
const usuario = await prisma.usuario.findFirst({
  where: { id },
  include: {
    solicitudes: {
      orderBy: { createdAt: 'desc' },
      take: 5 // Solo las 5 más recientes
    },
    puntos: {
      orderBy: { createdAt: 'desc' }
    }
  }
})
```

---

### **Testing y Quality Assurance**

#### Datos de Testing Integrados:
- **Usuarios de prueba** con diferentes roles
- **Solicitudes en todos los estados** posibles
- **Horarios configurados** para múltiples localidades
- **Historial de puntos** para testing del ranking

#### Scripts de Validación:
```bash
# Verificar integridad de datos
node scripts/validate-data.js

# Limpiar datos de prueba
node scripts/clean-test-data.js

# Restaurar estado inicial
node scripts/reset-to-initial-state.js
```

---

### **Logging y Monitoring**

#### Sistema de Logs (Implementación futura):
```typescript
// Logger configuration
const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  error: (message: string, error?: Error) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data)
}

// Uso en server actions:
logger.info('Solicitud creada', { userId, solicitudId })
logger.error('Error en base de datos', error)
```

---

### **Deployment y Configuración**

#### Variables de Entorno para Producción:
```env
# Base de datos
DATABASE_URL="postgresql://user:pass@host:port/db"

# App settings
NEXT_PUBLIC_APP_URL="https://ecoreciclaje.com"
NEXT_PUBLIC_API_URL="https://api.ecoreciclaje.com"

# Security
NEXTAUTH_SECRET="your-secret-here"
BCRYPT_ROUNDS=12

# External services (futuro)
SENDGRID_API_KEY="your-key"
GOOGLE_MAPS_API_KEY="your-key"
```

#### Build y Deploy Commands:
```bash
# Build optimizado
npm run build

# Verificar build
npm run start

# Deploy en Vercel
vercel --prod

# Deploy en otros servicios
docker build -t eco-reciclaje .
docker run -p 3000:3000 eco-reciclaje
```

---

## 🛡️ Sistema de Validaciones Backend

### Arquitectura de Validación

El sistema implementa el patrón **Chain of Responsibility** para validaciones modulares, reutilizables y escalables:

```typescript
// ValidationChain.ts - Sistema base
export abstract class BaseValidator {
  protected nextValidator?: BaseValidator;
  
  setNext(validator: BaseValidator): BaseValidator {
    this.nextValidator = validator;
    return validator;
  }
  
  async validate(context: ValidationContext): Promise<ValidationResult> {
    const currentResult = await this.performValidation(context);
    if (this.nextValidator) {
      const nextResult = await this.nextValidator.validate(context);
      return this.combineResults(currentResult, nextResult);
    }
    return currentResult;
  }
}
```

### Server Actions con Validación Integrada

#### Estructura Unificada de Respuesta
```typescript
type ActionResponse = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}
```

#### Ejemplo de Integración
```typescript
// src/app/auth/actions.ts
export async function signupAction(formData: FormData) {
  try {
    const userData = {
      name: (formData.get('name') ?? '').toString(),
      email: (formData.get('email') ?? '').toString(),
      // ... más campos
    };

    // Validación con Chain of Responsibility
    const validator = createUsuarioRegistroValidator(prisma);
    const validationResult = await validator.validate({ 
      data: userData,
      metadata: { source: 'signup' }
    });

    if (!validationResult.isValid) {
      const fieldErrors: Record<string, string> = {};
      validationResult.errors.forEach(error => {
        fieldErrors[error.field] = error.message;
      });
      
      return { 
        ok: false, 
        fieldErrors, 
        message: validationResult.errors.map(e => e.message).join(', ')
      };
    }

    // Procesar registro si validación es exitosa
    const user = await createUser(userData);
    return { ok: true, userId: user.id, message: 'Registro exitoso' };
  } catch(e) {
    return { ok: false, message: 'Error interno' };
  }
}
```

### Validadores Específicos

#### 1. Validador de Registro de Usuario
```typescript
export function createUsuarioRegistroValidator(prisma: PrismaClient) {
  const chain = new ValidationChainBuilder()
    .required(['nombre', 'email', 'password'])
    .type('email', 'string')
    .minLength('password', 6)
    .unique(prisma, 'usuario', 'email')
    .businessRule('strongPassword', validateStrongPassword)
    .build();
  
  return chain;
}
```

#### 2. Validador de Solicitud de Recolección
```typescript
export function createSolicitudRecoleccionValidator(prisma: PrismaClient) {
  const chain = new ValidationChainBuilder()
    .required(['tipoResiduo', 'fechaSolicitada', 'usuarioId'])
    .type('tipoResiduo', 'string')
    .dateInFuture('fechaSolicitada')
    .businessRule('validWorkingDay', validateWorkingDay)
    .businessRule('maxSolicitudesPerDay', validateMaxSolicitudes)
    .build();
    
  return chain;
}
```

### Server Actions Integradas

| Acción | Archivo | Validaciones |
|--------|---------|-------------|
| `signupAction` | `/auth/actions.ts` | Registro de usuario completo |
| `loginAction` | `/auth/actions.ts` | Credenciales y formato |
| `crearSolicitudAction` | `/recolecciones/actions.ts` | Solicitud de recolección |
| `configurarHorarioAction` | `/recolecciones/actions.ts` | Horarios orgánicos |
| `crearEmpresaAction` | `/admin/empresas/actions.ts` | Datos de empresa |
| `cambiarPasswordAction` | `/perfil/actions.ts` | Cambio de contraseña |

### Componentes React con Validación

```typescript
// ValidationComponents.tsx
export function useValidationForm<T>(
  action: (formData: FormData) => Promise<ActionResponse>,
  initialData?: T
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await action(formData);
    
    if (!result.success && result.fieldErrors) {
      setErrors(result.fieldErrors);
    } else {
      setErrors({});
    }
    
    setIsLoading(false);
    return result;
  };
  
  return { handleSubmit, errors, isLoading };
}
```

### Beneficios del Sistema

1. **Modularidad**: Validadores reutilizables y combinables
2. **Consistencia**: Estructura uniforme de respuesta
3. **Mantenibilidad**: Fácil agregar/modificar validaciones
4. **Tipado**: TypeScript estricto en toda la cadena
5. **Performance**: Validaciones optimizadas con early exit
6. **UX**: Mensajes de error específicos por campo

Esta documentación técnica complementa la documentación general y proporciona todos los detalles de implementación necesarios para mantener y extender el sistema.
