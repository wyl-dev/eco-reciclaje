'use server'

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  crearSolicitudRecoleccion,
  getSolicitudesUsuario,
  cancelarSolicitud,
  configurarHorarioOrganico,
  getHorariosOrganicos
} from '@/lib/recolecciones';
import type { ResiduoTipo, FrecuenciaInorganico, FrecuenciaPeligroso, SolicitudEstado } from '@prisma/client';
import { createSolicitudRecoleccionValidator, createHorarioOrganicoValidator } from '@/patterns/validators/EcoReciclajeValidators';
import { prisma } from '@/lib/prisma';

// ==================== ACCIONES PARA USUARIOS ====================

export async function crearSolicitudAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect('/auth/login');
    }

    const tipoResiduo = formData.get('tipoResiduo') as ResiduoTipo;
    const fechaSolicitada = new Date(formData.get('fechaSolicitada') as string);
    const notas = formData.get('notas') as string || undefined;
    
    // Obtener frecuencias según el tipo de residuo
    let frecuenciaInorg: FrecuenciaInorganico | undefined;
    let frecuenciaPelig: FrecuenciaPeligroso | undefined;

    if (tipoResiduo === 'INORGANICO') {
      frecuenciaInorg = formData.get('frecuenciaInorg') as FrecuenciaInorganico;
    }

    if (tipoResiduo === 'PELIGROSO') {
      frecuenciaPelig = formData.get('frecuenciaPelig') as FrecuenciaPeligroso;
    }

    // Datos para validación
    const solicitudData = {
      usuarioId: user.id,
      tipoResiduo,
      fechaSolicitada: formData.get('fechaSolicitada') as string,
      frecuenciaInorg,
      frecuenciaPelig,
      localidad: user.localidad || undefined,
      direccion: user.direccion || undefined,
      notas
    };

    // Usar validador con patrones de diseño
    const validator = createSolicitudRecoleccionValidator(prisma);
    const validationResult = await validator.validate({
      data: solicitudData,
      user: {
        id: user.id,
        role: user.role,
        email: user.email || ''
      },
      metadata: { source: 'create_solicitud' }
    });


    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.errors.map(e => e.message).join(', '),
        fieldErrors: validationResult.errors.reduce((acc, error) => {
          acc[error.field] = error.message;
          return acc;
        }, {} as Record<string, string>)
      };
    }

    // Procesar advertencias si las hay
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.warn('Solicitud warnings:', validationResult.warnings);
    }

    const solicitud = await crearSolicitudRecoleccion({
      usuarioId: user.id,
      tipoResiduo,
      fechaSolicitada,
      frecuenciaInorg,
      frecuenciaPelig,
      localidad: user.localidad || undefined,
      notas
    });

    return { 
      success: true, 
      message: 'Solicitud creada exitosamente',
      solicitud: {
        id: solicitud.id,
        tipoResiduo: solicitud.tipoResiduo,
        estado: solicitud.estado,
        fechaSolicitada: solicitud.fechaSolicitada.toISOString(),
        fechaProgramada: solicitud.fechaProgramada?.toISOString()
      }
    };
  } catch (error) {
    console.error('Error creando solicitud:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al crear la solicitud'
    };
  }
}

export async function getMisSolicitudesAction(estado?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect('/auth/login');
    }

    const solicitudes = await getSolicitudesUsuario(
      user.id, 
      50, 
      estado && estado !== 'ALL' ? estado as SolicitudEstado : undefined
    );

    return { 
      success: true, 
      solicitudes: solicitudes.map(s => ({
        id: s.id,
        tipoResiduo: s.tipoResiduo,
        estado: s.estado,
        fechaSolicitada: s.fechaSolicitada.toISOString(),
        fechaProgramada: s.fechaProgramada?.toISOString(),
        notas: s.notas,
        frecuenciaInorg: s.frecuenciaInorganico,
        frecuenciaPelig: s.frecuenciaPeligroso,
        recoleccion: s.recoleccion ? {
          id: s.recoleccion.id,
          fecha: s.recoleccion.fecha.toISOString(),
          pesoKg: s.recoleccion.pesoKg,
          separadoOk: s.recoleccion.separadoOk,
          puntosGenerados: s.recoleccion.puntosGenerados,
          empresa: s.recoleccion.empresa ? {
            nombre: s.recoleccion.empresa.nombre
          } : null,
          puntos: s.recoleccion.puntaje?.puntos
        } : null
      }))
    };
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    return { 
      success: false, 
      message: 'Error al cargar las solicitudes'
    };
  }
}

export async function cancelarSolicitudAction(solicitudId: string, motivo?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect('/auth/login');
    }

    await cancelarSolicitud(solicitudId, motivo);

    return { 
      success: true, 
      message: 'Solicitud cancelada exitosamente'
    };
  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    return { 
      success: false, 
      message: 'Error al cancelar la solicitud'
    };
  }
}

// ==================== ACCIONES PARA ADMINISTRADORES ====================

export async function configurarHorarioOrganicoAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'No tienes permisos para esta acción'
      };
    }

    const localidad = formData.get('localidad') as string;
    const dia = formData.get('dia') as string;

    // Datos para validación
    const horarioData = {
      localidad,
      dia
    };

    // Usar validador con patrones de diseño
    const validator = createHorarioOrganicoValidator();
    const validationResult = await validator.validate({
      data: horarioData,
      user: {
        id: user.id,
        role: user.role,
        email: user.email || ''
      },
      metadata: { source: 'configure_horario' }
    });

    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.errors.map(e => e.message).join(', '),
        fieldErrors: validationResult.errors.reduce((acc, error) => {
          acc[error.field] = error.message;
          return acc;
        }, {} as Record<string, string>)
      };
    }

    // Procesar advertencias si las hay
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.warn('Horario warnings:', validationResult.warnings);
    }

    await configurarHorarioOrganico(localidad, dia);

    return { 
      success: true, 
      message: `Horario configurado: ${localidad} - ${dia}s`
    };
  } catch (error) {
    console.error('Error configurando horario:', error);
    return { 
      success: false, 
      message: 'Error al configurar el horario'
    };
  }
}

export async function getHorariosOrganicosAction() {
  try {
    const horarios = await getHorariosOrganicos();

    return { 
      success: true, 
      horarios: horarios.map(h => ({
        id: h.id,
        localidad: h.localidad,
        dia: h.dia
      }))
    };
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    return { 
      success: false, 
      message: 'Error al cargar los horarios'
    };
  }
}
