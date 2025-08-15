'use server'

import { getCurrentUser } from '@/lib/auth';
import { createEmpresaValidator } from '@/patterns/validators/EcoReciclajeValidators';
import { prisma } from '@/lib/prisma';

export async function crearEmpresaAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'No tienes permisos para esta acción'
      };
    }

    // Extraer datos del formulario
    const empresaData = {
      nombre: (formData.get('nombre') ?? '').toString(),
      nit: (formData.get('nit') ?? '').toString() || undefined,
      contactoEmail: (formData.get('contactoEmail') ?? '').toString() || undefined,
      contactoTel: (formData.get('contactoTel') ?? '').toString() || undefined
    };

    // Usar validador con patrones de diseño
    const validator = createEmpresaValidator(prisma);
    const validationResult = await validator.validate({
      data: empresaData,
      user: {
        id: user.id,
        role: user.role,
        email: user.email || ''
      },
      metadata: { source: 'create_empresa' }
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
      console.warn('Empresa warnings:', validationResult.warnings);
    }

    // Crear empresa en la base de datos
    const empresa = await prisma.empresaRecolectora.create({
      data: {
        nombre: empresaData.nombre,
        nit: empresaData.nit,
        contactoEmail: empresaData.contactoEmail,
        contactoTel: empresaData.contactoTel
      }
    });

    return { 
      success: true, 
      message: 'Empresa creada exitosamente',
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        nit: empresa.nit,
        contactoEmail: empresa.contactoEmail
      }
    };
  } catch (error) {
    console.error('Error creando empresa:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al crear la empresa'
    };
  }
}

export async function actualizarEmpresaAction(empresaId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'No tienes permisos para esta acción'
      };
    }

    // Extraer datos del formulario
    const empresaData = {
      id: empresaId,
      nombre: (formData.get('nombre') ?? '').toString(),
      nit: (formData.get('nit') ?? '').toString() || undefined,
      contactoEmail: (formData.get('contactoEmail') ?? '').toString() || undefined,
      contactoTel: (formData.get('contactoTel') ?? '').toString() || undefined
    };

    // Usar validador con patrones de diseño
    const validator = createEmpresaValidator(prisma);
    const validationResult = await validator.validate({
      data: empresaData,
      user: {
        id: user.id,
        role: user.role,
        email: user.email || ''
      },
      metadata: { source: 'update_empresa', empresaId }
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

    // Actualizar empresa en la base de datos
    const empresa = await prisma.empresaRecolectora.update({
      where: { id: empresaId },
      data: {
        nombre: empresaData.nombre,
        nit: empresaData.nit,
        contactoEmail: empresaData.contactoEmail,
        contactoTel: empresaData.contactoTel
      }
    });

    return { 
      success: true, 
      message: 'Empresa actualizada exitosamente',
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        nit: empresa.nit,
        contactoEmail: empresa.contactoEmail
      }
    };
  } catch (error) {
    console.error('Error actualizando empresa:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al actualizar la empresa'
    };
  }
}

export async function getEmpresasAction() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'No tienes permisos para esta acción'
      };
    }

    const empresas = await prisma.empresaRecolectora.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { recolecciones: true }
        }
      }
    });

    return { 
      success: true, 
      empresas: empresas.map(e => ({
        id: e.id,
        nombre: e.nombre,
        nit: e.nit,
        contactoEmail: e.contactoEmail,
        contactoTel: e.contactoTel,
        totalRecolecciones: e._count.recolecciones,
        fechaCreacion: e.createdAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error obteniendo empresas:', error);
    return { 
      success: false, 
      message: 'Error al cargar las empresas'
    };
  }
}
