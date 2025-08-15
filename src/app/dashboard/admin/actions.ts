"use server";

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { 
  getAllUsers, 
  getAllEmpresas, 
  updateUserStatus, 
  updateUserRole, 
  deleteUser,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getAdminStats
} from '@/lib/admin';
import { 
  getConfigPuntos,
  getAllConfigPuntos,
  createConfigPuntos,
  updateConfigPuntos,
  deleteConfigPuntos,
  getRankingUsuarios,
  getEstadisticasPuntos,
  asignarBonificacion,
  asignarPenalizacion,
  getPuntosUsuario
} from '@/lib/puntos';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autenticado');
  
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    throw new Error('Acceso denegado - Solo administradores');
  }
  
  return payload;
}

// ==================== ACCIONES DE USUARIOS ====================

export async function getUsersAction(page = 1, role?: 'ADMIN' | 'USUARIO' | 'EMPRESA') {
  try {
    await verifyAdmin();
    return await getAllUsers(page, 20, role);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error obteniendo usuarios');
  }
}

export async function toggleUserStatusAction(userId: string, active: boolean) {
  try {
    await verifyAdmin();
    await updateUserStatus(userId, active);
    revalidatePath('/dashboard/admin/usuarios');
    return { success: true, message: `Usuario ${active ? 'activado' : 'desactivado'} correctamente` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error actualizando usuario' };
  }
}

export async function changeUserRoleAction(userId: string, role: 'ADMIN' | 'USUARIO' | 'EMPRESA') {
  try {
    await verifyAdmin();
    await updateUserRole(userId, role);
    revalidatePath('/dashboard/admin/usuarios');
    return { success: true, message: 'Rol actualizado correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error actualizando rol' };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await verifyAdmin();
    await deleteUser(userId);
    revalidatePath('/dashboard/admin/usuarios');
    return { success: true, message: 'Usuario eliminado correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error eliminando usuario' };
  }
}

// ==================== ACCIONES DE EMPRESAS ====================

export async function getEmpresasAction(page = 1) {
  try {
    await verifyAdmin();
    return await getAllEmpresas(page, 20);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error obteniendo empresas');
  }
}

export async function createEmpresaAction(data: FormData) {
  try {
    await verifyAdmin();
    
    const empresaData = {
      nombre: data.get('nombre')?.toString() || '',
      nit: data.get('nit')?.toString() || undefined,
      contactoEmail: data.get('contactoEmail')?.toString() || undefined,
      contactoTel: data.get('contactoTel')?.toString() || undefined,
    };

    if (!empresaData.nombre) {
      return { success: false, message: 'El nombre es obligatorio' };
    }

    await createEmpresa(empresaData);
    revalidatePath('/dashboard/admin/empresas');
    return { success: true, message: 'Empresa creada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error creando empresa' };
  }
}

export async function updateEmpresaAction(empresaId: string, data: FormData) {
  try {
    await verifyAdmin();
    
    const empresaData = {
      nombre: data.get('nombre')?.toString() || undefined,
      nit: data.get('nit')?.toString() || undefined,
      contactoEmail: data.get('contactoEmail')?.toString() || undefined,
      contactoTel: data.get('contactoTel')?.toString() || undefined,
    };

    await updateEmpresa(empresaId, empresaData);
    revalidatePath('/dashboard/admin/empresas');
    return { success: true, message: 'Empresa actualizada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error actualizando empresa' };
  }
}

export async function deleteEmpresaAction(empresaId: string) {
  try {
    await verifyAdmin();
    await deleteEmpresa(empresaId);
    revalidatePath('/dashboard/admin/empresas');
    return { success: true, message: 'Empresa eliminada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error eliminando empresa' };
  }
}

// ==================== ESTADÍSTICAS ====================

export async function getAdminStatsAction() {
  try {
    await verifyAdmin();
    return await getAdminStats();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error obteniendo estadísticas');
  }
}

// ==================== ACCIONES SISTEMA DE PUNTOS ====================

export async function getConfigPuntosAction() {
  try {
    await verifyAdmin();
    const [configActiva, todasConfig, estadisticas] = await Promise.all([
      getConfigPuntos(),
      getAllConfigPuntos(),
      getEstadisticasPuntos()
    ]);
    return { configActiva, todasConfig, estadisticas };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error obteniendo configuración');
  }
}

export async function createConfigPuntosAction(data: FormData) {
  try {
    await verifyAdmin();
    
    const configData = {
      descripcion: data.get('descripcion')?.toString() || '',
      expresion: data.get('expresion')?.toString(),
      base: parseInt(data.get('base')?.toString() || '10'),
      factorPeso: parseInt(data.get('factorPeso')?.toString() || '2'),
      factorSeparado: parseInt(data.get('factorSeparado')?.toString() || '5'),
    };

    if (!configData.descripcion) {
      return { success: false, message: 'La descripción es obligatoria' };
    }

    await createConfigPuntos(configData);
    revalidatePath('/dashboard/admin/puntos');
    return { success: true, message: 'Configuración de puntos creada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error creando configuración' };
  }
}

export async function updateConfigPuntosAction(configId: string, data: FormData) {
  try {
    await verifyAdmin();
    
    const configData = {
      descripcion: data.get('descripcion')?.toString(),
      expresion: data.get('expresion')?.toString(),
      base: data.get('base') ? parseInt(data.get('base')?.toString() || '0') : undefined,
      factorPeso: data.get('factorPeso') ? parseInt(data.get('factorPeso')?.toString() || '0') : undefined,
      factorSeparado: data.get('factorSeparado') ? parseInt(data.get('factorSeparado')?.toString() || '0') : undefined,
      activo: data.get('activo') === 'true'
    };

    await updateConfigPuntos(configId, configData);
    revalidatePath('/dashboard/admin/puntos');
    return { success: true, message: 'Configuración actualizada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error actualizando configuración' };
  }
}

export async function deleteConfigPuntosAction(configId: string) {
  try {
    await verifyAdmin();
    await deleteConfigPuntos(configId);
    revalidatePath('/dashboard/admin/puntos');
    return { success: true, message: 'Configuración eliminada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error eliminando configuración' };
  }
}

export async function getRankingUsuariosAction() {
  try {
    await verifyAdmin();
    return await getRankingUsuarios(50);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error obteniendo ranking');
  }
}

export async function asignarBonificacionAction(data: FormData) {
  try {
    await verifyAdmin();
    
    const usuarioId = data.get('usuarioId')?.toString();
    const puntos = parseInt(data.get('puntos')?.toString() || '0');
    const motivo = data.get('motivo')?.toString();

    if (!usuarioId || !puntos || !motivo) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    await asignarBonificacion({ usuarioId, puntos, motivo });
    revalidatePath('/dashboard/admin/puntos');
    return { success: true, message: 'Bonificación asignada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error asignando bonificación' };
  }
}

export async function asignarPenalizacionAction(data: FormData) {
  try {
    await verifyAdmin();
    
    const usuarioId = data.get('usuarioId')?.toString();
    const puntos = parseInt(data.get('puntos')?.toString() || '0');
    const motivo = data.get('motivo')?.toString();

    if (!usuarioId || !puntos || !motivo) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    await asignarPenalizacion({ usuarioId, puntos, motivo });
    revalidatePath('/dashboard/admin/puntos');
    return { success: true, message: 'Penalización aplicada correctamente' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Error aplicando penalización' };
  }
}

export async function getPuntosUsuarioAction(usuarioId: string) {
  try {
    await verifyAdmin();
    return await getPuntosUsuario(usuarioId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error obteniendo puntos del usuario');
  }
}
