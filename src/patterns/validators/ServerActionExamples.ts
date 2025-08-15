/**
 * Ejemplos de integración de validaciones en Server Actions de Next.js
 * 
 * Este archivo muestra cómo usar las validaciones del backend en las
 * acciones de servidor para asegurar la integridad de los datos
 */

'use server';

import { prisma } from '@/lib/prisma';
import { 
  validateData
} from './EcoReciclajeValidators';
import type { ValidationResult } from './ValidationChain';
import { revalidatePath } from 'next/cache';

/**
 * Acción para registro de usuario con validaciones completas
 */
export async function registrarUsuario(formData: FormData) {
  try {
    // 1. Extraer datos del formulario
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      nombre: formData.get('nombre'),
      telefono: formData.get('telefono'),
      localidad: formData.get('localidad'),
      direccion: formData.get('direccion')
    };

    // 2. Validar usando nuestro patrón de validación
    const validationResult = await validateData('usuario', rawData, prisma);

    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Datos inválidos',
        details: validationResult.errors,
        warnings: validationResult.warnings
      };
    }

    // 3. Validación adicional para confirmar contraseña
    if (rawData.password !== rawData.confirmPassword) {
      return {
        success: false,
        error: 'Las contraseñas no coinciden',
        details: [{
          field: 'confirmPassword',
          message: 'Las contraseñas no coinciden',
          code: 'PASSWORD_MISMATCH'
        }]
      };
    }

    // 4. Hashear contraseña
    const passwordHash = await hashPassword(rawData.password as string);

    // 5. Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email: rawData.email as string,
        passwordHash,
        nombre: rawData.nombre as string,
        telefono: rawData.telefono as string || null,
        localidad: rawData.localidad as string || null,
        direccion: rawData.direccion as string || null,
        role: 'USUARIO'
        // puntos: 0 // No incluir puntos directo, manejar con relación
      }
    });

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: usuario.id,
      warnings: validationResult.warnings
    };

  } catch (error) {
    console.error('Error en registro de usuario:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
      details: [{
        field: 'general',
        message: 'Error inesperado durante el registro',
        code: 'INTERNAL_ERROR'
      }]
    };
  }
}

/**
 * Acción para crear solicitud de recolección con validaciones
 */
export async function crearSolicitudRecoleccion(usuarioId: string, formData: FormData) {
  try {
    // 1. Extraer y preparar datos
    const rawData = {
      usuarioId,
      tipoResiduo: formData.get('tipoResiduo'),
      fechaRecoleccion: formData.get('fechaRecoleccion') ? 
        new Date(formData.get('fechaRecoleccion') as string) : null,
      direccion: formData.get('direccion'),
      descripcion: formData.get('descripcion'),
      cantidad: formData.get('cantidad') ? 
        parseFloat(formData.get('cantidad') as string) : null
    };

    // 2. Validar datos
    const validationResult = await validateData('solicitud', rawData, prisma);

    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Datos de solicitud inválidos',
        details: validationResult.errors,
        warnings: validationResult.warnings
      };
    }

    // 3. Crear solicitud en base de datos
    const solicitud = await prisma.solicitudRecoleccion.create({
      data: {
        usuarioId,
        tipoResiduo: rawData.tipoResiduo as 'ORGANICO' | 'INORGANICO' | 'PELIGROSO',
        fechaSolicitada: new Date(),
        estado: 'PENDIENTE',
        notas: rawData.descripcion as string || null
      }
    });

    // 4. Revalidar rutas relacionadas
    revalidatePath('/dashboard/recolecciones');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Solicitud creada exitosamente',
      solicitudId: solicitud.id,
      warnings: validationResult.warnings
    };

  } catch (error) {
    console.error('Error creando solicitud:', error);
    return {
      success: false,
      error: 'Error al crear la solicitud',
      details: [{
        field: 'general',
        message: 'Error inesperado al crear la solicitud',
        code: 'INTERNAL_ERROR'
      }]
    };
  }
}

/**
 * Acción para login con validaciones
 */
