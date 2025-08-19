'use server'

import { getCurrentUser } from '@/lib/auth';
import { getSolicitudesAdmin } from '@/lib/recolecciones';
import type { SolicitudEstado } from '@prisma/client';

export async function getSolicitudesAdminAction(estado?: string, localidad?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'No tienes permisos para esta acción'
      };
    }

    const solicitudes = await getSolicitudesAdmin(
      estado && estado !== 'ALL' ? estado as SolicitudEstado : undefined,
      localidad && localidad !== 'ALL' ? localidad : undefined,
      100
    );

    return { 
      success: true, 
      solicitudes: solicitudes.map(s => ({
        id: s.id,
        tipoResiduo: s.tipoResiduo,
        estado: s.estado,
        fechaSolicitada: s.fechaSolicitada.toISOString(),
        fechaProgramada: s.fechaProgramada?.toISOString(),
        localidad: s.localidad,
        notas: s.notas,
  frecuenciaInorg: s.frecuenciaInorganico,
  frecuenciaPelig: s.frecuenciaPeligroso,
        usuario: {
          nombre: s.usuario.nombre,
          email: s.usuario.email,
          telefono: s.usuario.telefono,
          direccion: s.usuario.direccion
        }
      }))
    };
  } catch (error) {
    console.error('Error obteniendo solicitudes admin:', error);
    return { 
      success: false, 
      message: 'Error al cargar las solicitudes'
    };
  }
}
