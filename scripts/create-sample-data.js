const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('🎯 Creando datos de prueba para el sistema de puntos...\n');

    // 1. Crear configuración de puntos por defecto
    const configPuntos = await prisma.configPuntos.create({
      data: {
        descripcion: 'Configuración estándar de puntos',
        expresion: 'base + peso * factorPeso + (separado ? factorSeparado : 0)',
        base: 10,
        factorPeso: 2,
        factorSeparado: 5,
        activo: true
      }
    });

    // 2. Obtener algunos usuarios para crear solicitudes
    const usuarios = await prisma.usuario.findMany({
      where: { role: 'USUARIO' },
      take: 3
    });

    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios normales. Creando algunos...');
      
      // Crear usuarios de ejemplo
      const bcrypt = require('bcrypt');
      
      const user1 = await prisma.usuario.create({
        data: {
          email: 'maria@ejemplo.com',
          passwordHash: await bcrypt.hash('123456', 10),
          nombre: 'María López',
          role: 'USUARIO',
          localidad: 'Centro',
          direccion: 'Calle 25 #15-30',
          suscripcion: { create: { activa: true } }
        }
      });

      const user2 = await prisma.usuario.create({
        data: {
          email: 'pedro@ejemplo.com',
          passwordHash: await bcrypt.hash('123456', 10),
          nombre: 'Pedro Martínez',
          role: 'USUARIO',
          localidad: 'Norte',
          direccion: 'Carrera 45 #80-20',
          suscripcion: { create: { activa: true } }
        }
      });

      usuarios.push(user1, user2);
    }

    // 3. Crear empresa recolectora
    let empresa = await prisma.empresaRecolectora.findFirst();
    if (!empresa) {
      empresa = await prisma.empresaRecolectora.create({
        data: {
          nombre: 'EcoRecolectora Demo',
          nit: '123456789-0',
          contactoEmail: 'contacto@ecorecolectora.com',
          contactoTel: '+57 300 123 4567'
        }
      });
    }

    // 4. Crear solicitudes y recolecciones completadas
    const tiposResiduos = ['ORGANICO', 'INORGANICO', 'PELIGROSO'];
    let totalPuntosGenerados = 0;

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      
      // Crear 3-5 solicitudes por usuario
      const numSolicitudes = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < numSolicitudes; j++) {
        const tipoResiduo = tiposResiduos[Math.floor(Math.random() * tiposResiduos.length)];
        const pesoKg = Math.random() * 10 + 1; // 1-11 kg
        const separadoOk = Math.random() > 0.3; // 70% bien separado
        
        // Crear solicitud
        const solicitud = await prisma.solicitudRecoleccion.create({
          data: {
            usuarioId: usuario.id,
            tipoResiduo: tipoResiduo,
            estado: 'COMPLETADA',
            fechaSolicitada: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
            fechaProgramada: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000)
          }
        });

        // Calcular puntos
        const puntos = configPuntos.base + (pesoKg * configPuntos.factorPeso) + (separadoOk ? configPuntos.factorSeparado : 0);
        const puntosRedondeados = Math.round(puntos);

        // Crear recolección
        const recoleccion = await prisma.recoleccion.create({
          data: {
            solicitudId: solicitud.id,
            empresaId: empresa.id,
            pesoKg: Math.round(pesoKg * 10) / 10, // Redondear a 1 decimal
            separadoOk: separadoOk,
            puntosGenerados: puntosRedondeados,
            fecha: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000)
          }
        });

        // Crear registro de puntos
        await prisma.puntaje.create({
          data: {
            usuarioId: usuario.id,
            recoleccionId: recoleccion.id,
            puntos: puntosRedondeados,
            motivo: `Recolección de ${Math.round(pesoKg * 10) / 10}kg - ${tipoResiduo.toLowerCase()}`,
            createdAt: recoleccion.fecha
          }
        });

        totalPuntosGenerados += puntosRedondeados;
      }
    }

    // 5. Crear algunas bonificaciones y penalizaciones de ejemplo
    const usuarioParaBonus = usuarios[0];
    await prisma.puntaje.create({
      data: {
        usuarioId: usuarioParaBonus.id,
        puntos: 50,
        motivo: 'Bonificación: Excelente separación durante todo el mes',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Hace 5 días
      }
    });

    const usuarioParaPenalty = usuarios[1];
    await prisma.puntaje.create({
      data: {
        usuarioId: usuarioParaPenalty.id,
        puntos: -20,
        motivo: 'Penalización: Material mal separado en múltiples ocasiones',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Hace 3 días
      }
    });

    console.log('✅ Datos de prueba creados exitosamente:\n');
    console.log(`📊 Configuración de puntos: ${configPuntos.descripcion}`);
    console.log(`   • Base: ${configPuntos.base} puntos`);
    console.log(`   • Factor peso: ${configPuntos.factorPeso}x por kg`);
    console.log(`   • Bonus separación: ${configPuntos.factorSeparado} puntos\n`);
    
    console.log(`👥 Usuarios con datos: ${usuarios.length}`);
    console.log(`🏢 Empresa creada: ${empresa.nombre}`);
    console.log(`🎯 Total puntos generados: ${totalPuntosGenerados + 50 - 20}\n`);
    
    console.log('🧪 Prueba el sistema:');
    console.log('1. Inicia sesión como admin: admin@ecoreciclaje.com / admin123');
    console.log('2. Ve a Dashboard > Sistema de Puntos');
    console.log('3. Explora las configuraciones y estadísticas');
    console.log('4. Prueba crear nuevas configuraciones');
    console.log('5. Asigna bonificaciones/penalizaciones\n');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();
