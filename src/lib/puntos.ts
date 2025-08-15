import { prisma } from './prisma';

// ==================== CONFIGURACIÓN DE PUNTOS ====================

export async function getConfigPuntos() {
  return prisma.configPuntos.findFirst({
    where: { activo: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAllConfigPuntos() {
  return prisma.configPuntos.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createConfigPuntos(data: {
  descripcion?: string;
  expresion?: string;
  base?: number;
  factorPeso?: number;
  factorSeparado?: number;
}) {
  // Desactivar configuraciones anteriores
  await prisma.configPuntos.updateMany({
    where: { activo: true },
    data: { activo: false }
  });

  // Crear nueva configuración activa
  return prisma.configPuntos.create({
    data: {
      descripcion: data.descripcion || 'Configuración de puntos',
      expresion: data.expresion || 'base + peso * factorPeso + (separado ? factorSeparado : 0)',
      base: data.base || 10,
      factorPeso: data.factorPeso || 2,
      factorSeparado: data.factorSeparado || 5,
      activo: true
    }
  });
}

export async function updateConfigPuntos(id: string, data: {
  descripcion?: string;
  expresion?: string;
  base?: number;
  factorPeso?: number;
  factorSeparado?: number;
  activo?: boolean;
}) {
  // Si se activa esta configuración, desactivar las demás
  if (data.activo) {
    await prisma.configPuntos.updateMany({
      where: { 
        activo: true,
        id: { not: id }
      },
      data: { activo: false }
    });
  }

  return prisma.configPuntos.update({
    where: { id },
    data
  });
}

export async function deleteConfigPuntos(id: string) {
  const config = await prisma.configPuntos.findUnique({ where: { id } });
  if (config?.activo) {
    throw new Error('No se puede eliminar la configuración activa');
  }
  
  return prisma.configPuntos.delete({ where: { id } });
}

// ==================== CÁLCULO Y ASIGNACIÓN DE PUNTOS ====================

export async function calcularPuntos(pesoKg: number, separadoOk: boolean = false): Promise<number> {
  const config = await getConfigPuntos();
  if (!config) {
    // Configuración por defecto si no existe
    return 10 + (pesoKg * 2) + (separadoOk ? 5 : 0);
  }

  // Evaluar expresión (versión simple y segura)
  let puntos = config.base;
  puntos += pesoKg * config.factorPeso;
  if (separadoOk) {
    puntos += config.factorSeparado;
  }

  return Math.round(puntos);
}

export async function asignarPuntos(data: {
  usuarioId: string;
  recoleccionId?: string;
  puntos: number;
  motivo?: string;
}) {
  return prisma.puntaje.create({
    data: {
      usuarioId: data.usuarioId,
      recoleccionId: data.recoleccionId,
      puntos: data.puntos,
      motivo: data.motivo || 'Recolección exitosa'
    }
  });
}

export async function procesarRecoleccion(data: {
  solicitudId: string;
  empresaId?: string;
  pesoKg: number;
  separadoOk: boolean;
}) {
  // Obtener la solicitud con el usuario
  const solicitud = await prisma.solicitudRecoleccion.findUnique({
    where: { id: data.solicitudId },
    include: { usuario: true }
  });

  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }

  // Calcular puntos
  const puntosCalculados = await calcularPuntos(data.pesoKg, data.separadoOk);

  // Crear recolección
  const recoleccion = await prisma.recoleccion.create({
    data: {
      solicitudId: data.solicitudId,
      empresaId: data.empresaId,
      pesoKg: data.pesoKg,
      separadoOk: data.separadoOk,
      puntosGenerados: puntosCalculados
    }
  });

  // Asignar puntos al usuario
  await asignarPuntos({
    usuarioId: solicitud.usuarioId,
    recoleccionId: recoleccion.id,
    puntos: puntosCalculados,
    motivo: `Recolección de ${data.pesoKg}kg - ${solicitud.tipoResiduo.toLowerCase()}`
  });

  // Actualizar estado de la solicitud
  await prisma.solicitudRecoleccion.update({
    where: { id: data.solicitudId },
    data: { estado: 'COMPLETADA' }
  });

  return { recoleccion, puntosGenerados: puntosCalculados };
}

// ==================== CONSULTAS DE PUNTOS ====================

export async function getPuntosUsuario(usuarioId: string, limite = 50) {
  const [puntos, total] = await Promise.all([
    prisma.puntaje.findMany({
      where: { usuarioId },
      include: {
        recoleccion: {
          include: {
            solicitud: {
              select: {
                tipoResiduo: true,
                fechaSolicitada: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limite
    }),
    prisma.puntaje.aggregate({
      where: { usuarioId },
      _sum: { puntos: true },
      _count: { id: true }
    })
  ]);

  return {
    historial: puntos,
    totalPuntos: total._sum.puntos || 0,
    totalRegistros: total._count.id
  };
}

export async function getRankingUsuarios(limite = 20) {
  const ranking = await prisma.usuario.findMany({
    where: { 
      role: 'USUARIO',
      suscripcion: { activa: true }
    },
    include: {
      puntos: {
        select: { puntos: true }
      },
      _count: {
        select: {
          solicitudes: {
            where: { estado: 'COMPLETADA' }
          }
        }
      }
    },
    take: limite
  });

  return ranking.map(usuario => ({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    localidad: usuario.localidad,
    totalPuntos: usuario.puntos.reduce((sum, p) => sum + p.puntos, 0),
    recoleccionesCompletadas: usuario._count.solicitudes
  })).sort((a, b) => b.totalPuntos - a.totalPuntos);
}

export async function getEstadisticasPuntos() {
  const [
    totalPuntosGenerados,
    usuariosConPuntos,
    promedioUsuario,
    puntosHoy,
    puntosEsteMes
  ] = await Promise.all([
    prisma.puntaje.aggregate({
      _sum: { puntos: true },
      _count: { id: true }
    }),
    prisma.puntaje.groupBy({
      by: ['usuarioId'],
      _count: { id: true }
    }),
    prisma.puntaje.aggregate({
      _avg: { puntos: true }
    }),
    prisma.puntaje.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      },
      _sum: { puntos: true },
      _count: { id: true }
    }),
    prisma.puntaje.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      },
      _sum: { puntos: true },
      _count: { id: true }
    })
  ]);

  return {
    totalPuntosGenerados: totalPuntosGenerados._sum.puntos || 0,
    totalRegistros: totalPuntosGenerados._count,
    usuariosConPuntos: usuariosConPuntos.length,
    promedioUsuario: Math.round(promedioUsuario._avg.puntos || 0),
    hoy: {
      puntos: puntosHoy._sum.puntos || 0,
      registros: puntosHoy._count.id || 0
    },
    esteMes: {
      puntos: puntosEsteMes._sum.puntos || 0,
      registros: puntosEsteMes._count.id || 0
    }
  };
}

// ==================== BONIFICACIONES Y PENALIZACIONES ====================

export async function asignarBonificacion(data: {
  usuarioId: string;
  puntos: number;
  motivo: string;
}) {
  return asignarPuntos({
    usuarioId: data.usuarioId,
    puntos: data.puntos,
    motivo: `Bonificación: ${data.motivo}`
  });
}

export async function asignarPenalizacion(data: {
  usuarioId: string;
  puntos: number;
  motivo: string;
}) {
  return asignarPuntos({
    usuarioId: data.usuarioId,
    puntos: -Math.abs(data.puntos), // Asegurar que sea negativo
    motivo: `Penalización: ${data.motivo}`
  });
}
