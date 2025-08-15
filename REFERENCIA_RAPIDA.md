# 🚀 Guía de Referencia Rápida - EcoReciclaje

## 📋 Comandos Esenciales

### **Inicialización del Proyecto**
```bash
# 1. Clonar e instalar dependencias
git clone [repo-url]
cd eco-reciclaje
npm install

# 2. Configurar base de datos
npm run db:generate
npm run db:push

# 3. Crear datos iniciales
node scripts/create-admin.js
node scripts/create-test-users.js
node scripts/setup-horarios.js
node scripts/crear-solicitudes-prueba.js

# 4. Iniciar desarrollo
npm run dev
```

### **Gestión de Base de Datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar cambios al schema
npm run db:push

# Abrir Prisma Studio
npm run db:studio

# Reset completo (desarrollo)
rm prisma/dev.db && npm run db:push

# Migración a producción
npx prisma migrate deploy
```

---

## 🔐 Credenciales de Acceso

### **Usuarios de Prueba**
```
👨‍💼 Administrador:
Email: admin@ecoreciclaje.com
Password: admin123

👤 Usuario Normal:
Email: usuario@test.com  
Password: password123

🏢 Empresa:
Email: empresa@test.com
Password: password123
```

### **URLs Principales**
```
🏠 Home: http://localhost:3000
🔐 Login: http://localhost:3000/auth/login
📊 Dashboard: http://localhost:3000/dashboard
♻️ Recolecciones: http://localhost:3000/dashboard/recolecciones
⚙️ Admin: http://localhost:3000/dashboard/admin/*
```

---

## 🗄️ Operaciones de Base de Datos

### **Consultas Útiles con Prisma Studio**

#### Ver todos los usuarios:
```sql
SELECT id, email, nombre, role, localidad FROM Usuario;
```

#### Ver solicitudes por estado:
```sql  
SELECT * FROM SolicitudRecoleccion 
WHERE estado = 'PENDIENTE'
ORDER BY createdAt DESC;
```

#### Ver puntos por usuario:
```sql
SELECT u.nombre, SUM(h.puntos) as total_puntos
FROM Usuario u
JOIN HistorialPuntos h ON u.id = h.usuarioId
GROUP BY u.id
ORDER BY total_puntos DESC;
```

### **Operaciones Comunes**

#### Crear usuario manualmente:
```typescript
await prisma.usuario.create({
  data: {
    email: "nuevo@test.com",
    password: await bcrypt.hash("password", 10),
    nombre: "Usuario Nuevo",
    role: "USUARIO",
    localidad: "Centro"
  }
})
```

#### Actualizar estado de solicitud:
```typescript
await prisma.solicitudRecoleccion.update({
  where: { id: "solicitud-id" },
  data: { estado: "COMPLETADA" }
})
```

---

## 🎯 Flujos de Trabajo Principales

### **Como Usuario - Crear Solicitud**
1. Login → `/auth/login`
2. Dashboard → `/dashboard`
3. "Nueva Solicitud" → `/dashboard/recolecciones`
4. Llenar formulario → Submit
5. Ver en "Mis Solicitudes"

### **Como Admin - Gestionar Sistema**
1. Login como admin → `/auth/login`
2. Dashboard Admin → `/dashboard`
3. Opciones disponibles:
   - Usuarios → `/dashboard/admin/usuarios`
   - Empresas → `/dashboard/admin/empresas`
   - Solicitudes → `/dashboard/admin/solicitudes`
   - Horarios → `/dashboard/admin/horarios`

### **Configurar Horarios Orgánicos**
1. Admin panel → `/dashboard/admin/horarios`
2. Seleccionar localidad
3. Marcar días de recolección
4. Guardar configuración

---

## 🔧 Debugging y Troubleshooting

### **Problemas Comunes**

#### ❌ Error de base de datos
```bash
# Regenerar cliente Prisma
npm run db:generate

# Verificar conexión
npx prisma db pull
```

#### ❌ Error de autenticación
```bash
# Verificar cookies en DevTools
# Limpiar localStorage/sessionStorage
# Comprobar middleware.ts
```

#### ❌ Error de compilación
```bash
# Limpiar cache de Next.js
rm -rf .next
npm run dev

