const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.usuario.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('❌ Ya existe un usuario administrador:', existingAdmin.email);
      return;
    }

    // Datos del admin
    const adminData = {
      email: 'admin@ecoreciclaje.com',
      password: 'admin123', // Cambiar en producción
      nombre: 'Administrador del Sistema'
    };

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Crear usuario admin
    const admin = await prisma.usuario.create({
      data: {
        email: adminData.email,
        passwordHash,
        nombre: adminData.nombre,
        role: 'ADMIN',
        suscripcion: {
          create: {
            activa: true
          }
        }
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Contraseña: ${adminData.password}`);
    console.log(`👤 ID: ${admin.id}`);
    console.log(`🎭 Rol: ${admin.role}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
