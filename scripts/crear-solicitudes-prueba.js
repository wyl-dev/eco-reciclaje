#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearSolicitudesPrueba() {
  console.log('📋 Creando solicitudes de prueba...\n');

  try {
    // Obtener usuarios
    const usuarios = await prisma.usuario.findMany({
      where: { role: 'USUARIO' },
      take: 3
    });

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios para crear solicitudes');
      return;
    }

    const tiposResiduos = ['ORGANICO', 'INORGANICO', 'PELIGROSO'];
    const estados = ['PENDIENTE', 'PROGRAMADA', 'COMPLETADA'];

    for (let i = 0; i < 10; i++) {
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
      const tipoResiduo = tiposResiduos[Math.floor(Math.random() * tiposResiduos.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      
      // Fecha aleatoria en los últimos 15 días
      const fechaSolicitada = new Date();
      fechaSolicitada.setDate(fechaSolicitada.getDate() - Math.floor(Math.random() * 15));

      const solicitudData = {
        usuarioId: usuario.id,
        tipoResiduo: tipoResiduo,
        estado: estado,
        fechaSolicitada: fechaSolicitada,
        localidad: usuario.localidad,
        notas: `Solicitud de prueba ${i + 1} - ${tipoResiduo.toLowerCase()}`
      };

      // Agregar frecuencia si es necesario
      if (tipoResiduo === 'INORGANICO') {
        const frecuencias = ['UNICA', 'SEMANAL_1', 'SEMANAL_2'];
        solicitudData.frecuenciaInorg = frecuencias[Math.floor(Math.random() * frecuencias.length)];
      }

      if (tipoResiduo === 'PELIGROSO') {
        const frecuencias = ['UNICA', 'MENSUAL'];
        solicitudData.frecuenciaPelig = frecuencias[Math.floor(Math.random() * frecuencias.length)];
      }

      // Si está programada o completada, agregar fecha programada
      if (estado === 'PROGRAMADA' || estado === 'COMPLETADA') {
        const fechaProgramada = new Date(fechaSolicitada);
        fechaProgramada.setDate(fechaProgramada.getDate() + Math.floor(Math.random() * 7) + 1);
        solicitudData.fechaProgramada = fechaProgramada;
      }

      const solicitud = await prisma.solicitudRecoleccion.create({
        data: solicitudData
      });

      console.log(`✅ Solicitud ${i + 1}: ${tipoResiduo} - ${estado} (${usuario.nombre})`);
    }

    const total = await prisma.solicitudRecoleccion.count();
    console.log(`\n🎯 Total solicitudes en sistema: ${total}`);
    
    console.log('\n📊 Resumen por estado:');
    const resumen = await prisma.solicitudRecoleccion.groupBy({
      by: ['estado'],
      _count: { estado: true }
    });
    
    resumen.forEach(r => {
      console.log(`   ${r.estado}: ${r._count.estado} solicitudes`);
    });

    console.log('\n💡 Puedes ver todas las solicitudes en:');
    console.log('   👤 Usuarios: /dashboard/recolecciones (pestaña "Mis Solicitudes")');
    console.log('   🔧 Admin: /dashboard/admin/solicitudes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

crearSolicitudesPrueba();