# Verificar tipos TypeScript
npx tsc --noEmit
```

### **Logs Útiles**

#### Ver logs de servidor:
```javascript
// En server actions
console.log('[DEBUG] Usuario:', user)
console.log('[DEBUG] Solicitud creada:', solicitud)
```

#### Debug de Prisma:
```bash
# Ver queries SQL
DATABASE_URL="file:./dev.db?debug=true" npm run dev
```

---

## 📝 Snippets de Código Útiles

### **Server Action Template**
```typescript
'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function miAction(formData: FormData) {
  // Verificar autenticación
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  // Extraer datos del form
  const data = {
    campo: formData.get('campo') as string
  }
  
  try {
    // Operación en BD
    const resultado = await prisma.modelo.create({ data })
    
    // Redireccionar con éxito
    redirect('/dashboard?success=true')
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Error al crear')
  }
}
```

### **Componente con Estado**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function MiComponente() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Llamar server action
      await miAction(formData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button 
      onClick={handleSubmit} 
      disabled={loading}
    >
      {loading ? 'Procesando...' : 'Enviar'}
    </Button>
  )
}
```

### **Query de Prisma con Relaciones**
```typescript
const solicitudes = await prisma.solicitudRecoleccion.findMany({
  where: {
    usuarioId: user.id,
    estado: { in: ['PENDIENTE', 'PROGRAMADA'] }
  },
  include: {
    usuario: {
      select: { nombre: true, email: true }
    },
    empresa: {
      select: { nombre: true }
    }
  },
  orderBy: { createdAt: 'desc' }
})
```

---

## 🎨 Componentes UI Más Usados

### **Card con Contenido**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
</Card>
```

### **Formulario Básico**
```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<form action={miAction}>
  <Label htmlFor="campo">Campo:</Label>
  <Input 
    id="campo" 
    name="campo" 
    required 
  />
  <Button type="submit">Enviar</Button>
</form>
```

### **Badge con Estado**
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant={
  estado === 'COMPLETADA' ? 'default' : 
  estado === 'PENDIENTE' ? 'secondary' : 
  'destructive'
}>
  {estado}
</Badge>
```

---

## 🚨 Scripts de Emergencia

### **Reset Total del Sistema**
```bash
#!/bin/bash
# reset-system.sh

echo "🔄 Reseteando sistema completo..."

# Limpiar base de datos
rm -f prisma/dev.db*

# Regenerar BD
npm run db:push

# Recrear datos iniciales
node scripts/create-admin.js
node scripts/create-test-users.js
node scripts/setup-horarios.js

echo "✅ Sistema restaurado!"
```

### **Backup de Base de Datos**
```bash
#!/bin/bash  
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
cp prisma/dev.db "backups/db_backup_$DATE.db"
echo "✅ Backup creado: db_backup_$DATE.db"
```

### **Verificar Integridad**
```bash
#!/bin/bash
# check-integrity.sh

echo "🔍 Verificando integridad del sistema..."

# Verificar archivos críticos
files=("prisma/schema.prisma" "src/lib/auth.ts" "middleware.ts")
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Archivo faltante: $file"
    exit 1
  fi
done

# Verificar BD
npm run db:generate
npx prisma db pull

echo "✅ Sistema íntegro!"
```

---

## 📊 Métricas y Monitoreo

### **Estadísticas del Sistema**
```sql
-- Total usuarios por rol
SELECT role, COUNT(*) as total FROM Usuario GROUP BY role;

-- Solicitudes por estado  
SELECT estado, COUNT(*) as total FROM SolicitudRecoleccion GROUP BY estado;

-- Puntos totales por usuario
SELECT u.nombre, SUM(h.puntos) as puntos
FROM Usuario u
LEFT JOIN HistorialPuntos h ON u.id = h.usuarioId  
GROUP BY u.id
ORDER BY puntos DESC LIMIT 10;

-- Localidades más activas
SELECT localidad, COUNT(*) as solicitudes
FROM SolicitudRecoleccion s
JOIN Usuario u ON s.usuarioId = u.id
GROUP BY u.localidad
ORDER BY solicitudes DESC;
```

### **Performance Checks**
```bash
# Verificar tamaño de BD
ls -lh prisma/dev.db

# Verificar memoria de Node.js
node --max-old-space-size=4096 npm run build

# Verificar build size
npm run build && ls -lh .next/static/
```

---

## 🔗 Links de Referencia

### **Documentación Externa**
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs)

### **Herramientas de Desarrollo**
- [Prisma Studio](http://localhost:5555) - `npm run db:studio`
- [Next.js DevTools](https://nextjs.org/docs/advanced-features/debugging)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**💡 Tip**: Guarda este archivo como referencia rápida. Todos los comandos han sido probados en el entorno de desarrollo actual.
