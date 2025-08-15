const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🧪 Creando usuarios de prueba...\n');

    // Usuario normal 1
    const user1Hash = await bcrypt.hash('123456', 10);
    const user1 = await prisma.usuario.create({
      data: {
        email: 'ana@ejemplo.com',
        passwordHash: user1Hash,
        nombre: 'Ana García',
        role: 'USUARIO',
        localidad: 'Centro',
        direccion: 'Carrera 15 #32-45',
        suscripcion: { create: { activa: true } }
      }
    });

    // Usuario normal 2
    const user2Hash = await bcrypt.hash('123456', 10);
    const user2 = await prisma.usuario.create({
      data: {
        email: 'carlos@ejemplo.com',
        passwordHash: user2Hash,
        nombre: 'Carlos Rodríguez',
        role: 'USUARIO',
        localidad: 'Norte',
        direccion: 'Calle 80 #12-25',
        suscripcion: { create: { activa: true } }
      }
    });

    // Empresa recolectora
    const empresaHash = await bcrypt.hash('123456', 10);
    const empresa = await prisma.usuario.create({
      data: {
        email: 'recolectora@ecogreen.com',
        passwordHash: empresaHash,
        nombre: 'EcoGreen Recolectora',
        role: 'EMPRESA',
        suscripcion: { create: { activa: true } }
      }
    });

    console.log('✅ Usuarios de prueba creados:\n');
    console.log('👤 Ana García:');
    console.log('   📧 Email: ana@ejemplo.com');
    console.log('   🔑 Contraseña: 123456');
    console.log('   📍 Localidad: Centro\n');

    console.log('👤 Carlos Rodríguez:');
    console.log('   📧 Email: carlos@ejemplo.com');
    console.log('   🔑 Contraseña: 123456');
    console.log('   📍 Localidad: Norte\n');

    console.log('🏢 EcoGreen Recolectora:');
    console.log('   📧 Email: recolectora@ecogreen.com');
    console.log('   🔑 Contraseña: 123456');
    console.log('   🎭 Tipo: Empresa\n');

    console.log('🎯 Ahora puedes probar el login con cualquiera de estos usuarios!');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Algunos usuarios ya existen. Esto es normal.');
    } else {
      console.error('❌ Error creando usuarios de prueba:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
