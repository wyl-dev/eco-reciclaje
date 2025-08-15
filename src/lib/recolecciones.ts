import { prisma } from '@/lib/prisma';
import type { ResiduoTipo, SolicitudEstado, FrecuenciaInorganico, FrecuenciaPeligroso, DiaSemana } from '@prisma/client';

// ==================== CREAR SOLICITUDES ====================

export async function crearSolicitudRecoleccion(data: {
  usuarioId: string;
  tipoResiduo: ResiduoTipo;
  fechaSolicitada: Date;
  frecuenciaInorg?: FrecuenciaInorganico;
  frecuenciaPelig?: FrecuenciaPeligroso;
  localidad?: string;
  notas?: string;
}) {
  // Validaciones según tipo de residuo
  if (data.tipoResiduo === 'INORGANICO' && !data.frecuenciaInorg) {
    throw new Error('La frecuencia es requerida para residuos inorgánicos');
  }

  if (data.tipoResiduo === 'PELIGROSO' && !data.frecuenciaPelig) {
    throw new Error('La frecuencia es requerida para residuos peligrosos');
  }

  // Crear la solicitud
  const solicitud = await prisma.solicitudRecoleccion.create({
    data: {
      usuarioId: data.usuarioId,
      tipoResiduo: data.tipoResiduo,
      fechaSolicitada: data.fechaSolicitada,
      frecuenciaInorg: data.frecuenciaInorg,
      frecuenciaPelig: data.frecuenciaPelig,
      localidad: data.localidad,
      notas: data.notas,
      estado: 'PENDIENTE'
    },
    include: {
      usuario: {
        select: { nombre: true, email: true, localidad: true }
      }
    }
  });

  // Para residuos orgánicos, programar automáticamente según horarios
  if (data.tipoResiduo === 'ORGANICO') {
    await programarRecoleccionOrganica(solicitud.id, data.localidad || solicitud.usuario.localidad || undefined);
  }

  return solicitud;
}

// ==================== PROGRAMACIÓN AUTOMÁTICA ====================

async function programarRecoleccionOrganica(solicitudId: string, localidad?: string) {
  if (!localidad) return;

  // Buscar horario configurado para la localidad
  const horario = await prisma.horarioOrganico.findUnique({
    where: { localidad }
  });

  if (horario) {
    // Calcular próxima fecha según el día configurado
    const proximaFecha = calcularProximaFecha(horario.dia);
    
    await prisma.solicitudRecoleccion.update({
      where: { id: solicitudId },
      data: {
        fechaProgramada: proximaFecha,
        estado: 'PROGRAMADA'
      }
    });
  }
}

function calcularProximaFecha(diaSemana: string): Date {
  const diasSemana = {
    'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4,
    'VIERNES': 5, 'SABADO': 6, 'DOMINGO': 0
  };

  const hoy = new Date();
  const diaObjetivo = diasSemana[diaSemana as keyof typeof diasSemana];
  const diaActual = hoy.getDay();
  
  let diasHastaObjetivo = diaObjetivo - diaActual;
  if (diasHastaObjetivo <= 0) {
    diasHastaObjetivo += 7; // Próxima semana
  }

  const proximaFecha = new Date();
  proximaFecha.setDate(hoy.getDate() + diasHastaObjetivo);
  proximaFecha.setHours(8, 0, 0, 0); // 8:00 AM por defecto
  
  return proximaFecha;
}

// ==================== CONSULTAS ====================

export async function getSolicitudesUsuario(
  usuarioId: string, 
  limite = 20, 
  estado?: SolicitudEstado
) {
  return prisma.solicitudRecoleccion.findMany({
    where: {
      usuarioId,
      ...(estado && { estado })
    },
    include: {
      recoleccion: {
        include: {
          empresa: true,
          puntaje: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limite
  });
}

export async function getSolicitudesPendientes(localidad?: string, limite = 50) {
  return prisma.solicitudRecoleccion.findMany({
    where: {
      ...(localidad && { localidad })
    },
    include: {
      usuario: {
        select: { nombre: true, email: true, telefono: true, direccion: true }
      }
    },
    orderBy: { fechaSolicitada: 'desc' },
    take: limite
  });
}

export async function getSolicitudesAdmin(estado?: SolicitudEstado, localidad?: string, limite = 100) {
  return prisma.solicitudRecoleccion.findMany({
    where: {
      ...(estado && { estado }),
      ...(localidad && { localidad })
    },
    include: {
      usuario: {
        select: { nombre: true, email: true, telefono: true, direccion: true }
      }
    },
    orderBy: { fechaSolicitada: 'desc' },
    take: limite
  });
}

// ==================== GESTIÓN DE ESTADOS ====================

export async function asignarSolicitud(solicitudId: string) {
  return prisma.solicitudRecoleccion.update({
    where: { id: solicitudId },
    data: { 
      estado: 'ASIGNADA'
      // En el futuro se podría agregar relación con empresa
    }
  });
}

export async function completarSolicitud(
  solicitudId: string, 
  datosRecoleccion: {
    empresaId?: string;
    pesoKg: number;
    separadoOk: boolean;
  }
) {
  // Usar la función existente de procesarRecoleccion
  const { procesarRecoleccion } = await import('@/lib/puntos');
  
  return procesarRecoleccion({
    solicitudId,
    empresaId: datosRecoleccion.empresaId,
    pesoKg: datosRecoleccion.pesoKg,
    separadoOk: datosRecoleccion.separadoOk
  });
}

export async function cancelarSolicitud(solicitudId: string, motivo?: string) {
  return prisma.solicitudRecoleccion.update({
    where: { id: solicitudId },
    data: { 
      estado: 'CANCELADA',
      notas: motivo ? `Cancelada: ${motivo}` : 'Cancelada por el usuario'
    }
  });
}

// ==================== CONFIGURACIÓN DE HORARIOS ====================

export async function configurarHorarioOrganico(localidad: string, dia: string) {
  const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  if (!diasValidos.includes(dia)) {
    throw new Error('Día de semana inválido');
  }

  return prisma.horarioOrganico.upsert({
    where: { localidad },
    update: { dia: dia as DiaSemana },
    create: { 
      localidad, 
      dia: dia as DiaSemana
    }
  });
}

export async function getHorariosOrganicos() {
  return prisma.horarioOrganico.findMany({
    orderBy: { localidad: 'asc' }
  });
}
