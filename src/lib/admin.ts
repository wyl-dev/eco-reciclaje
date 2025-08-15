import { prisma } from './prisma';

// ==================== GESTIÓN DE USUARIOS ====================

export async function getAllUsers(page = 1, limit = 20, role?: 'ADMIN' | 'USUARIO' | 'EMPRESA') {
  const skip = (page - 1) * limit;
  
  const where = role ? { role } : {};
  
  const [users, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      include: {
        suscripcion: true,
        solicitudes: {
          where: { estado: { in: ['PENDIENTE', 'PROGRAMADA', 'ASIGNADA'] } },
          select: { id: true }
        },
        puntos: {
          select: { puntos: true }
        },
        _count: {
          select: {
            solicitudes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.usuario.count({ where })
  ]);

  // Calcular puntos totales para cada usuario
  const usersWithStats = users.map(user => ({
    ...user,
    totalPuntos: user.puntos.reduce((sum, p) => sum + p.puntos, 0),
    solicitudesActivas: user.solicitudes.length,
    totalSolicitudes: user._count.solicitudes
  }));

  return {
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getUserById(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      suscripcion: true,
      solicitudes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          recoleccion: true
        }
      },
      puntos: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
}

export async function updateUserStatus(id: string, active: boolean) {
  return prisma.usuario.update({
    where: { id },
    data: {
      suscripcion: {
        update: {
          activa: active
        }
      }
    }
  });
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'USUARIO' | 'EMPRESA') {
  return prisma.usuario.update({
    where: { id },
    data: { role }
  });
}

export async function deleteUser(id: string) {
  // Eliminar en orden para evitar problemas de foreign key
  await prisma.puntaje.deleteMany({ where: { usuarioId: id } });
  await prisma.notificacion.deleteMany({ where: { usuarioId: id } });
  
  // Eliminar recolecciones relacionadas
  const solicitudes = await prisma.solicitudRecoleccion.findMany({
    where: { usuarioId: id },
    include: { recoleccion: true }
  });
  
  for (const solicitud of solicitudes) {
    if (solicitud.recoleccion) {
      await prisma.recoleccion.delete({ where: { id: solicitud.recoleccion.id } });
    }
  }
  
  await prisma.solicitudRecoleccion.deleteMany({ where: { usuarioId: id } });
  await prisma.suscripcion.deleteMany({ where: { usuarioId: id } });
  
  return prisma.usuario.delete({ where: { id } });
}

// ==================== GESTIÓN DE EMPRESAS ====================

export async function getAllEmpresas(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [empresas, total] = await Promise.all([
    prisma.empresaRecolectora.findMany({
      include: {
        usuarios: {
          select: { id: true, nombre: true, email: true }
        },
        recolecciones: {
          where: { 
            fecha: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          select: { id: true, pesoKg: true }
        },
        _count: {
          select: {
            recolecciones: true,
            usuarios: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.empresaRecolectora.count()
  ]);

  // Calcular estadísticas para cada empresa
  const empresasWithStats = empresas.map(empresa => ({
    ...empresa,
    recoleccionesMes: empresa.recolecciones.length,
    pesoTotalMes: empresa.recolecciones.reduce((sum, r) => sum + (r.pesoKg || 0), 0),
    totalRecolecciones: empresa._count.recolecciones,
    totalUsuarios: empresa._count.usuarios
  }));

  return {
    empresas: empresasWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getEmpresaById(id: string) {
  return prisma.empresaRecolectora.findUnique({
    where: { id },
    include: {
      usuarios: true,
      recolecciones: {
        include: {
          solicitud: {
            include: {
              usuario: {
                select: { nombre: true, email: true, localidad: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });
}

export async function createEmpresa(data: {
  nombre: string;
  nit?: string;
  contactoEmail?: string;
  contactoTel?: string;
}) {
  return prisma.empresaRecolectora.create({
    data
  });
}

export async function updateEmpresa(id: string, data: {
  nombre?: string;
  nit?: string;
  contactoEmail?: string;
  contactoTel?: string;
}) {
  return prisma.empresaRecolectora.update({
    where: { id },
    data
  });
}

export async function deleteEmpresa(id: string) {
  // Primero desasignar usuarios de la empresa
  await prisma.usuario.updateMany({
    where: { empresaId: id },
    data: { empresaId: null }
  });
  
  // Luego eliminar recolecciones
  await prisma.recoleccion.deleteMany({
    where: { empresaId: id }
  });
  
  // Finalmente eliminar la empresa
  return prisma.empresaRecolectora.delete({
    where: { id }
  });
}

// ==================== ESTADÍSTICAS GENERALES ====================

export async function getAdminStats() {
  const [
    totalUsuarios,
    totalEmpresas,
    usuariosActivos,
    solicitudesPendientes,
    recoleccionesHoy,
    puntosGeneradosHoy
  ] = await Promise.all([
    prisma.usuario.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.empresaRecolectora.count(),
    prisma.usuario.count({ 
      where: { 
        role: { not: 'ADMIN' },
        suscripcion: { activa: true }
      }
    }),
    prisma.solicitudRecoleccion.count({
      where: { estado: { in: ['PENDIENTE', 'PROGRAMADA'] } }
    }),
    prisma.recoleccion.count({
      where: {
        fecha: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.puntaje.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: { puntos: true }
    })
  ]);

  return {
    totalUsuarios,
    totalEmpresas,
    usuariosActivos,
    solicitudesPendientes,
    recoleccionesHoy,
    puntosGeneradosHoy: puntosGeneradosHoy._sum.puntos || 0
  };
}
