#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Verificar si ya existe
    const existing = await prisma.usuario.findUnique({ 
      where: { email: 'test@usuario.com' } 
    });
    
    if (existing) {
      console.log('✅ Usuario de prueba ya existe:');
      console.log('   Email: test@usuario.com');
      console.log('   Password: 123456');
      console.log('   Localidad:', existing.localidad);
      return;
    }
    
    // Crear usuario de prueba
    const user = await prisma.usuario.create({
      data: {
        email: 'test@usuario.com',
        passwordHash: await bcrypt.hash('123456', 10),
        nombre: 'Usuario de Prueba',
        role: 'USUARIO',
        localidad: 'Centro',
        direccion: 'Calle Test 123',
        suscripcion: { create: { activa: true } }
      }
    });
    
    console.log('✅ Usuario de prueba creado:');
    console.log('   Email: test@usuario.com');
    console.log('   Password: 123456');
    console.log('   Localidad: Centro (tiene horario configurado)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
