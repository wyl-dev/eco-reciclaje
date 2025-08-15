'use server'

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function actualizarPerfilAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { 
        success: false, 
        message: 'No autenticado'
      };
    }

    // Extraer datos del formulario
    const perfilData = {
      nombre: (formData.get('nombre') ?? '').toString(),
      telefono: (formData.get('telefono') ?? '').toString(),
      direccion: (formData.get('direccion') ?? '').toString(),
      localidad: (formData.get('localidad') ?? '').toString()
    };

    // Actualizar perfil en la base de datos
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        nombre: perfilData.nombre,
        telefono: perfilData.telefono,
        direccion: perfilData.direccion,
        localidad: perfilData.localidad
      }
    });

    return { 
      success: true, 
      message: 'Perfil actualizado exitosamente',
      user: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        telefono: usuarioActualizado.telefono
      }
    };
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al actualizar el perfil'
    };
  }
}

export async function cambiarPasswordAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { 
        success: false, 
        message: 'No autenticado'
      };
    }

    // Extraer datos del formulario
    const passwordData = {
      passwordActual: (formData.get('passwordActual') ?? '').toString(),
      passwordNueva: (formData.get('passwordNueva') ?? '').toString(),
      confirmarPassword: (formData.get('confirmarPassword') ?? '').toString()
    };

    // Crear un validador básico (usando uno existente como ejemplo)
    // Validaciones básicas sin usar el validador complejo por ahora
    if (!passwordData.passwordActual) {
      return {
        success: false,
        message: 'Contraseña actual es requerida',
        fieldErrors: { passwordActual: 'Contraseña actual es requerida' } as Record<string, string>
      };
    }

    if (!passwordData.passwordNueva || passwordData.passwordNueva.length < 6) {
      return {
        success: false,
        message: 'Nueva contraseña debe tener al menos 6 caracteres',
        fieldErrors: { passwordNueva: 'Nueva contraseña debe tener al menos 6 caracteres' } as Record<string, string>
      };
    }

    if (passwordData.passwordNueva !== passwordData.confirmarPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden',
        fieldErrors: { confirmarPassword: 'Las contraseñas no coinciden' } as Record<string, string>
      };
    }

    // Obtener usuario actual con password
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: user.id }
    });

    if (!usuarioCompleto) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    // Verificar password actual
    const passwordValida = await bcrypt.compare(passwordData.passwordActual, usuarioCompleto.passwordHash);
    if (!passwordValida) {
      return {
        success: false,
        message: 'Contraseña actual incorrecta',
        fieldErrors: { passwordActual: 'Contraseña actual incorrecta' } as Record<string, string>
      };
    }

    // Encriptar nueva password
    const hashedPassword = await bcrypt.hash(passwordData.passwordNueva, 10);

    // Actualizar password en la base de datos
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword
      }
    });

    return { 
      success: true, 
      message: 'Contraseña cambiada exitosamente'
    };
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al cambiar la contraseña'
    };
  }
}
