# Instrucciones para configurar PostgreSQL con Neon (gratis)

## Paso 1: Crear cuenta en Neon
1. Ve a https://neon.tech/
2. Regístrate con GitHub o email
3. Confirma tu email

## Paso 2: Crear proyecto
1. Click en "Create Project"
2. Nombre: eco-reciclaje  
3. Region: US East (más rápido)
4. PostgreSQL version: 15 (default)

## Paso 3: Obtener connection string
1. En el dashboard, ve a "Connection Details"
2. Copia la "Connection string"
3. Se ve así: postgresql://username:password@hostname/database?sslmode=require

## Paso 4: Actualizar .env
Reemplaza la línea DATABASE_URL en .env con tu connection string de Neon:
DATABASE_URL="postgresql://tu-usuario:tu-password@tu-host.neon.tech/tu-db?sslmode=require"

## Paso 5: Migrar
npm run generate
npx prisma migrate dev --name init

## Paso 6: Crear admin y datos de prueba
node scripts/create-admin.js
node scripts/create-sample-data.js

## ¿Por qué Neon?
✅ Gratis hasta 10GB
✅ No requiere instalación local
✅ Compatible con Vercel/Netlify
✅ Escalable a producción
✅ Backups automáticos
✅ Connection pooling incluido

## Alternativa: PostgreSQL Local
Si prefieres local:
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive
sudo -u postgres createdb ecoreciclaje_dev

Luego usa:
DATABASE_URL="postgresql://tu-usuario:tu-password@localhost:5432/ecoreciclaje_dev?schema=public"
