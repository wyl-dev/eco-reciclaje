#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function configurarHorariosBasicos() {
  console.log('🕐 Configurando horarios básicos de recolección orgánica...\n');

  const horariosBasicos = [
    { localidad: 'Centro', dia: 'LUNES' },
    { localidad: 'Norte', dia: 'MARTES' },
    { localidad: 'Sur', dia: 'MIERCOLES' },
    { localidad: 'Oriente', dia: 'JUEVES' },
    { localidad: 'Occidente', dia: 'VIERNES' },
  ];

  for (const horario of horariosBasicos) {
    try {
      await prisma.horarioOrganico.upsert({
        where: { localidad: horario.localidad },
        update: { dia: horario.dia },
        create: { 
          localidad: horario.localidad, 
          dia: horario.dia 
        }
      });
      
      console.log(`✅ ${horario.localidad}: ${horario.dia}s`);
    } catch (error) {
      console.error(`❌ Error configurando ${horario.localidad}:`, error.message);
    }
  }

  console.log('\n📊 Horarios configurados:');
  const todosHorarios = await prisma.horarioOrganico.findMany({
    orderBy: { localidad: 'asc' }
  });

  todosHorarios.forEach(h => {
    console.log(`   ${h.localidad}: ${h.dia}s`);
  });

  console.log(`\n🎯 Total de localidades configuradas: ${todosHorarios.length}`);
  console.log('\n💡 Ahora los usuarios de estas localidades pueden solicitar recolección orgánica');
  console.log('   y serán programadas automáticamente según estos horarios.');

  await prisma.$disconnect();
}

configurarHorariosBasicos().catch(console.error);