export async function loginUsuario(formData: FormData) {
  try {
    // 1. Extraer datos
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    // 2. Validar formato básico
    const validationResult = await validateData('login', rawData, prisma);

    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Datos de login inválidos',
        details: validationResult.errors
      };
    }

    // 3. Verificar usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { email: rawData.email as string }
    });

    if (!usuario) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        details: [{
          field: 'email',
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        }]
      };
    }

    // 4. Verificar contraseña
    const passwordValid = await verifyPassword(rawData.password as string, usuario.passwordHash);

    if (!passwordValid) {
      return {
        success: false,
        error: 'Credenciales inválidas',
        details: [{
          field: 'password',
          message: 'Contraseña incorrecta',
          code: 'INVALID_PASSWORD'
        }]
      };
    }

    // 5. Aquí crearías la sesión/JWT
    // setSession(usuario);
    
    return {
      success: true,
      message: 'Login exitoso',
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        role: usuario.role
      }
    };

  } catch (error) {
    console.error('Error en login:', error);
    return {
      success: false,
      error: 'Error interno de autenticación'
    };
  }
}

/**
 * Acción para configurar empresa con validaciones
 */
export async function configurarEmpresa(formData: FormData) {
  try {
    const rawData = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      direccion: formData.get('direccion'),
      cuit: formData.get('cuit')
    };

    // Validar datos
    const validationResult = await validateData('empresa', rawData, prisma);

    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Datos de empresa inválidos',
        details: validationResult.errors,
        warnings: validationResult.warnings
      };
    }

    // Crear empresa
    const empresa = await prisma.empresaRecolectora.create({
      data: {
        nombre: rawData.nombre as string,
        // email: rawData.email as string, // Cuando esté disponible en schema
        // telefono: rawData.telefono as string,
        // direccion: rawData.direccion as string,
        // cuit: rawData.cuit as string
      }
    });

    revalidatePath('/dashboard/admin/empresas');

    return {
      success: true,
      message: 'Empresa configurada exitosamente',
      empresaId: empresa.id,
      warnings: validationResult.warnings
    };

  } catch (error) {
    console.error('Error configurando empresa:', error);
    return {
      success: false,
      error: 'Error al configurar la empresa'
    };
  }
}

/**
 * Acción para configurar horario orgánico con validaciones
 */
export async function configurarHorarioOrganico(formData: FormData) {
  try {
    const rawData = {
      localidad: formData.get('localidad'),
      dia: formData.get('dia')
    };

    // Validar datos
    const validationResult = await validateData('horario', rawData, prisma);

    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Datos de horario inválidos',
        details: validationResult.errors
      };
    }

    // Verificar si ya existe para evitar duplicados
    const existente = await prisma.horarioOrganico.findUnique({
      where: { localidad: rawData.localidad as string }
    });

    if (existente) {
      // Actualizar existente
      await prisma.horarioOrganico.update({
        where: { localidad: rawData.localidad as string },
        data: {
          dia: rawData.dia as 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO'
        }
      });
    } else {
      // Crear nuevo
      await prisma.horarioOrganico.create({
        data: {
          localidad: rawData.localidad as string,
          dia: rawData.dia as 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO'
        }
      });
    }

    revalidatePath('/dashboard/admin/horarios');

    return {
      success: true,
      message: 'Horario configurado exitosamente',
      warnings: validationResult.warnings
    };

  } catch (error) {
    console.error('Error configurando horario:', error);
    return {
      success: false,
      error: 'Error al configurar el horario'
    };
  }
}

/**
 * Función helper para formatear errores de validación para el frontend
 */
export function formatValidationErrors(errors: ValidationResult['errors']): Record<string, string> {
  return errors.reduce((acc: Record<string, string>, error: { field: string; message: string }) => {
    acc[error.field] = error.message;
    return acc;
  }, {});
}

/**
 * Función helper para manejar respuestas de validación en componentes
 */
export function handleValidationResponse(
  response: { 
    success: boolean; 
    error?: string; 
    details?: ValidationResult['errors'];
    warnings?: string[];
    [key: string]: unknown;
  },
  setErrors: (errors: Record<string, string>) => void,
  setWarnings?: (warnings: string[]) => void
) {
  if (!response.success) {
    if (response.details) {
      setErrors(formatValidationErrors(response.details));
    } else {
      setErrors({ general: response.error || 'Error desconocido' });
    }
  }

  if (response.warnings && setWarnings) {
    setWarnings(response.warnings);
  }

  return response.success;
}

// Simulación de funciones de hash (implementar según tu sistema de auth)
async function hashPassword(password: string): Promise<string> {
  // En producción, usar bcrypt o similar
  return `hashed_${password}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // En producción, usar bcrypt.compare o similar
  return hash === `hashed_${password}`;
}
